<?php

declare(strict_types=1);

namespace SenseGuard\Domain;

/** Como uma leitura chegou ao histórico (tabela dados). */
enum ReadingOrigin: string
{
    use EnumValues;

    case Dispositivo = 'dispositivo';
    case Importacao = 'importacao';
    case Manual = 'manual';

    public function label(): string
    {
        return match ($this) {
            self::Dispositivo => 'Dispositivo',
            self::Importacao => 'Importação',
            self::Manual => 'Manual',
        };
    }
}
