<?php

declare(strict_types=1);

namespace SenseGuard\Domain;

enum UserStatus: string
{
    use EnumValues;

    case Ativo = 'ativo';
    case Inativo = 'inativo';

    public function label(): string
    {
        return match ($this) {
            self::Ativo => 'Ativo',
            self::Inativo => 'Inativo',
        };
    }
}
