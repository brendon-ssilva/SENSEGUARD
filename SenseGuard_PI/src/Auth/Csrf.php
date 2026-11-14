<?php

declare(strict_types=1);

namespace SenseGuard\Auth;

use SenseGuard\Http\ApiException;
use SenseGuard\Http\Request;

/** Token CSRF por sessão, enviado pelo front-end no cabeçalho X-CSRF-Token. */
final class Csrf
{
    private const KEY = 'csrf_token';

    public function __construct(private SessionStore $session)
    {
    }

    /** Devolve o token da sessão, criando-o se necessário. */
    public function token(): string
    {
        $token = $this->session->get(self::KEY);
        if (!is_string($token) || $token === '') {
            $token = $this->rotate();
        }

        return $token;
    }

    public function rotate(): string
    {
        $token = bin2hex(random_bytes(32));
        $this->session->set(self::KEY, $token);

        return $token;
    }

    public function isValid(?string $candidate): bool
    {
        $token = $this->session->get(self::KEY);

        return is_string($token) && $token !== '' && $candidate !== null && hash_equals($token, $candidate);
    }

    public function assertValid(Request $request): void
    {
        if (!$this->isValid($request->header('X-CSRF-Token'))) {
            throw new ApiException(403, 'Requisição não autorizada. Atualize a página e tente novamente.');
        }
    }
}
