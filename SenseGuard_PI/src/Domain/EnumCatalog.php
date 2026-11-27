<?php

declare(strict_types=1);

namespace SenseGuard\Domain;

/** Catálogo de valores permitidos, exposto à interface para evitar listas duplicadas no JS. */
final class EnumCatalog
{
    /** @return array<string, list<array{value: string, label: string}>> */
    public static function all(): array
    {
        return [
            'machineStatus' => MachineStatus::options(),
            'sensorStatus' => SensorStatus::options(),
            'sensorType' => SensorType::options(),
            'orderType' => OrderType::options(),
            'orderPriority' => OrderPriority::options(),
            'orderStatus' => OrderStatus::options(),
            'userRole' => UserRole::options(),
            'userStatus' => UserStatus::options(),
        ];
    }
}
