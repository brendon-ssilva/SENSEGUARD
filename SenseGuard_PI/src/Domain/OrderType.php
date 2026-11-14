<?php

declare(strict_types=1);

namespace SenseGuard\Domain;

enum OrderType: string
{
    use EnumValues;

    case Preventiva = 'preventiva';
    case Preditiva = 'preditiva';
    case Corretiva = 'corretiva';

    public function label(): string
    {
        return match ($this) {
            self::Preventiva => 'Preventiva',
            self::Preditiva => 'Preditiva',
            self::Corretiva => 'Corretiva',
        };
    }
}
