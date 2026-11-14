<?php

declare(strict_types=1);

namespace SenseGuard\Http;

use JsonException;

/** Resposta JSON. */
final class Response
{
    /** @param array<string, string> $headers */
    private function __construct(
        private int $status,
        private mixed $payload,
        private array $headers,
    ) {
    }

    /** @param array<string, string> $headers */
    public static function json(mixed $payload, int $status = 200, array $headers = []): self
    {
        return new self($status, $payload, $headers);
    }

    /** @param array<string, string> $headers */
    public static function error(int $status, string $message, ?string $field = null, array $headers = []): self
    {
        $payload = ['success' => false, 'error' => $message];
        if ($field !== null) {
            $payload['field'] = $field;
        }

        return new self($status, $payload, $headers);
    }

    public function status(): int
    {
        return $this->status;
    }

    public function payload(): mixed
    {
        return $this->payload;
    }

    /** @return array<string, string> */
    public function headers(): array
    {
        return $this->headers;
    }

    public function send(): void
    {
        http_response_code($this->status);
        foreach (array_merge(SecurityHeaders::api(), $this->headers) as $name => $value) {
            header($name . ': ' . $value);
        }

        try {
            echo json_encode(
                $this->payload,
                JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE | JSON_THROW_ON_ERROR
            );
        } catch (JsonException) {
            http_response_code(500);
            echo '{"success":false,"error":"Erro interno."}';
        }
    }
}
