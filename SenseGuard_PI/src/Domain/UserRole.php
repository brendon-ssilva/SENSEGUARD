<?php

declare(strict_types=1);

namespace SenseGuard\Domain;

enum UserRole: string
{
    use EnumValues;

    case Admin = 'admin';
    case Supervisor = 'supervisor';
    case Tecnico = 'tecnico';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrador',
            self::Supervisor => 'Supervisor',
            self::Tecnico => 'Técnico',
        };
    }
}
