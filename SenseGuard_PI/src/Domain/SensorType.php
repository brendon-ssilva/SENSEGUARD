<?php

declare(strict_types=1);

namespace SenseGuard\Domain;

enum SensorType: string
{
    use EnumValues;

    case Temperatura = 'temperatura';
    case Vibracao = 'vibracao';
    case Pressao = 'pressao';
    case Corrente = 'corrente';
    case Umidade = 'umidade';
    case Rpm = 'rpm';

    public function label(): string
    {
        return match ($this) {
            self::Temperatura => 'Temperatura',
            self::Vibracao => 'Vibração',
            self::Pressao => 'Pressão',
            self::Corrente => 'Corrente',
            self::Umidade => 'Umidade',
            self::Rpm => 'RPM',
        };
    }
}
