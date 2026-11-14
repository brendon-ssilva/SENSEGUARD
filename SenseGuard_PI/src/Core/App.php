<?php

declare(strict_types=1);

namespace SenseGuard\Core;

use PDO;
use PDOException;
use SenseGuard\Auth\Authenticator;
use SenseGuard\Auth\Csrf;
use SenseGuard\Auth\LoginThrottle;
use SenseGuard\Auth\NativeSession;
use SenseGuard\Auth\SessionStore;
use SenseGuard\Http\ApiException;
use SenseGuard\Http\Request;
use SenseGuard\Http\Response;
use Throwable;

/**
 * Ponto de montagem da aplicação: configuração, banco, sessão e autenticação,
 * criados sob demanda. Também executa os endpoints JSON com tratamento de erros único.
 */
final class App
{
    public const VERSION = '3.0.0';

    private ?PDO $pdo = null;
    private ?SessionStore $session = null;
    private ?Csrf $csrf = null;
    private ?Authenticator $authenticator = null;

    public function __construct(
        private Config $config,
        private string $baseDir,
    ) {
    }

    public static function boot(): self
    {
        $baseDir = dirname(__DIR__, 2);
        $config = Config::load($baseDir);
        date_default_timezone_set((string) $config->get('app.timezone', 'America/Sao_Paulo'));

        return new self($config, $baseDir);
    }

    /**
     * Executa um endpoint JSON: monta a aplicação, chama o handler e converte
     * qualquer exceção em uma resposta JSON adequada.
     *
     * @param callable(self, Request): Response $handler
     */
    public static function run(callable $handler): never
    {
        try {
            $response = $handler(self::boot(), Request::fromGlobals());
        } catch (ApiException $e) {
            $response = Response::error($e->status(), $e->getMessage(), $e->field(), $e->headers());
        } catch (ConfigurationException $e) {
            $response = Response::error(500, $e->getMessage());
        } catch (PDOException $e) {
            $response = self::fromDatabaseError($e);
        } catch (Throwable $e) {
            error_log('SenseGuard erro: ' . $e::class . ': ' . $e->getMessage() . ' em ' . $e->getFile() . ':' . $e->getLine());
            $response = Response::error(500, 'Ocorreu um erro interno ao processar a requisição.');
        }

        $response->send();
        exit;
    }

    private static function fromDatabaseError(PDOException $e): Response
    {
        error_log('SenseGuard PDO: ' . $e->getMessage());

        $driverCode = isset($e->errorInfo[1]) ? (int) $e->errorInfo[1] : 0;

        return match (true) {
            $driverCode === 1062 => Response::error(409, 'Já existe um registro com estes dados (valor duplicado).'),
            $driverCode === 1451 => Response::error(409, 'Não é possível concluir: existem registros vinculados a este item (ordens de serviço ou medições).'),
            $driverCode === 1452 => Response::error(409, 'O registro relacionado informado não existe.'),
            $driverCode === 3819 || $driverCode === 4025 => Response::error(422, 'Um dos valores informados não é permitido.'),
            (string) $e->getCode() === '23000' => Response::error(409, 'A operação não pode ser concluída porque há dados duplicados ou registros vinculados.'),
            default => Response::error(500, 'Não foi possível processar a operação no banco de dados.'),
        };
    }

    public function config(): Config
    {
        return $this->config;
    }

    public function baseDir(): string
    {
        return $this->baseDir;
    }

    public function isDevelopment(): bool
    {
        return $this->config->get('app.env') === 'development';
    }

    public function pdo(): PDO
    {
        return $this->pdo ??= Database::connect($this->config);
    }

    public function session(): SessionStore
    {
        if ($this->session === null) {
            $secure = $this->config->get('app.secure_cookies');
            $this->session = new NativeSession(
                (int) $this->config->get('app.session_ttl', 7200),
                is_bool($secure) ? $secure : null
            );
        }

        return $this->session;
    }

    public function csrf(): Csrf
    {
        return $this->csrf ??= new Csrf($this->session());
    }

    public function authenticator(): Authenticator
    {
        if ($this->authenticator === null) {
            $pdo = $this->pdo();
            $this->authenticator = new Authenticator(
                $pdo,
                $this->session(),
                $this->csrf(),
                new LoginThrottle(
                    $pdo,
                    (int) $this->config->get('security.login_window_seconds', 900),
                    (int) $this->config->get('security.login_max_per_email', 5),
                    (int) $this->config->get('security.login_max_per_ip', 20)
                ),
                (int) $this->config->get('app.session_ttl', 7200),
                !$this->isDevelopment()
            );
        }

        return $this->authenticator;
    }
}
