<?php

declare(strict_types=1);

namespace SenseGuard\Http;

use RuntimeException;

/** Erro previsto da API: vira uma resposta JSON com o status HTTP informado. */
final class ApiException extends RuntimeException
{
    /** @param array<string, string> $headers */
    public function __construct(
        private int $status,
        string $message,
        private ?string $field = null,
        private array $headers = [],
    ) {
        parent::__construct($message);
    }

    public function status(): int
    {
        return $this->status;
    }

    public function field(): ?string
    {
        return $this->field;
    }

    /** @return array<string, string> */
    public function headers(): array
    {
        return $this->headers;
    }
}
