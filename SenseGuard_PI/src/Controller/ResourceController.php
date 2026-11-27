<?php

declare(strict_types=1);

namespace SenseGuard\Controller;

use SenseGuard\Http\Request;
use SenseGuard\Http\Response;

/** Contrato dos recursos CRUD expostos em api.php?entity=<recurso>. */
abstract class ResourceController extends ApiController
{
    /**
     * Linhas já no formato da API (usado por index e pelo endpoint "all").
     *
     * @return list<array<string, mixed>>
     */
    abstract public function listAll(?int $limit = null, int $offset = 0): array;

    abstract public function show(Request $request, int $id): Response;

    abstract public function store(Request $request): Response;

    abstract public function update(Request $request, int $id): Response;

    abstract public function destroy(Request $request, int $id): Response;

    public function index(Request $request): Response
    {
        $limit = $request->queryInt('limit', 1, 1000);
        $offset = $request->queryInt('offset', 0, 1000000) ?? 0;

        return Response::json($this->listAll($limit, $offset));
    }
}
