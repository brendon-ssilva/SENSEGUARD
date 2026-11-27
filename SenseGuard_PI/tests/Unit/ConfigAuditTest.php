<?php

declare(strict_types=1);

namespace SenseGuard\Tests\Unit;

use SenseGuard\Core\Config;
use SenseGuard\Service\AuditLog;
use SenseGuard\Tests\TestCase;

final class ConfigAuditTest extends TestCase
{
    public function testDefaultsAreMergedWithLocalValues(): void
    {
        $config = Config::fromArray(['db' => ['name' => 'meu_banco'], 'app' => ['env' => 'development']]);

        $this->assertSame('meu_banco', $config->get('db.name'));
        $this->assertSame('127.0.0.1', $config->get('db.host'), 'padrão preservado');
        $this->assertSame('development', $config->get('app.env'));
        $this->assertSame(7200, $config->get('app.session_ttl'));
        $this->assertSame('x', $config->get('nao.existe', 'x'));
    }

    public function testLegacyFlatConfigIsStillAccepted(): void
    {
        $config = Config::fromArray(['host' => 'localhost', 'name' => 'senseguard', 'user' => 'app', 'pass' => 'segredo']);

        $this->assertSame('localhost', $config->get('db.host'));
        $this->assertSame('app', $config->get('db.user'));
        $this->assertSame('production', $config->get('app.env'), 'sem env explícito, assume produção');
    }

    public function testAuditDiffListsOnlyChangedColumns(): void
    {
        $before = ['nome' => 'Prensa', 'status' => 'operando', 'min_limite' => '10.0000', 'senha' => 'a'];
        $after = ['nome' => 'Prensa 2', 'status' => 'operando', 'min_limite' => 10.0, 'senha' => 'b'];

        $this->assertSame(['nome' => ['de' => 'Prensa', 'para' => 'Prensa 2']], AuditLog::diff($before, $after));
    }

    public function testAuditSnapshotDropsSensitiveColumns(): void
    {
        $this->assertSame(['nome' => 'Ana'], AuditLog::snapshot(['nome' => 'Ana', 'senha' => 'hash']));
    }
}
