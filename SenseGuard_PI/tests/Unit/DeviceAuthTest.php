<?php

declare(strict_types=1);

namespace SenseGuard\Tests\Unit;

use InvalidArgumentException;
use PDO;
use PDOStatement;
use SenseGuard\Auth\DeviceAuth;
use SenseGuard\Auth\TokenCliOptions;
use SenseGuard\Auth\TokenPermissions;
use SenseGuard\Core\App;
use SenseGuard\Core\Config;
use SenseGuard\Http\ApiHandler;
use SenseGuard\Http\Request;
use SenseGuard\Tests\TestCase;

/** PDO double: verifies SQL parameters and HTTP dispatch, not MySQL execution. */
final class TokenFakePdo extends PDO
{
    public array $calls = [];
    public array $tokens = [];
    public array $sensors = [];

    public function __construct() {}

    public function prepare(string $query, array $options = []): PDOStatement|false
    {
        return new TokenFakeStatement($this, $query);
    }
}

final class TokenFakeStatement extends PDOStatement
{
    private array $rows = [];

    public function __construct(private TokenFakePdo $db, private string $sql) {}

    public function execute(?array $params = null): bool
    {
        $this->db->calls[] = [$this->sql, $params];
        if (str_contains($this->sql, 'FROM token_dispositivo')) {
            if (!str_contains($this->sql, 'ativo = 1')) {
                throw new \RuntimeException('Active-token filter missing');
            }
            $this->rows = array_values(array_filter($this->db->tokens, fn ($r) => $r['token_hash'] === $params[0] && $r['ativo'] === 1));
        } elseif (str_contains($this->sql, 'FROM `sensor`')) {
            if (!str_contains($this->sql, 'WHERE id_corporacao = ?')) {
                throw new \RuntimeException('Tenant filter missing');
            }
            $this->rows = array_values(array_filter($this->db->sensors, fn ($r) => $r['id_corporacao'] === $params[0]));
        } elseif (!str_contains($this->sql, 'UPDATE token_dispositivo SET ultimo_uso')) {
            throw new \RuntimeException('Unexpected SQL in test');
        }

        return true;
    }

    public function fetch(int $mode = PDO::FETCH_DEFAULT, int $cursorOrientation = PDO::FETCH_ORI_NEXT, int $cursorOffset = 0): mixed
    {
        return $this->rows[0] ?? false;
    }

    public function fetchAll(int $mode = PDO::FETCH_DEFAULT, mixed ...$args): array
    {
        return $this->rows;
    }
}

final class DeviceAuthTest extends TestCase
{
    private function db(string $permissions = 'readings:write,sensors:read', ?string $ips = null, int $active = 1): TokenFakePdo
    {
        $db = new TokenFakePdo();
        $db->tokens = [[
            'id_token' => 17, 'id_corporacao' => 42, 'nome' => 'fake gateway',
            'token_hash' => hash('sha256', str_repeat('a', 64)), 'ativo' => $active,
            'permissoes' => $permissions, 'ips_permitidos' => $ips,
        ]];
        return $db;
    }

    private function req(array $headers = [], string $ip = '10.0.0.5', string $method = 'GET', array $query = []): Request
    {
        return new Request($method, $query, ['REMOTE_ADDR' => $ip] + $headers);
    }

    public function testBothHeaderFormatsAuthenticateSeparatelyAndStoreOnlyHash(): void
    {
        foreach (['HTTP_X_DEVICE_TOKEN' => str_repeat('a', 64), 'HTTP_AUTHORIZATION' => 'Bearer ' . str_repeat('a', 64)] as $name => $value) {
            $db = $this->db();
            $identity = (new DeviceAuth($db))->authenticate($this->req([$name => $value]));
            $this->assertSame(17, $identity->tokenId);
            $this->assertSame(42, $identity->corporationId);
            $this->assertSame(['readings:write', 'sensors:read'], $identity->permissions);
            $this->assertSame([hash('sha256', str_repeat('a', 64))], $db->calls[0][1]);
            $this->assertSame(17, $db->calls[1][1][1]);
        }
    }

    public function testMissingMalformedAndAmbiguousTokensFailBeforeQuery(): void
    {
        $token = str_repeat('a', 64);
        foreach ([[], ['HTTP_X_DEVICE_TOKEN' => 'short'], ['HTTP_X_DEVICE_TOKEN' => str_repeat('a', 129)], ['HTTP_X_DEVICE_TOKEN' => $token . "\n"], ['HTTP_X_DEVICE_TOKEN' => $token, 'HTTP_AUTHORIZATION' => 'Bearer ' . $token]] as $headers) {
            $db = $this->db();
            $error = $this->assertApiError(fn () => (new DeviceAuth($db))->authenticate($this->req($headers)), 401);
            $this->assertSame('TOKEN_INVALIDO', $error->errorCode());
            $this->assertSame([], $db->calls);
        }
    }

    public function testUnknownAndRevokedTokensCannotUpdateLastUse(): void
    {
        foreach ([[$this->db(), str_repeat('b', 64)], [$this->db(active: 0), str_repeat('a', 64)]] as [$db, $token]) {
            $error = $this->assertApiError(fn () => (new DeviceAuth($db))->authenticate($this->req(['HTTP_X_DEVICE_TOKEN' => $token])), 401);
            $this->assertSame('TOKEN_INVALIDO', $error->errorCode());
            $this->assertSame(1, count($db->calls));
        }
    }

    public function testIpAndPermissionAreEnforcedBeforeLastUse(): void
    {
        $header = ['HTTP_X_DEVICE_TOKEN' => str_repeat('a', 64)];
        $db = $this->db(ips: '192.168.0.0/24');
        $error = $this->assertApiError(fn () => (new DeviceAuth($db))->authenticate($this->req($header)), 403);
        $this->assertSame('IP_NAO_PERMITIDO', $error->errorCode());
        $this->assertSame(1, count($db->calls));
        $db = $this->db('readings:write');
        $error = $this->assertApiError(fn () => (new DeviceAuth($db))->authenticate($this->req($header), TokenPermissions::SENSORS_READ), 403);
        $this->assertSame('PERMISSAO_NEGADA', $error->errorCode());
        $this->assertSame(1, count($db->calls));
    }

    public function testIntegrationRouteReturnsOnlyTenantSensorsAndSafeFields(): void
    {
        $db = $this->db('sensors:read');
        $sensor = ['id_sensor' => 11, 'id_corporacao' => 42, 'nome' => 'TMP-1', 'tipo' => 'temperatura', 'unidade' => 'C', 'min_limite' => '20', 'max_limite' => '80', 'valor_atual' => '55', 'id_maquina' => 9];
        $db->sensors = [$sensor, array_replace($sensor, ['id_sensor' => 12, 'id_corporacao' => 99])];
        $app = new App(Config::fromArray([]), __DIR__);
        $property = new \ReflectionProperty(App::class, 'pdo');
        $property->setValue($app, $db);
        $response = (new ApiHandler($app))->handle($this->req(['HTTP_X_DEVICE_TOKEN' => str_repeat('a', 64)], query: ['entity' => 'integration-sensors']));
        $this->assertSame(200, $response->status());
        $this->assertSame([['id' => '11', 'name' => 'TMP-1', 'type' => 'temperatura', 'unit' => 'C', 'minThreshold' => 20.0, 'maxThreshold' => 80.0]], $response->payload());
        $this->assertSame([42], $db->calls[2][1]);
        $this->assertTrue(str_contains($db->calls[2][0], 'LIMIT 100 OFFSET 0'));
    }

    public function testCliOptionsRejectTyposAndInvalidIdsOrIps(): void
    {
        $this->assertSame(['corporacao' => '42'], TokenCliOptions::parse(['--corporacao=42'], ['corporacao']));
        $this->assertSame(42, TokenCliOptions::positiveId('42'));
        $this->assertSame(['10.0.0.0/24'], TokenCliOptions::ips('10.0.0.0/24'));
        $this->assertSame([], TokenCliOptions::ips(null));
        foreach ([
            fn () => TokenCliOptions::parse(['--corporaco=42'], ['corporacao']),
            fn () => TokenCliOptions::parse(['--corporacao=42', '--corporacao=43'], ['corporacao']),
            fn () => TokenCliOptions::positiveId('0'),
            fn () => TokenCliOptions::positiveId('4294967296'),
            fn () => TokenCliOptions::ips(' '),
            fn () => TokenCliOptions::ips('10.0.0.0/33'),
            fn () => TokenCliOptions::ips(implode(',', array_map(fn ($i) => '192.168.100.' . $i, range(1, 50)))),
        ] as $callback) {
            try {
                $callback();
            } catch (InvalidArgumentException) {
                continue;
            }
            throw new \RuntimeException('Expected invalid option to fail');
        }
    }
}
