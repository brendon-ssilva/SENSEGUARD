<?php

declare(strict_types=1);

namespace SenseGuard\Controller;

use SenseGuard\Core\Database;
use SenseGuard\Domain\OrderStatus;
use SenseGuard\Domain\Specs;
use SenseGuard\Http\ApiException;
use SenseGuard\Http\Request;
use SenseGuard\Http\Response;
use SenseGuard\Repository\MachineRepository;
use SenseGuard\Repository\OrderRepository;
use SenseGuard\Repository\UserRepository;
use SenseGuard\Service\AuditLog;
use SenseGuard\Validation\Fields;
use SenseGuard\Validation\Validator;

final class OrderController extends ResourceController
{
    /** Campos que o técnico pode alterar nas ordens atribuídas a ele. */
    private const TECHNICIAN_FIELDS = ['status', 'description'];

    private OrderRepository $orders;
    private MachineRepository $machines;
    private UserRepository $users;

    public function __construct(ApiContext $ctx)
    {
        parent::__construct($ctx);
        $corporationId = $ctx->user->corporationId;
        $this->orders = new OrderRepository($ctx->pdo, $corporationId);
        $this->machines = new MachineRepository($ctx->pdo, $corporationId);
        $this->users = new UserRepository($ctx->pdo, $corporationId);
    }

    /** Data de encerramento: preenchida ao concluir (mantendo a original) e limpa nos demais status. */
    public static function completionDate(string $status, ?string $previous, ?int $now = null): ?string
    {
        if ($status !== OrderStatus::Concluida->value) {
            return null;
        }

        return ($previous !== null && $previous !== '') ? $previous : date('Y-m-d H:i:s', $now ?? time());
    }

    public function listAll(?int $limit = null, int $offset = 0): array
    {
        return array_map(fn (array $row): array => $this->present($row), $this->orders->all($limit, $offset));
    }

    public function show(Request $request, int $id): Response
    {
        return Response::json($this->present($this->orders->findOrFail($id)));
    }

    public function store(Request $request): Response
    {
        $this->requireWrite();
        $data = $this->prepare($request->json(), null);
        $data['id_criador'] = $this->ctx->user->id;

        $id = Database::transaction($this->ctx->pdo, function () use ($data): int {
            $id = $this->orders->insert($data);
            $this->orders->setCode($id, OrderRepository::buildCode($id));

            return $id;
        });

        $row = $this->orders->findOrFail($id);
        $this->ctx->audit->record('orders', $id, 'criar', AuditLog::snapshot($row));

        return Response::json($this->present($row), 201);
    }

    public function update(Request $request, int $id): Response
    {
        $before = $this->orders->findOrFail($id);

        if ($this->ctx->user->isTechnician()) {
            return $this->updateAsTechnician($request, $id, $before);
        }

        $this->requireWrite();
        $data = $this->prepare($request->json(), $before);
        $this->orders->update($id, $data);

        return $this->respondUpdated($id, $before);
    }

    public function destroy(Request $request, int $id): Response
    {
        $this->requireWrite();
        $before = $this->orders->findOrFail($id);

        if ($this->orders->delete($id) < 1) {
            throw new ApiException(404, 'Registro não encontrado.');
        }
        $this->ctx->audit->record('orders', $id, 'excluir', AuditLog::snapshot($before));

        return $this->deleted($id);
    }

    /**
     * @param array<string, mixed> $before
     */
    private function updateAsTechnician(Request $request, int $id, array $before): Response
    {
        if ((int) $before['id_responsavel'] !== $this->ctx->user->id) {
            throw new ApiException(403, 'Você só pode alterar ordens atribuídas a você.');
        }

        $input = $request->json();
        if (array_diff(array_keys($input), self::TECHNICIAN_FIELDS) !== []) {
            throw new ApiException(403, 'Técnicos podem alterar apenas o status e a descrição das próprias ordens.');
        }

        $spec = array_intersect_key(Specs::ORDER, array_flip(self::TECHNICIAN_FIELDS));
        $data = Fields::validate($input, $spec, true);
        if (isset($data['status'])) {
            $data['data_encerramento'] = self::completionDate(
                (string) $data['status'],
                $before['data_encerramento'] === null ? null : (string) $before['data_encerramento']
            );
        }

        $this->orders->update($id, $data);

        return $this->respondUpdated($id, $before);
    }

    /** @param array<string, mixed> $before */
    private function respondUpdated(int $id, array $before): Response
    {
        $after = $this->orders->findOrFail($id);
        $changes = AuditLog::diff($before, $after);
        if ($changes !== []) {
            $this->ctx->audit->record('orders', $id, 'atualizar', $changes);
        }

        return Response::json($this->present($after));
    }

    /**
     * @param array<string, mixed> $input
     * @param array<string, mixed>|null $before Linha atual (na edição).
     * @return array<string, mixed>
     */
    private function prepare(array $input, ?array $before): array
    {
        Validator::rejectUnknown($input, [...array_keys(Specs::ORDER), 'machineId', 'assignedToId', 'completedAt']);
        $data = Fields::validate($input, Specs::ORDER);

        $machineId = Validator::id($input['machineId'] ?? null, 'machineId', 'máquina');
        $assignedToId = Validator::id($input['assignedToId'] ?? null, 'assignedToId', 'responsável');

        if (!$this->machines->exists($machineId)) {
            throw new ApiException(422, 'A máquina selecionada não pertence à organização atual.', 'machineId');
        }
        if (!$this->users->isActive($assignedToId)) {
            throw new ApiException(422, 'O responsável selecionado não existe ou está inativo.', 'assignedToId');
        }

        $previousCompletedAt = $before !== null && $before['data_encerramento'] !== null
            ? (string) $before['data_encerramento']
            : null;

        $data['data_encerramento'] = self::completionDate((string) $data['status'], $previousCompletedAt);
        $data['id_maquina'] = $machineId;
        $data['id_responsavel'] = $assignedToId;

        return $data;
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    private function present(array $row): array
    {
        return ['id' => (string) $row['id_os'], 'code' => (string) ($row['codigo_os'] ?? '')]
            + Fields::present($row, Specs::ORDER)
            + [
                'createdAt' => (string) $row['data_abertura'],
                'completedAt' => (string) ($row['data_encerramento'] ?? ''),
                'machineId' => (string) $row['id_maquina'],
                'assignedToId' => (string) $row['id_responsavel'],
                'createdById' => $row['id_criador'] === null ? null : (string) $row['id_criador'],
            ];
    }
}
