<?php

declare(strict_types=1);

namespace SenseGuard\Controller;

use SenseGuard\Http\ApiException;
use SenseGuard\Http\Response;

/** Base dos controllers: acesso ao contexto e verificações de permissão. */
abstract class ApiController
{
    public function __construct(protected ApiContext $ctx)
    {
    }

    protected function requireWrite(): void
    {
        if (!$this->ctx->user->canWrite()) {
            throw new ApiException(403, 'Seu perfil não possui permissão para alterar estes registros.');
        }
    }

    protected function requireAdmin(string $message = 'Somente administradores podem realizar esta operação.'): void
    {
        if (!$this->ctx->user->isAdmin()) {
            throw new ApiException(403, $message);
        }
    }

    protected function deleted(int $id): Response
    {
        return Response::json(['success' => true, 'id' => (string) $id]);
    }
}
