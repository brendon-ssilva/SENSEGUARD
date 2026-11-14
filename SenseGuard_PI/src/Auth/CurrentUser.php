<?php

declare(strict_types=1);

namespace SenseGuard\Auth;

use SenseGuard\Domain\UserRole;

/** Usuário autenticado e suas permissões. */
final class CurrentUser
{
    public function __construct(
        public readonly int $id,
        public readonly int $corporationId,
        public readonly string $name,
        public readonly string $email,
        public readonly UserRole $role,
    ) {
    }

    /** @param array<string, mixed> $row Linha da tabela usuario. */
    public static function fromRow(array $row): ?self
    {
        $role = UserRole::tryFrom(strtolower(trim((string) ($row['role'] ?? ''))));
        if ($role === null) {
            return null;
        }

        return new self(
            (int) $row['id_usuario'],
            (int) $row['id_corporacao'],
            (string) $row['nome'],
            (string) $row['email'],
            $role
        );
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isTechnician(): bool
    {
        return $this->role === UserRole::Tecnico;
    }

    /** Admin e supervisor podem criar/editar/excluir registros operacionais. */
    public function canWrite(): bool
    {
        return $this->role === UserRole::Admin || $this->role === UserRole::Supervisor;
    }
}
