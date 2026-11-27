<?php

declare(strict_types=1);

namespace SenseGuard\Repository;

use InvalidArgumentException;
use PDO;
use SenseGuard\Http\ApiException;

/**
 * Base dos repositórios. Toda consulta é restrita à organização (id_corporacao)
 * informada no construtor, então nenhum método esquece o isolamento entre empresas.
 */
abstract class TenantRepository
{
    public function __construct(
        protected PDO $pdo,
        protected int $corporationId,
    ) {
    }

    abstract protected function table(): string;

    abstract protected function primaryKey(): string;

    /** Lista de colunas do SELECT (nunca inclui dados sensíveis como senha). */
    abstract protected function columns(): string;

    /** @return list<array<string, mixed>> */
    public function all(?int $limit = null, int $offset = 0): array
    {
        $sql = 'SELECT ' . $this->columns() . ' FROM `' . $this->table() . '` WHERE id_corporacao = ? ORDER BY `' . $this->primaryKey() . '` DESC';
        if ($limit !== null) {
            $sql .= ' LIMIT ' . max(1, $limit) . ' OFFSET ' . max(0, $offset);
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$this->corporationId]);

        return $stmt->fetchAll();
    }

    /** @return array<string, mixed>|null */
    public function find(int $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT ' . $this->columns() . ' FROM `' . $this->table() . '` WHERE `' . $this->primaryKey() . '` = ? AND id_corporacao = ? LIMIT 1'
        );
        $stmt->execute([$id, $this->corporationId]);
        $row = $stmt->fetch();

        return is_array($row) ? $row : null;
    }

    /** @return array<string, mixed> */
    public function findOrFail(int $id, string $message = 'Registro não encontrado.'): array
    {
        $row = $this->find($id);
        if ($row === null) {
            throw new ApiException(404, $message);
        }

        return $row;
    }

    public function exists(int $id): bool
    {
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*) FROM `' . $this->table() . '` WHERE `' . $this->primaryKey() . '` = ? AND id_corporacao = ?'
        );
        $stmt->execute([$id, $this->corporationId]);

        return (int) $stmt->fetchColumn() === 1;
    }

    /** @param array<string, mixed> $data coluna => valor (id_corporacao é adicionado aqui). */
    public function insert(array $data): int
    {
        $data['id_corporacao'] = $this->corporationId;
        $columns = array_keys($data);
        foreach ($columns as $column) {
            self::assertIdentifier((string) $column);
        }

        $sql = 'INSERT INTO `' . $this->table() . '` (`' . implode('`, `', $columns) . '`) VALUES ('
            . implode(', ', array_fill(0, count($columns), '?')) . ')';
        $this->pdo->prepare($sql)->execute(array_values($data));

        return (int) $this->pdo->lastInsertId();
    }

    /** @param array<string, mixed> $data coluna => valor */
    public function update(int $id, array $data): void
    {
        if ($data === []) {
            throw new ApiException(400, 'Nenhum campo válido foi enviado.');
        }

        $sets = [];
        foreach (array_keys($data) as $column) {
            self::assertIdentifier((string) $column);
            $sets[] = '`' . $column . '` = ?';
        }

        $sql = 'UPDATE `' . $this->table() . '` SET ' . implode(', ', $sets)
            . ' WHERE `' . $this->primaryKey() . '` = ? AND id_corporacao = ?';
        $this->pdo->prepare($sql)->execute(array_merge(array_values($data), [$id, $this->corporationId]));
    }

    public function delete(int $id): int
    {
        $stmt = $this->pdo->prepare(
            'DELETE FROM `' . $this->table() . '` WHERE `' . $this->primaryKey() . '` = ? AND id_corporacao = ?'
        );
        $stmt->execute([$id, $this->corporationId]);

        return $stmt->rowCount();
    }

    private static function assertIdentifier(string $name): void
    {
        if (preg_match('/^[a-z][a-z0-9_]*$/', $name) !== 1) {
            throw new InvalidArgumentException('Nome de coluna inválido: ' . $name);
        }
    }
}
