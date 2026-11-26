<?php

declare(strict_types=1);

namespace SenseGuard\Tests\Unit;

use SenseGuard\Auth\IpAllowList;
use SenseGuard\Auth\TokenPermissions;
use SenseGuard\Http\ApiException;
use SenseGuard\Http\Response;
use SenseGuard\Tests\TestCase;

final class TokenTest extends TestCase
{
    public function testPermissionsAreParsedNormalizedAndChecked(): void
    {
        $this->assertSame(['sensors:read', 'imports:write'], TokenPermissions::parse(' Sensors:Read, imports:write ,, sensors:read'));
        $this->assertSame([], TokenPermissions::parse(null));
        $this->assertSame([], TokenPermissions::parse('  '));

        $granted = TokenPermissions::parse('readings:write');
        $this->assertTrue(TokenPermissions::has($granted, TokenPermissions::READINGS_WRITE));
        $this->assertTrue(!TokenPermissions::has($granted, TokenPermissions::SENSORS_READ));
    }

    public function testUnknownPermissionsAreReported(): void
    {
        $this->assertSame([], TokenPermissions::unknown(['sensors:read', 'imports:cancel']));
        $this->assertSame(['admin:tudo'], TokenPermissions::unknown(['sensors:read', 'admin:tudo']));
    }

    public function testEmptyAllowListAllowsAnyOrigin(): void
    {
        $this->assertTrue(IpAllowList::allows([], '203.0.113.9'));
        $this->assertSame(['10.0.0.5', '192.168.1.0/24', '2001:db8::/32'], IpAllowList::parse('10.0.0.5, 192.168.1.0/24;2001:db8::/32 10.0.0.5'));
        $this->assertSame([], IpAllowList::parse(null));
    }

    public function testExactIpMatch(): void
    {
        $this->assertTrue(IpAllowList::matches('10.0.0.5', '10.0.0.5'));
        $this->assertTrue(!IpAllowList::matches('10.0.0.6', '10.0.0.5'));
        $this->assertTrue(!IpAllowList::matches('nao-e-ip', '10.0.0.5'));
        $this->assertTrue(!IpAllowList::matches('10.0.0.5', 'nao-e-ip'));
    }

    public function testCidrRanges(): void
    {
        $this->assertTrue(IpAllowList::matches('10.0.0.200', '10.0.0.0/24'));
        $this->assertTrue(!IpAllowList::matches('10.0.1.1', '10.0.0.0/24'));
        $this->assertTrue(IpAllowList::matches('192.168.1.130', '192.168.1.128/25'));
        $this->assertTrue(!IpAllowList::matches('192.168.1.1', '192.168.1.128/25'));
        $this->assertTrue(IpAllowList::matches('203.0.113.9', '0.0.0.0/0'));
        $this->assertTrue(!IpAllowList::matches('10.0.0.1', '10.0.0.0/33'), 'máscara maior que 32 bits');
        $this->assertTrue(!IpAllowList::matches('10.0.0.1', '10.0.0.0/x'), 'máscara inválida');
    }

    public function testIpv6AndMappedIpv4(): void
    {
        $this->assertTrue(IpAllowList::matches('2001:db8::1', '2001:db8::/32'));
        $this->assertTrue(!IpAllowList::matches('2001:db9::1', '2001:db8::/32'));
        $this->assertTrue(!IpAllowList::matches('2001:db8::1', '10.0.0.0/8'), 'famílias diferentes nunca combinam');
        $this->assertTrue(IpAllowList::matches('::ffff:10.0.0.5', '10.0.0.0/24'), 'IPv4 mapeado em IPv6');
        $this->assertTrue(IpAllowList::allows(['192.168.0.1', '10.0.0.0/8'], '10.9.8.7'));
        $this->assertTrue(!IpAllowList::allows(['192.168.0.1', '10.0.0.0/8'], '172.16.0.1'));
    }

    public function testErrorResponseCarriesStableCode(): void
    {
        $exception = new ApiException(403, 'Sem permissão.', null, [], 'PERMISSAO_NEGADA');
        $this->assertSame('PERMISSAO_NEGADA', $exception->errorCode());

        $response = Response::error($exception->status(), $exception->getMessage(), $exception->field(), $exception->headers(), $exception->errorCode());
        $this->assertSame(['success' => false, 'error' => 'Sem permissão.', 'code' => 'PERMISSAO_NEGADA'], $response->payload());

        $this->assertNull((new ApiException(400, 'x'))->errorCode());
    }
}
