<?php

declare(strict_types=1);

namespace SenseGuard\Repository;

use SenseGuard\Http\ApiException;

final class MachineRepository extends TenantRepository
{
    protected function table(): string
    {
        return 'maquina';
    }

    protected function primaryKey(): string
    {
        return 'id_maquina';
    }

    protected function columns(): string
    {
        return 'id_maquina, nome, num_serial, modelo, fabricante, localizacao, departamento, status, '
            . 'data_instalacao, ultima_manutencao, proxima_manutencao, id_corporacao';
    }


    /**
     * Pesquisa máquinas da corporação pelo texto informado.
     *
     * @return list<array<string, mixed>>
     */
    public function search(string $text, ?int $limit = null, int $offset = 0): array
    {
    $sql = 'SELECT ' . $this->columns()
        . ' FROM maquina WHERE id_corporacao = ?'
        . " AND (LOCATE(LOWER(?), LOWER(COALESCE(nome, ''))) > 0"
        . " OR LOCATE(LOWER(?), LOWER(COALESCE(num_serial, ''))) > 0"
        . " OR LOCATE(LOWER(?), LOWER(COALESCE(localizacao, ''))) > 0"
        . " OR LOCATE(LOWER(?), LOWER(COALESCE(departamento, ''))) > 0)"
        . ' ORDER BY id_maquina DESC';

    if ($limit !== null) {
        $sql .= ' LIMIT ' . max(1, $limit)
            . ' OFFSET ' . max(0, $offset);
    }

    $stmt = $this->pdo->prepare($sql);
    $stmt->execute([
        $this->corporationId,
        $text,
        $text,
        $text,
        $text,
    ]);

    return $stmt->fetchAll();
    }


    /**
     * Ids dos sensores de todas as máquinas em uma única consulta (evita N+1).
     *
     * @return array<int, list<string>> id_maquina => [id_sensor, ...]
     */
    public function sensorIdsGrouped(): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id_maquina, id_sensor FROM sensor WHERE id_maquina IS NOT NULL AND id_corporacao = ? ORDER BY id_sensor'
        );
        $stmt->execute([$this->corporationId]);

        $grouped = [];
        foreach ($stmt->fetchAll() as $row) {
            $grouped[(int) $row['id_maquina']][] = (string) $row['id_sensor'];
        }

        return $grouped;
    }

    /** @return list<string> */
    public function sensorIdsFor(int $machineId): array
    {
        return $this->sensorIdsGrouped()[$machineId] ?? [];
    }

    public function serialInUse(string $serial, ?int $exceptId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM maquina WHERE id_corporacao = ? AND num_serial = ?';
        $params = [$this->corporationId, $serial];
        if ($exceptId !== null) {
            $sql .= ' AND id_maquina <> ?';
            $params[] = $exceptId;
        }
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return (int) $stmt->fetchColumn() > 0;
    }

    /**
     * Define exatamente quais sensores pertencem à máquina.
     *
     * @param list<int> $sensorIds
     */
    public function syncSensors(int $machineId, array $sensorIds): void
    {
        if ($sensorIds !== []) {
            $placeholders = implode(',', array_fill(0, count($sensorIds), '?'));
            $check = $this->pdo->prepare(
                'SELECT COUNT(*) FROM sensor WHERE id_corporacao = ? AND (id_maquina IS NULL OR id_maquina = ?) AND id_sensor IN (' . $placeholders . ')'
            );
            $check->execute(array_merge([$this->corporationId, $machineId], $sensorIds));
            if ((int) $check->fetchColumn() !== count($sensorIds)) {
                throw new ApiException(409, 'Um ou mais sensores não estão disponíveis para vinculação.', 'sensorIds');
            }
        }

        $clear = $this->pdo->prepare('UPDATE sensor SET id_maquina = NULL WHERE id_maquina = ? AND id_corporacao = ?');
        $clear->execute([$machineId, $this->corporationId]);

        if ($sensorIds === []) {
            return;
        }

        $placeholders = implode(',', array_fill(0, count($sensorIds), '?'));
        $update = $this->pdo->prepare(
            'UPDATE sensor SET id_maquina = ? WHERE id_corporacao = ? AND id_sensor IN (' . $placeholders . ')'
        );
        $update->execute(array_merge([$machineId, $this->corporationId], $sensorIds));
    }

    /** Desvincula os sensores e exclui a máquina (deve rodar em transação). */
    public function deleteReleasingSensors(int $machineId): void
    {
        $clear = $this->pdo->prepare('UPDATE sensor SET id_maquina = NULL WHERE id_maquina = ? AND id_corporacao = ?');
        $clear->execute([$machineId, $this->corporationId]);

        if ($this->delete($machineId) < 1) {
            throw new ApiException(404, 'Máquina não encontrada.');
        }
    }
}
