<?php

declare(strict_types=1);

namespace SenseGuard\Domain;

enum MachineStatus: string
{
    use EnumValues;

    case Operando = 'operando';
    case Alerta = 'alerta';
    case Critico = 'critico';
    case Manutencao = 'manutencao';
    case Inativo = 'inativo';

    public function label(): string
    {
        return match ($this) {
            self::Operando => 'Operando',
            self::Alerta => 'Alerta',
            self::Critico => 'Crítico',
            self::Manutencao => 'Em Manutenção',
            self::Inativo => 'Inativo',
        };
    }
}
