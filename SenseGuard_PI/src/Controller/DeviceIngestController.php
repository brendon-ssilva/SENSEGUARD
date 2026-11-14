<?php

declare(strict_types=1);

namespace SenseGuard\Controller;

use PDO;
use SenseGuard\Auth\DeviceAuth;
use SenseGuard\Http\Request;
use SenseGuard\Http\Response;
use SenseGuard\Service\ReadingIngestor;

/** Recebe leituras de gateways/dispositivos autenticados por token (POST api.php?entity=readings). */
final class DeviceIngestController
{
    public function __construct(private PDO $pdo)
    {
    }

    public function ingest(Request $request): Response
    {
        $device = (new DeviceAuth($this->pdo))->authenticate($request);
        $result = (new ReadingIngestor($this->pdo, $device->corporationId))->ingest($request->json());

        return Response::json(['success' => true] + $result, 201);
    }
}
