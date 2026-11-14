<?php

declare(strict_types=1);

namespace SenseGuard\Controller;

use SenseGuard\Core\Database;
use SenseGuard\Domain\Specs;
use SenseGuard\Http\ApiException;
use SenseGuard\Http\Request;
use SenseGuard\Http\Response;
use SenseGuard\Repository\MachineRepository;
use SenseGuard\Service\AuditLog;
use SenseGuard\Validation\Fields;
use SenseGuard\Validation\Validator;

final class MachineController extends ResourceController
{
    private MachineRepository $machines;

    public function __construct(ApiContext $ctx)
    {
        parent::__construct($ctx);
        $this->machines = new MachineRepository($ctx->pdo, $ctx->user->corporationId);
    }

    public function listAll(?int $limit = null, int $offset = 0): array
    {
        $sensorIds = $this->machines->sensorIdsGrouped();

        return array_map(
            fn (array $row): array => $this->present($row, $sensorIds[(int) $row['id_maquina']] ?? []),
            $this->machines->all($limit, $offset)
        );
    }


    /**
     * Lista todas as máquinas ou pesquisa pelo parâmetro GET ?q=.
     */
    public function index(Request $request): Response
    {
        $query = trim($request->query('q') ?? '');

        // Preserva o comportamento atual quando não há pesquisa.
        if ($query === '') {
            return parent::index($request);
        }

        if (strlen($query) > 200) {
            throw new ApiException(400, 'Termo de busca muito longo.', 'q');
        }

        $limit = $request->queryInt('limit', 1, 1000);
        $offset = $request->queryInt('offset', 0, 1000000) ?? 0;

        $sensorIds = $this->machines->sensorIdsGrouped();

        $results = array_map(
            fn (array $row): array => $this->present(
                $row,
                $sensorIds[(int) $row['id_maquina']] ?? []
            ),
            $this->machines->search($query, $limit, $offset)
        );

        return Response::json($results);
    }


    public function show(Request $request, int $id): Response
    {
        $row = $this->machines->findOrFail($id);

        return Response::json($this->present($row, $this->machines->sensorIdsFor($id)));
    }

    public function store(Request $request): Response
    {
        $this->requireWrite();
        [$data, $sensorIds] = $this->prepare($request->json(), null);

        $id = Database::transaction($this->ctx->pdo, function () use ($data, $sensorIds): int {
            $id = $this->machines->insert($data);
            $this->machines->syncSensors($id, $sensorIds ?? []);

            return $id;
        });

        $row = $this->machines->findOrFail($id);
        $this->ctx->audit->record('machines', $id, 'criar', AuditLog::snapshot($row) + ['sensorIds' => $sensorIds ?? []]);

        return Response::json($this->present($row, $this->machines->sensorIdsFor($id)), 201);
    }

    public function update(Request $request, int $id): Response
    {
        $this->requireWrite();
        $before = $this->machines->findOrFail($id);
        $oldSensorIds = $this->machines->sensorIdsFor($id);
        [$data, $sensorIds] = $this->prepare($request->json(), $id);

        Database::transaction($this->ctx->pdo, function () use ($id, $data, $sensorIds): void {
            $this->machines->update($id, $data);
            if ($sensorIds !== null) {
                $this->machines->syncSensors($id, $sensorIds);
            }
        });

        $after = $this->machines->findOrFail($id);
        $newSensorIds = $this->machines->sensorIdsFor($id);

        $changes = AuditLog::diff($before, $after);
        if ($newSensorIds !== $oldSensorIds) {
            $changes['sensorIds'] = ['de' => $oldSensorIds, 'para' => $newSensorIds];
        }
        if ($changes !== []) {
            $this->ctx->audit->record('machines', $id, 'atualizar', $changes);
        }

        return Response::json($this->present($after, $newSensorIds));
    }

    public function destroy(Request $request, int $id): Response
    {
        $this->requireWrite();
        $before = $this->machines->findOrFail($id, 'Máquina não encontrada.');

        Database::transaction($this->ctx->pdo, function () use ($id): void {
            $this->machines->deleteReleasingSensors($id);
        });

        $this->ctx->audit->record('machines', $id, 'excluir', AuditLog::snapshot($before));

        return $this->deleted($id);
    }

    /**
     * @param array<string, mixed> $input
     * @return array{0: array<string, mixed>, 1: list<int>|null}
     */
    private function prepare(array $input, ?int $currentId): array
    {
        Validator::rejectUnknown($input, [...array_keys(Specs::MACHINE), 'sensorIds']);
        $data = Fields::validate($input, Specs::MACHINE);

        $serial = $data['num_serial'];
        if ($serial !== null && $this->machines->serialInUse((string) $serial, $currentId)) {
            throw new ApiException(409, 'Já existe uma máquina com este número de série.', 'serialNumber');
        }

        $sensorIds = array_key_exists('sensorIds', $input)
            ? Validator::idList($input['sensorIds'], 'sensorIds', 'sensores')
            : null;

        return [$data, $sensorIds];
    }

    /**
     * @param array<string, mixed> $row
     * @param list<string> $sensorIds
     * @return array<string, mixed>
     */
    private function present(array $row, array $sensorIds): array
    {
        return ['id' => (string) $row['id_maquina']]
            + Fields::present($row, Specs::MACHINE)
            + ['sensorIds' => $sensorIds];
    }
}
