<?php

declare(strict_types=1);

namespace SenseGuard\Repository;

final class SensorRepository extends TenantRepository
{
    protected function table(): string
    {
        return 'sensor';
    }

    protected function primaryKey(): string
    {
        return 'id_sensor';
    }

    protected function columns(): string
    {
        return 'id_sensor, nome, tipo, unidade, localizacao, min_limite, max_limite, valor_atual, status, ultima_leitura, id_maquina, id_corporacao';
    }

    /** Atualiza a leitura atual, o status derivado e o instante da última leitura. */
    public function applyReading(int $sensorId, float $value, string $status, string $readAt): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE sensor SET valor_atual = ?, status = ?, ultima_leitura = ? WHERE id_sensor = ? AND id_corporacao = ?'
        );
        $stmt->execute([$value, $status, $readAt, $sensorId, $this->corporationId]);
    }
}
