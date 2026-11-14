<?php

declare(strict_types=1);

namespace SenseGuard\Domain;

enum SensorStatus: string
{
    use EnumValues;

    case Online = 'online';
    case Offline = 'offline';
    case Alerta = 'alerta';

    public function label(): string
    {
        return match ($this) {
            self::Online => 'Online',
            self::Offline => 'Offline',
            self::Alerta => 'Alerta',
        };
    }
}
