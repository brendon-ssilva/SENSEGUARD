<?php

declare(strict_types=1);

namespace SenseGuard\Domain;

enum OrderPriority: string
{
    use EnumValues;

    case Baixa = 'baixa';
    case Media = 'media';
    case Alta = 'alta';
    case Critica = 'critica';

    public function label(): string
    {
        return match ($this) {
            self::Baixa => 'Baixa',
            self::Media => 'Média',
            self::Alta => 'Alta',
            self::Critica => 'Crítica',
        };
    }
}
