<?php

declare(strict_types=1);

namespace SenseGuard\Repository;

final class OrderRepository extends TenantRepository
{
    protected function table(): string
    {
        return 'ordem_servico';
    }

    protected function primaryKey(): string
    {
        return 'id_os';
    }

    protected function columns(): string
    {
        return 'id_os, codigo_os, titulo, descricao, tipo, prioridade, status, horas_estimadas, data_prevista, '
            . 'data_abertura, data_encerramento, id_maquina, id_responsavel, id_criador, id_corporacao';
    }

    /** Código legível: OS-AAAA-00042. */
    public static function buildCode(int $id, ?string $year = null): string
    {
        return sprintf('OS-%s-%05d', $year ?? date('Y'), $id);
    }

    public function setCode(int $id, string $code): void
    {
        $this->update($id, ['codigo_os' => $code]);
    }
}
