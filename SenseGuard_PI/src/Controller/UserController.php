<?php

declare(strict_types=1);

namespace SenseGuard\Controller;

use SenseGuard\Domain\Specs;
use SenseGuard\Http\ApiException;
use SenseGuard\Http\Request;
use SenseGuard\Http\Response;
use SenseGuard\Repository\UserRepository;
use SenseGuard\Service\AuditLog;
use SenseGuard\Validation\Fields;
use SenseGuard\Validation\Validator;

final class UserController extends ResourceController
{
    private const ADMIN_ONLY = 'Somente administradores podem alterar usuários.';

    private UserRepository $users;

    public function __construct(ApiContext $ctx)
    {
        parent::__construct($ctx);
        $this->users = new UserRepository($ctx->pdo, $ctx->user->corporationId);
    }

    public function listAll(?int $limit = null, int $offset = 0): array
    {
        return array_map(fn (array $row): array => $this->present($row), $this->users->all($limit, $offset));
    }

    public function show(Request $request, int $id): Response
    {
        return Response::json($this->present($this->users->findOrFail($id)));
    }

    public function store(Request $request): Response
    {
        $this->requireAdmin(self::ADMIN_ONLY);
        $data = $this->prepare($request->json(), null, true);

        $id = $this->users->insert($data);
        $row = $this->users->findOrFail($id);
        $this->ctx->audit->record('users', $id, 'criar', AuditLog::snapshot($row));

        return Response::json($this->present($row), 201);
    }

    public function update(Request $request, int $id): Response
    {
        $this->requireAdmin(self::ADMIN_ONLY);
        $before = $this->users->findOrFail($id);
        $input = $request->json();

        if ($id === $this->ctx->user->id) {
            $newRole = $input['role'] ?? $before['role'];
            $newStatus = $input['status'] ?? $before['status'];
            if ($newRole !== $before['role'] || $newStatus !== $before['status']) {
                throw new ApiException(409, 'Não é permitido alterar o próprio perfil ou status.');
            }
        }

        $data = $this->prepare($input, $id, false);
        $this->users->update($id, $data);

        $after = $this->users->findOrFail($id);
        $changes = AuditLog::diff($before, $after);
        if (isset($data['senha'])) {
            $changes['senha'] = ['de' => '***', 'para' => '*** (alterada)'];
        }
        if ($changes !== []) {
            $this->ctx->audit->record('users', $id, 'atualizar', $changes);
        }

        return Response::json($this->present($after));
    }

    public function destroy(Request $request, int $id): Response
    {
        $this->requireAdmin(self::ADMIN_ONLY);
        if ($id === $this->ctx->user->id) {
            throw new ApiException(409, 'Não é permitido excluir o próprio usuário.');
        }

        $before = $this->users->findOrFail($id);
        if ($this->users->delete($id) < 1) {
            throw new ApiException(404, 'Registro não encontrado.');
        }
        $this->ctx->audit->record('users', $id, 'excluir', AuditLog::snapshot($before));

        return $this->deleted($id);
    }

    /**
     * @param array<string, mixed> $input
     * @return array<string, mixed>
     */
    private function prepare(array $input, ?int $currentId, bool $isCreate): array
    {
        Validator::rejectUnknown($input, [...array_keys(Specs::USER), 'password']);
        $data = Fields::validate($input, Specs::USER);

        $data['email'] = Validator::email((string) $data['email']);
        if ($this->users->emailInUse((string) $data['email'], $currentId)) {
            throw new ApiException(409, 'Este e-mail já está em uso.', 'email');
        }

        $password = $input['password'] ?? null;
        if ($isCreate || ($password !== null && $password !== '')) {
            if (!is_string($password) || strlen($password) < 8 || strlen($password) > 72) {
                throw new ApiException(422, 'A senha deve ter entre 8 e 72 bytes.', 'password');
            }
            $data['senha'] = password_hash($password, PASSWORD_DEFAULT);
        }

        return $data;
    }

    /**
     * E-mail e telefone só são expostos a administradores.
     *
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    private function present(array $row): array
    {
        $out = ['id' => (string) $row['id_usuario']]
            + Fields::present($row, Specs::USER)
            + ['createdAt' => (string) $row['data_criacao']];

        if (!$this->ctx->user->isAdmin()) {
            unset($out['email'], $out['phone']);
        }

        return $out;
    }
}
