<?php

declare(strict_types=1);

namespace SenseGuard\Controller;

use SenseGuard\Http\ApiException;
use SenseGuard\Http\Request;
use SenseGuard\Http\Response;

/** Consulta à trilha de auditoria (somente administradores). */
final class AuditController extends ApiController
{
    private const TARGETS = ['machines', 'sensors', 'orders', 'users', 'me', 'auth'];

    public function index(Request $request): Response
    {
        $this->requireAdmin('Somente administradores podem consultar a auditoria.');

        $limit = $request->queryInt('limit', 1, 500) ?? 100;
        $offset = $request->queryInt('offset', 0, 1000000) ?? 0;

        $target = $request->query('target');
        if ($target !== null && $target !== '' && !in_array($target, self::TARGETS, true)) {
            throw new ApiException(400, 'Filtro de entidade inválido.', 'target');
        }

        return Response::json($this->ctx->audit->recent($limit, $offset, $target === '' ? null : $target));
    }
}
