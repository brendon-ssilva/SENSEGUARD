<?php

declare(strict_types=1);

namespace SenseGuard\Controller;

use PDO;
use SenseGuard\Auth\DeviceAuth;
use SenseGuard\Auth\TokenPermissions;
use SenseGuard\Http\Request;
use SenseGuard\Http\Response;
use SenseGuard\Repository\SensorRepository;

/**
 * Lista reduzida dos sensores da organização do token, para integrações validarem mapeamentos
 * (GET api.php?entity=integration-sensors, permissão sensors:read, sem sessão).
 */
final class IntegrationSensorController
{
    public function __construct(private PDO $pdo)
    {
    }

    public function index(Request $request): Response
    {
        $device = (new DeviceAuth($this->pdo))->authenticate($request, TokenPermissions::SENSORS_READ);
        $sensors = new SensorRepository($this->pdo, $device->corporationId);

        $rows = $sensors->all($request->queryInt('limit', 1, 1000) ?? 100, $request->queryInt('offset', 0, 1000000) ?? 0);

        return Response::json(array_map(static fn (array $row): array => [
            'id' => (string) $row['id_sensor'],
            'name' => (string) $row['nome'],
            'type' => (string) $row['tipo'],
            'unit' => (string) ($row['unidade'] ?? ''),
            'minThreshold' => (float) $row['min_limite'],
            'maxThreshold' => (float) $row['max_limite'],
        ], $rows));
    }
}
