<?php

declare(strict_types=1);

namespace SenseGuard\Repository;

use PDO;

/** Histórico de medições (tabela dados). */
final class ReadingRepository
{
    public function __construct(
        private PDO $pdo,
        private int $corporationId,
    ) {
    }

    public function insert(string $type, float $value, string $readAt, ?int $machineId, int $sensorId): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO dados (tipo_medida, valor, data_hora, id_maquina, id_sensor, id_corporacao) VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$type, $value, $readAt, $machineId, $sensorId, $this->corporationId]);
    }

    /** @return list<array<string, mixed>> Mais recentes primeiro. */
    public function history(int $sensorId, int $limit, int $offset = 0): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id_medida, id_sensor, id_maquina, valor, data_hora FROM dados
             WHERE id_sensor = ? AND id_corporacao = ?
             ORDER BY data_hora DESC, id_medida DESC LIMIT ' . max(1, $limit) . ' OFFSET ' . max(0, $offset)
        );
        $stmt->execute([$sensorId, $this->corporationId]);

        return $stmt->fetchAll();
    }
}
