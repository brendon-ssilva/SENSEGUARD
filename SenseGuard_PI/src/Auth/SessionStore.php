<?php

declare(strict_types=1);

namespace SenseGuard\Auth;

/** Abstração do armazenamento de sessão (facilita testes sem $_SESSION). */
interface SessionStore
{
    public function get(string $key, mixed $default = null): mixed;

    public function set(string $key, mixed $value): void;

    public function has(string $key): bool;

    public function remove(string $key): void;

    /** Gera um novo identificador de sessão (previne fixation). */
    public function regenerate(): void;

    /** Apaga os dados e o cookie da sessão. */
    public function destroy(): void;
}
