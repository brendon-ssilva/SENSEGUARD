<?php

declare(strict_types=1);

namespace SenseGuard\Service;

use PDO;
use Throwable;

/**
 * Trilha de auditoria: registra quem criou, alterou ou excluiu o quê.
 * Falhas ao gravar a auditoria são registradas no log do PHP e não derrubam a operação.
 */
final class AuditLog
{
    /** Colunas que nunca vão para o log. */
    private const IGNORED = ['senha'];

    public function __construct(
        private PDO $pdo,
        private int $corporationId,
        private ?int $userId,
        private ?string $userName,
        private string $ip,
    ) {
    }

    /** @param array<string, mixed> $changes */
    public function record(string $target, ?int $recordId, string $action, array $changes = []): void
    {
        try {
            $stmt = $this->pdo->prepare(
                'INSERT INTO auditoria (id_corporacao, id_usuario, usuario_nome, entidade, id_registro, acao, alteracoes, ip, criado_em)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                $this->corporationId,
                $this->userId,
                $this->userName,
                $target,
                $recordId,
                $action,
                $changes === [] ? null : self::encode($changes),
                $this->ip,
                date('Y-m-d H:i:s'),
            ]);
        } catch (Throwable $e) {
            error_log('SenseGuard auditoria: ' . $e->getMessage());
        }
    }

    /**
     * Diferenças entre duas linhas: [coluna => ['de' => antes, 'para' => depois]].
     *
     * @param array<string, mixed> $before
     * @param array<string, mixed> $after
     * @return array<string, array{de: mixed, para: mixed}>
     */
    public static function diff(array $before, array $after): array
    {
        $changes = [];
        foreach ($after as $column => $value) {
            if (in_array($column, self::IGNORED, true)) {
                continue;
            }

            $old = $before[$column] ?? null;
            $same = is_numeric($old) && is_numeric($value)
                ? (float) $old === (float) $value
                : (string) $old === (string) $value;

            if (!$same) {
                $changes[(string) $column] = ['de' => $old, 'para' => $value];
            }
        }

        return $changes;
    }

    /**
     * Cópia da linha sem colunas sensíveis (usada em criação e exclusão).
     *
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    public static function snapshot(array $row): array
    {
        return array_diff_key($row, array_flip(self::IGNORED));
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function recent(int $limit, int $offset, ?string $target = null): array
    {
        $sql = 'SELECT id_auditoria, id_usuario, usuario_nome, entidade, id_registro, acao, alteracoes, ip, criado_em
                FROM auditoria WHERE id_corporacao = ?';
        $params = [$this->corporationId];
        if ($target !== null) {
            $sql .= ' AND entidade = ?';
            $params[] = $target;
        }
        $sql .= ' ORDER BY id_auditoria DESC LIMIT ' . max(1, $limit) . ' OFFSET ' . max(0, $offset);

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        $out = [];
        foreach ($stmt->fetchAll() as $row) {
            $changes = null;
            if (is_string($row['alteracoes'] ?? null) && $row['alteracoes'] !== '') {
                $decoded = json_decode($row['alteracoes'], true);
                $changes = is_array($decoded) ? $decoded : null;
            }

            $out[] = [
                'id' => (string) $row['id_auditoria'],
                'at' => (string) $row['criado_em'],
                'userId' => $row['id_usuario'] === null ? null : (string) $row['id_usuario'],
                'userName' => (string) ($row['usuario_nome'] ?? ''),
                'target' => (string) $row['entidade'],
                'recordId' => $row['id_registro'] === null ? null : (string) $row['id_registro'],
                'action' => (string) $row['acao'],
                'changes' => $changes,
                'ip' => (string) ($row['ip'] ?? ''),
            ];
        }

        return $out;
    }

    /** @param array<string, mixed> $changes */
    private static function encode(array $changes): string
    {
        $json = json_encode($changes, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
        if ($json === false || strlen($json) > 60000) {
            return '{"truncado":true}';
        }

        return $json;
    }
}
