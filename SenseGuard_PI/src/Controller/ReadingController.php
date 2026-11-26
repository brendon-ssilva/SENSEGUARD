<?php

declare(strict_types=1);

namespace SenseGuard\Controller;

use SenseGuard\Http\ApiException;
use SenseGuard\Http\Request;
use SenseGuard\Http\Response;
use SenseGuard\Repository\ReadingRepository;
use SenseGuard\Repository\SensorRepository;

/** Histórico de leituras de um sensor (usuário autenticado por sessão). */
final class ReadingController extends ApiController
{
    public function history(Request $request): Response
    {
        $sensorId = $request->queryInt('sensorId', 1, PHP_INT_MAX);
        if ($sensorId === null) {
            throw new ApiException(400, 'Informe o sensor (sensorId).', 'sensorId');
        }

        $corporationId = $this->ctx->user->corporationId;
        if (!(new SensorRepository($this->ctx->pdo, $corporationId))->exists($sensorId)) {
            throw new ApiException(404, 'Sensor não encontrado.');
        }

        $limit = $request->queryInt('limit', 1, 1000) ?? 100;
        $offset = $request->queryInt('offset', 0, 1000000) ?? 0;

        $rows = (new ReadingRepository($this->ctx->pdo, $corporationId))->history($sensorId, $limit, $offset);

        return Response::json(array_map(static fn (array $row): array => [
            'id' => (string) $row['id_medida'],
            'sensorId' => (string) $row['id_sensor'],
            'machineId' => $row['id_maquina'] === null ? null : (string) $row['id_maquina'],
            'value' => (float) $row['valor'],
            'at' => (string) $row['data_hora'],
            'origin' => (string) $row['origem'],
        ], $rows));
    }
}
