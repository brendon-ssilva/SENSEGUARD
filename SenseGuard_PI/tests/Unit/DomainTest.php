<?php

declare(strict_types=1);

namespace SenseGuard\Tests\Unit;

use SenseGuard\Controller\OrderController;
use SenseGuard\Domain\EnumCatalog;
use SenseGuard\Domain\SensorStatus;
use SenseGuard\Domain\SensorStatusRules;
use SenseGuard\Repository\OrderRepository;
use SenseGuard\Tests\TestCase;

final class DomainTest extends TestCase
{
    public function testSensorStatusIsDerivedFromThresholds(): void
    {
        $this->assertSame(SensorStatus::Online, SensorStatusRules::fromValue(50, 0, 100));
        $this->assertSame(SensorStatus::Online, SensorStatusRules::fromValue(0, 0, 100));
        $this->assertSame(SensorStatus::Online, SensorStatusRules::fromValue(100, 0, 100));
        $this->assertSame(SensorStatus::Alerta, SensorStatusRules::fromValue(100.1, 0, 100));
        $this->assertSame(SensorStatus::Alerta, SensorStatusRules::fromValue(-0.1, 0, 100));
    }

    public function testManualAlertIsIgnoredButOfflineIsKept(): void
    {
        $this->assertSame(SensorStatus::Online, SensorStatusRules::resolve(SensorStatus::Alerta, 50, 0, 100));
        $this->assertSame(SensorStatus::Alerta, SensorStatusRules::resolve(SensorStatus::Online, 150, 0, 100));
        $this->assertSame(SensorStatus::Offline, SensorStatusRules::resolve(SensorStatus::Offline, 150, 0, 100));
    }

    public function testEffectiveStatusBecomesOfflineWhenReadingsAreStale(): void
    {
        $now = strtotime('2026-11-04 12:00:00');

        $this->assertSame('online', SensorStatusRules::effective('online', '2026-11-04 11:50:00', 15, $now));
        $this->assertSame('offline', SensorStatusRules::effective('online', '2026-11-04 11:30:00', 15, $now));
        $this->assertSame('online', SensorStatusRules::effective('online', '2026-11-04 08:00:00', 0, $now), 'recurso desligado');
        $this->assertSame('alerta', SensorStatusRules::effective('alerta', null, 15, $now), 'sem leitura registrada');
    }

    public function testOrderCompletionDate(): void
    {
        $this->assertNull(OrderController::completionDate('aberta', '2026-01-01 10:00:00'));
        $this->assertSame('2026-01-01 10:00:00', OrderController::completionDate('concluida', '2026-01-01 10:00:00'));

        $now = mktime(9, 30, 0, 11, 4, 2026);
        $this->assertSame(date('Y-m-d H:i:s', $now), OrderController::completionDate('concluida', null, $now));
    }

    public function testOrderCodeFormat(): void
    {
        $this->assertSame('OS-2026-00042', OrderRepository::buildCode(42, '2026'));
    }

    public function testEnumCatalogExposesValuesAndLabels(): void
    {
        $catalog = EnumCatalog::all();

        $this->assertTrue(in_array('em_andamento', array_column($catalog['orderStatus'], 'value'), true));
        $this->assertTrue(in_array('Em Andamento', array_column($catalog['orderStatus'], 'label'), true));
        $this->assertSame(3, count($catalog['userRole']));
    }
}
