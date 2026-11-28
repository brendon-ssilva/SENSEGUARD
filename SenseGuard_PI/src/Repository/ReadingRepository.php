<?php

declare(strict_types=1);

namespace SenseGuard\Repository;

use PDO;
use SenseGuard\Domain\ReadingOrigin;

/** Histórico de medições (tabela dados). */
final class ReadingRepository
{
    public function __construct(
        private PDO $pdo,
        private int $corporationId,
    ) {
    }

    public function insert(
        string $type,
        float $value,
        string $readAt,
        ?int $machineId,
        int $sensorId,
        ReadingOrigin $origin = ReadingOrigin::Dispositivo,
        ?int $userId = null,
        ?int $importId = null,
    ): void {
        $stmt = $this->pdo->prepare(
            'INSERT INTO dados (tipo_medida, valor, data_hora, id_maquina, id_sensor, id_corporacao, origem, id_usuario, id_importacao)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$type, $value, $readAt, $machineId, $sensorId, $this->corporationId, $origin->value, $userId, $importId]);
    }

    /**
     * @param array<string, mixed> $filters
     * @return array{rows: list<array<string, mixed>>, page: int, hasNext: bool, limitReached: bool}
     */
    public function search(array $filters): array
    {
        $query = ReadingQuery::build($filters, $this->corporationId);
        $stmt = $this->pdo->prepare($query['sql']);
        foreach ($query['params'] as $index => $value) {
            $stmt->bindValue($index + 1, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
        }
        $stmt->execute();
        $rows = $stmt->fetchAll();
        $more = count($rows) > ReadingQuery::PAGE_SIZE;

        return [
            'rows' => array_slice($rows, 0, ReadingQuery::PAGE_SIZE),
            'page' => $query['page'],
            'hasNext' => $more && $query['page'] < ReadingQuery::MAX_PAGE,
            'limitReached' => $more && $query['page'] === ReadingQuery::MAX_PAGE,
        ];
    }

    /** @return list<array<string, mixed>> Mais recentes primeiro; leituras anuladas não aparecem. */
    public function history(int $sensorId, int $limit, int $offset = 0): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id_medida, id_sensor, id_maquina, valor, data_hora, origem FROM dados
             WHERE id_sensor = ? AND id_corporacao = ? AND anulada_em IS NULL
             ORDER BY data_hora DESC, id_medida DESC LIMIT ' . max(1, $limit) . ' OFFSET ' . max(0, $offset)
        );
        $stmt->execute([$sensorId, $this->corporationId]);

        return $stmt->fetchAll();
    }
}
