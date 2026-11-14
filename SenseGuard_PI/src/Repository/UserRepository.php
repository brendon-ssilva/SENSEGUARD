<?php

declare(strict_types=1);

namespace SenseGuard\Repository;

final class UserRepository extends TenantRepository
{
    protected function table(): string
    {
        return 'usuario';
    }

    protected function primaryKey(): string
    {
        return 'id_usuario';
    }

    protected function columns(): string
    {
        return 'id_usuario, nome, email, telefone, role, status, data_criacao, id_corporacao';
    }

    /** O e-mail é único em todo o sistema (login), por isso a checagem não filtra por organização. */
    public function emailInUse(string $email, ?int $exceptId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM usuario WHERE email = ?';
        $params = [$email];
        if ($exceptId !== null) {
            $sql .= ' AND id_usuario <> ?';
            $params[] = $exceptId;
        }
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return (int) $stmt->fetchColumn() > 0;
    }

    public function isActive(int $id): bool
    {
        $stmt = $this->pdo->prepare('SELECT COUNT(*) FROM usuario WHERE id_usuario = ? AND id_corporacao = ? AND status = ?');
        $stmt->execute([$id, $this->corporationId, 'ativo']);

        return (int) $stmt->fetchColumn() === 1;
    }
}
