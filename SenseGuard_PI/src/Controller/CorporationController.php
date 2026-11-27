<?php

declare(strict_types=1);

namespace SenseGuard\Controller;

use SenseGuard\Http\ApiException;
use SenseGuard\Http\Request;
use SenseGuard\Http\Response;
use SenseGuard\Repository\CorporationRepository;

/** Dados da própria organização (somente leitura). */
final class CorporationController extends ResourceController
{
    private CorporationRepository $corporations;

    public function __construct(ApiContext $ctx)
    {
        parent::__construct($ctx);
        $this->corporations = new CorporationRepository($ctx->pdo, $ctx->user->corporationId);
    }

    public function listAll(?int $limit = null, int $offset = 0): array
    {
        return array_map(fn (array $row): array => $this->present($row), $this->corporations->all($limit, $offset));
    }

    public function show(Request $request, int $id): Response
    {
        return Response::json($this->present($this->corporations->findOrFail($id)));
    }

    public function store(Request $request): Response
    {
        throw $this->readOnly();
    }

    public function update(Request $request, int $id): Response
    {
        throw $this->readOnly();
    }

    public function destroy(Request $request, int $id): Response
    {
        throw $this->readOnly();
    }

    private function readOnly(): ApiException
    {
        return new ApiException(403, 'O cadastro da organização não pode ser alterado por esta tela.');
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    private function present(array $row): array
    {
        return [
            'id' => (string) $row['id_corporacao'],
            'name' => (string) $row['nome'],
            'cnpj' => (string) $row['cnpj'],
            'email' => (string) $row['email'],
        ];
    }
}
