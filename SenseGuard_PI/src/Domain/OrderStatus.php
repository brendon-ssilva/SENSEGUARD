<?php

declare(strict_types=1);

namespace SenseGuard\Domain;

enum OrderStatus: string
{
    use EnumValues;

    case Aberta = 'aberta';
    case EmAndamento = 'em_andamento';
    case Concluida = 'concluida';
    case Cancelada = 'cancelada';

    public function label(): string
    {
        return match ($this) {
            self::Aberta => 'Aberta',
            self::EmAndamento => 'Em Andamento',
            self::Concluida => 'Concluída',
            self::Cancelada => 'Cancelada',
        };
    }
}
