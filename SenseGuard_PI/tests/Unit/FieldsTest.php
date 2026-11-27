<?php

declare(strict_types=1);

namespace SenseGuard\Tests\Unit;

use SenseGuard\Domain\Specs;
use SenseGuard\Tests\TestCase;
use SenseGuard\Validation\Fields;

final class FieldsTest extends TestCase
{
    public function testValidateAppliesDefaults(): void
    {
        $data = Fields::validate(['name' => 'Prensa'], Specs::MACHINE);

        $this->assertSame('Prensa', $data['nome']);
        $this->assertSame('operando', $data['status']);
        $this->assertNull($data['num_serial']);
        $this->assertNull($data['data_instalacao']);
    }

    public function testValidateRequiresMandatoryFields(): void
    {
        $this->assertApiError(fn () => Fields::validate([], Specs::MACHINE), 422, 'name');
    }

    public function testValidateOnlyProvidedForPartialUpdates(): void
    {
        $spec = array_intersect_key(Specs::ORDER, array_flip(['status', 'description']));

        $this->assertSame(['status' => 'concluida'], Fields::validate(['status' => 'concluida'], $spec, true));
        $this->assertApiError(fn () => Fields::validate(['status' => 'inexistente'], $spec, true), 422, 'status');
    }

    public function testSensorTypeHasNoDefault(): void
    {
        $this->assertApiError(fn () => Fields::validate(['name' => 'TMP-1'], Specs::SENSOR), 422, 'type');

        $data = Fields::validate(['name' => 'TMP-1', 'type' => 'temperatura'], Specs::SENSOR);
        $this->assertSame(0.0, $data['min_limite']);
        $this->assertSame(100.0, $data['max_limite']);
        $this->assertSame('online', $data['status']);
    }

    public function testPresentCastsNumbersAndNullsToStrings(): void
    {
        $out = Fields::present(['nome' => 'TMP-1', 'min_limite' => '10.0000', 'unidade' => null], Specs::SENSOR);

        $this->assertSame('TMP-1', $out['name']);
        $this->assertSame(10.0, $out['minThreshold']);
        $this->assertSame('', $out['unit']);
        $this->assertSame(0.0, $out['currentValue']);
    }
}
