<?php

declare(strict_types=1);

namespace SenseGuard\Service;

use PDO;
use SenseGuard\Core\Database;
use SenseGuard\Domain\SensorStatusRules;
use SenseGuard\Http\ApiException;
use SenseGuard\Repository\ReadingRepository;
use SenseGuard\Repository\SensorRepository;
use SenseGuard\Validation\Validator;

/**
 * Recebe leituras de sensores (uma ou em lote), grava o histórico na tabela dados
 * e atualiza a leitura atual e o status derivado de cada sensor. Tudo em uma
 * transação: se uma leitura for inválida, nenhuma é gravada.
 */
final class ReadingIngestor
{
    public const MAX_BATCH = 100;

    /** Tolerância (segundos) para relógios de dispositivos adiantados. */
    private const FUTURE_TOLERANCE = 300;

    public function __construct(
        private PDO $pdo,
        private int $corporationId,
        private ?int $now = null,
    ) {
    }

    /**
     * @param array<string, mixed> $payload {sensorId, value, readAt?} ou {readings: [...]}
     * @return array{accepted: int, sensors: list<array{id: string, status: string, value: float}>}
     */
    public function ingest(array $payload): array
    {
        $now = $this->now ?? time();
        $items = $this->extractItems($payload);

        $parsed = [];
        foreach ($items as $index => $item) {
            try {
                $parsed[] = $this->parseItem($item, (int) $index, $now);
            } catch (ApiException $e) {
                throw new ApiException($e->status(), 'Leitura #' . ($index + 1) . ': ' . $e->getMessage(), $e->field());
            }
        }

        // Ordem cronológica: a leitura mais recente de cada sensor é a que vira "atual".
        usort($parsed, static fn (array $a, array $b): int => strcmp($a['readAt'], $b['readAt']));

        return Database::transaction($this->pdo, fn (): array => $this->store($parsed));
    }

    /** @return list<mixed> */
    private function extractItems(array $payload): array
    {
        if (!array_key_exists('readings', $payload)) {
            return [$payload];
        }

        Validator::rejectUnknown($payload, ['readings']);
        $items = $payload['readings'];
        if (!is_array($items) || !array_is_list($items) || $items === []) {
            throw new ApiException(422, 'Envie ao menos uma leitura em "readings".', 'readings');
        }
        if (count($items) > self::MAX_BATCH) {
            throw new ApiException(422, 'Máximo de ' . self::MAX_BATCH . ' leituras por requisição.', 'readings');
        }

        return $items;
    }

    /** @return array{index: int, sensorId: int, value: float, readAt: string} */
    private function parseItem(mixed $item, int $index, int $now): array
    {
        if (!is_array($item) || array_is_list($item)) {
            throw new ApiException(422, 'formato inválido.');
        }

        Validator::rejectUnknown($item, ['sensorId', 'value', 'readAt']);

        $sensorId = Validator::id($item['sensorId'] ?? null, 'sensorId', 'sensor');
        $value = Validator::number($item['value'] ?? null, 'value', 'valor da leitura', -1000000000, 1000000000);
        $readAt = Validator::dateTime($item['readAt'] ?? null, 'readAt', 'data da leitura') ?? date('Y-m-d H:i:s', $now);

        $timestamp = strtotime($readAt);
        if ($timestamp === false || $timestamp > $now + self::FUTURE_TOLERANCE) {
            throw new ApiException(422, 'a data da leitura está no futuro.', 'readAt');
        }

        return ['index' => $index, 'sensorId' => $sensorId, 'value' => $value, 'readAt' => $readAt];
    }

    /**
     * @param list<array{index: int, sensorId: int, value: float, readAt: string}> $parsed
     * @return array{accepted: int, sensors: list<array{id: string, status: string, value: float}>}
     */
    private function store(array $parsed): array
    {
        $sensors = new SensorRepository($this->pdo, $this->corporationId);
        $history = new ReadingRepository($this->pdo, $this->corporationId);

        /** @var array<int, array<string, mixed>> $rows */
        $rows = [];
        /** @var array<int, string|null> $latest */
        $latest = [];
        $summary = [];

        foreach ($parsed as $reading) {
            $id = $reading['sensorId'];

            if (!array_key_exists($id, $rows)) {
                $row = $sensors->find($id);
                if ($row === null) {
                    throw new ApiException(404, 'Leitura #' . ($reading['index'] + 1) . ': sensor não encontrado.', 'sensorId');
                }
                $rows[$id] = $row;
                $latest[$id] = $row['ultima_leitura'] === null ? null : (string) $row['ultima_leitura'];
            }

            $row = $rows[$id];
            $history->insert(
                (string) $row['tipo'],
                $reading['value'],
                $reading['readAt'],
                $row['id_maquina'] === null ? null : (int) $row['id_maquina'],
                $id
            );

            // Leituras atrasadas entram no histórico, mas não sobrescrevem a leitura atual.
            if ($latest[$id] === null || strcmp($reading['readAt'], $latest[$id]) >= 0) {
                $status = SensorStatusRules::fromValue(
                    $reading['value'],
                    (float) $row['min_limite'],
                    (float) $row['max_limite']
                );
                $sensors->applyReading($id, $reading['value'], $status->value, $reading['readAt']);
                $latest[$id] = $reading['readAt'];
                $summary[$id] = ['id' => (string) $id, 'status' => $status->value, 'value' => $reading['value']];
            }
        }

        return ['accepted' => count($parsed), 'sensors' => array_values($summary)];
    }
}
