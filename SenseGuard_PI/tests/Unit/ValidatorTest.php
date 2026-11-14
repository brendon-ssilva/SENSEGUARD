<?php

declare(strict_types=1);

namespace SenseGuard\Tests\Unit;

use SenseGuard\Domain\MachineStatus;
use SenseGuard\Tests\TestCase;
use SenseGuard\Validation\Validator;

final class ValidatorTest extends TestCase
{
    public function testRequiredTextIsTrimmed(): void
    {
        $this->assertSame('Prensa', Validator::text('  Prensa ', 'name', 'nome', 20, true));
    }

    public function testRequiredTextRejectsEmptyAndTooLong(): void
    {
        $this->assertApiError(fn () => Validator::text('   ', 'name', 'nome', 20, true), 422, 'name');
        $this->assertApiError(fn () => Validator::text(null, 'name', 'nome', 20, true), 422, 'name');
        $this->assertApiError(fn () => Validator::text(str_repeat('a', 21), 'name', 'nome', 20, true), 422, 'name');
    }

    public function testOptionalTextBecomesNullWhenEmpty(): void
    {
        $this->assertNull(Validator::text('', 'model', 'modelo', 10));
        $this->assertNull(Validator::text(null, 'model', 'modelo', 10));
        $this->assertNull(Validator::text('   ', 'model', 'modelo', 10));
        $this->assertSame('GA-90', Validator::text('GA-90', 'model', 'modelo', 10));
    }

    public function testMultibyteLengthIsCountedInCharacters(): void
    {
        $this->assertSame('ação', Validator::text('ação', 'name', 'nome', 4, true));
    }

    public function testDate(): void
    {
        $this->assertSame('2026-11-04', Validator::date('2026-11-04', 'd', 'data'));
        $this->assertNull(Validator::date('', 'd', 'data'));
        $this->assertApiError(fn () => Validator::date('2026-02-30', 'd', 'data'), 422, 'd');
        $this->assertApiError(fn () => Validator::date('04/11/2026', 'd', 'data'), 422, 'd');
        $this->assertApiError(fn () => Validator::date(20261104, 'd', 'data'), 422, 'd');
    }

    public function testDateTimeAcceptsSpaceAndIsoSeparator(): void
    {
        $this->assertSame('2026-11-04 10:30:00', Validator::dateTime('2026-11-04 10:30:00', 'f', 'data'));
        $this->assertSame('2026-11-04 10:30:00', Validator::dateTime('2026-11-04T10:30:00', 'f', 'data'));
        $this->assertApiError(fn () => Validator::dateTime('ontem', 'f', 'data'), 422, 'f');
    }

    public function testNumber(): void
    {
        $this->assertSame(5.5, Validator::number('5.5', 'v', 'valor', -10, 10));
        $this->assertSame(3.0, Validator::number(3, 'v', 'valor', -10, 10));
        $this->assertApiError(fn () => Validator::number('abc', 'v', 'valor', -10, 10), 422, 'v');
        $this->assertApiError(fn () => Validator::number(11, 'v', 'valor', -10, 10), 422, 'v');
        $this->assertApiError(fn () => Validator::number(null, 'v', 'valor', -10, 10), 422, 'v');
    }

    public function testEnum(): void
    {
        $this->assertSame('operando', Validator::enum('operando', MachineStatus::class, 'status', 'status'));
        $this->assertApiError(fn () => Validator::enum('quebrada', MachineStatus::class, 'status', 'status'), 422, 'status');
        $this->assertApiError(fn () => Validator::enum(null, MachineStatus::class, 'status', 'status'), 422, 'status');
    }

    public function testId(): void
    {
        $this->assertSame(7, Validator::id('7', 'machineId', 'máquina'));
        $this->assertSame(7, Validator::id(7, 'machineId', 'máquina'));
        $this->assertApiError(fn () => Validator::id('0', 'machineId', 'máquina'), 422, 'machineId');
        $this->assertApiError(fn () => Validator::id('1; DROP', 'machineId', 'máquina'), 422, 'machineId');
        $this->assertApiError(fn () => Validator::id(null, 'machineId', 'máquina'), 422, 'machineId');
    }

    public function testIdList(): void
    {
        $this->assertSame([1, 2], Validator::idList([1, '2'], 'sensorIds', 'sensores'));
        $this->assertSame([], Validator::idList([], 'sensorIds', 'sensores'));
        $this->assertApiError(fn () => Validator::idList([1, 1], 'sensorIds', 'sensores'), 422, 'sensorIds');
        $this->assertApiError(fn () => Validator::idList('1,2', 'sensorIds', 'sensores'), 422, 'sensorIds');
        $this->assertApiError(fn () => Validator::idList(['a' => 1], 'sensorIds', 'sensores'), 422, 'sensorIds');
    }

    public function testRejectUnknownFields(): void
    {
        Validator::rejectUnknown(['name' => 'x'], ['name', 'model']);
        $this->assertApiError(fn () => Validator::rejectUnknown(['name' => 'x', 'admin' => true], ['name']), 400, 'admin');
    }

    public function testEmail(): void
    {
        $this->assertSame('a@b.com', Validator::email('a@b.com'));
        $this->assertApiError(fn () => Validator::email('sem-arroba'), 422, 'email');
    }
}
