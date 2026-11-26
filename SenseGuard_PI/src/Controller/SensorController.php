<?php

declare(strict_types=1);

namespace SenseGuard\Controller;

use SenseGuard\Core\Database;
use SenseGuard\Domain\ManualReadingRule;
use SenseGuard\Domain\ReadingOrigin;
use SenseGuard\Domain\SensorStatus;
use SenseGuard\Domain\SensorStatusRules;
use SenseGuard\Domain\Specs;
use SenseGuard\Http\ApiException;
use SenseGuard\Http\Request;
use SenseGuard\Http\Response;
use SenseGuard\Repository\MachineRepository;
use SenseGuard\Repository\ReadingRepository;
use SenseGuard\Repository\SensorRepository;
use SenseGuard\Service\AuditLog;
use SenseGuard\Validation\Fields;
use SenseGuard\Validation\Validator;

final class SensorController extends ResourceController
{
    private SensorRepository $sensors;
    private MachineRepository $machines;

    public function __construct(ApiContext $ctx)
    {
        parent::__construct($ctx);
        $this->sensors = new SensorRepository($ctx->pdo, $ctx->user->corporationId);
        $this->machines = new MachineRepository($ctx->pdo, $ctx->user->corporationId);
    }

    public function listAll(?int $limit = null, int $offset = 0): array
    {
        return array_map(fn (array $row): array => $this->present($row), $this->sensors->all($limit, $offset));
    }

    public function show(Request $request, int $id): Response
    {
        return Response::json($this->present($this->sensors->findOrFail($id)));
    }

    public function store(Request $request): Response
    {
        $this->requireWrite();
        $data = $this->prepare($request->json(), null);

        $id = Database::transaction($this->ctx->pdo, function () use ($data): int {
            $id = $this->sensors->insert($data);
            if (ManualReadingRule::shouldRecord(null, (float) $data['valor_atual'])) {
                $this->recordManualReading($id, $data);
            }

            return $id;
        });
        $row = $this->sensors->findOrFail($id);
        $this->ctx->audit->record('sensors', $id, 'criar', AuditLog::snapshot($row));

        return Response::json($this->present($row), 201);
    }

    public function update(Request $request, int $id): Response
    {
        $this->requireWrite();
        $before = $this->sensors->findOrFail($id);
        $data = $this->prepare($request->json(), $before);

        Database::transaction($this->ctx->pdo, function () use ($id, $before, $data): void {
            $this->sensors->update($id, $data);
            if (ManualReadingRule::shouldRecord((float) $before['valor_atual'], (float) $data['valor_atual'])) {
                $this->recordManualReading($id, $data);
            }
        });
        $after = $this->sensors->findOrFail($id);

        $changes = AuditLog::diff($before, $after);
        if ($changes !== []) {
            $this->ctx->audit->record('sensors', $id, 'atualizar', $changes);
        }

        return Response::json($this->present($after));
    }

    public function destroy(Request $request, int $id): Response
    {
        $this->requireWrite();
        $before = $this->sensors->findOrFail($id);

        if ($this->sensors->delete($id) < 1) {
            throw new ApiException(404, 'Registro não encontrado.');
        }
        $this->ctx->audit->record('sensors', $id, 'excluir', AuditLog::snapshot($before));

        return $this->deleted($id);
    }

    /**
     * @param array<string, mixed> $input
     * @param array<string, mixed>|null $before Linha atual do sensor (na edição).
     * @return array<string, mixed>
     */
    private function prepare(array $input, ?array $before): array
    {
        Validator::rejectUnknown($input, [...array_keys(Specs::SENSOR), 'machineId']);
        $data = Fields::validate($input, Specs::SENSOR);

        if ($data['min_limite'] > $data['max_limite']) {
            throw new ApiException(422, 'O limite mínimo não pode ser maior que o limite máximo.', 'minThreshold');
        }

        $machineId = $input['machineId'] ?? null;
        if ($machineId === '') {
            $machineId = null;
        }
        if ($machineId !== null) {
            $machineId = Validator::id($machineId, 'machineId', 'máquina');
            if (!$this->machines->exists($machineId)) {
                throw new ApiException(422, 'A máquina selecionada não pertence à organização atual.', 'machineId');
            }
        }

        // "alerta"/"online" são derivados da leitura e dos limites; só "offline" é respeitado como informado.
        $data['status'] = SensorStatusRules::resolve(
            SensorStatus::from((string) $data['status']),
            (float) $data['valor_atual'],
            (float) $data['min_limite'],
            (float) $data['max_limite']
        )->value;
        $data['id_maquina'] = $machineId;

        // Uma leitura manual precisa ter a mesma data no sensor e no histórico.
        $previous = $before === null ? null : (float) $before['valor_atual'];
        if (ManualReadingRule::shouldRecord($previous, (float) $data['valor_atual'])
            && empty($data['ultima_leitura'])) {
            $data['ultima_leitura'] = date('Y-m-d H:i:s');
        } elseif ($before !== null && !array_key_exists('lastReadingAt', $input)) {
            unset($data['ultima_leitura']);
        }

        return $data;
    }

    /**
     * Registra no histórico (dados) o valor digitado no painel, com o usuário responsável.
     *
     * @param array<string, mixed> $data Colunas já validadas do sensor.
     */
    private function recordManualReading(int $sensorId, array $data): void
    {
        $readAt = isset($data['ultima_leitura']) && $data['ultima_leitura'] !== ''
            ? (string) $data['ultima_leitura']
            : date('Y-m-d H:i:s');

        (new ReadingRepository($this->ctx->pdo, $this->ctx->user->corporationId))->insert(
            (string) $data['tipo'],
            (float) $data['valor_atual'],
            $readAt,
            $data['id_maquina'] === null ? null : (int) $data['id_maquina'],
            $sensorId,
            ReadingOrigin::Manual,
            $this->ctx->user->id
        );
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    private function present(array $row): array
    {
        $out = ['id' => (string) $row['id_sensor']]
            + Fields::present($row, Specs::SENSOR)
            + ['machineId' => $row['id_maquina'] === null ? null : (string) $row['id_maquina']];

        // Status gravado (usado pelo formulário) x status exibido (pode virar offline por falta de leituras).
        $out['storedStatus'] = (string) $row['status'];
        $out['status'] = SensorStatusRules::effective(
            (string) $row['status'],
            $row['ultima_leitura'] === null ? null : (string) $row['ultima_leitura'],
            (int) $this->ctx->config->get('app.sensor_offline_after_minutes', 0)
        );

        return $out;
    }
}
