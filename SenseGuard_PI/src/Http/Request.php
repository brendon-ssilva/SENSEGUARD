<?php

declare(strict_types=1);

namespace SenseGuard\Http;

/** Representação imutável da requisição HTTP (facilita testes sem superglobais). */
final class Request
{
    /**
     * @param array<string, mixed> $query
     * @param array<string, mixed> $server
     */
    public function __construct(
        private string $method,
        private array $query = [],
        private array $server = [],
        private ?string $body = null,
    ) {
        $this->method = strtoupper($method);
    }

    public static function fromGlobals(): self
    {
        return new self((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'), $_GET, $_SERVER);
    }

    public function method(): string
    {
        return $this->method;
    }

    public function query(string $key): ?string
    {
        $value = $this->query[$key] ?? null;

        return is_string($value) ? $value : null;
    }

    /** Identificador opcional (?id=). Lança 400 se estiver presente e inválido. */
    public function id(): ?int
    {
        $raw = $this->query['id'] ?? null;
        if ($raw === null) {
            return null;
        }
        if (!is_string($raw) || !ctype_digit($raw) || (int) $raw < 1) {
            throw new ApiException(400, 'Identificador inválido.');
        }

        return (int) $raw;
    }

    public function requireId(): int
    {
        $id = $this->id();
        if ($id === null) {
            throw new ApiException(400, 'ID válido é obrigatório.');
        }

        return $id;
    }

    /** Lê um inteiro positivo opcional da query (ex.: limit, offset). */
    public function queryInt(string $key, int $min, int $max): ?int
    {
        $raw = $this->query($key);
        if ($raw === null || $raw === '') {
            return null;
        }
        if (!ctype_digit($raw)) {
            throw new ApiException(400, 'Parâmetro inválido: ' . $key . '.', $key);
        }

        return max($min, min($max, (int) $raw));
    }

    public function header(string $name): ?string
    {
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        $value = $this->server[$key] ?? null;

        return is_string($value) && $value !== '' ? $value : null;
    }

    public function ip(): string
    {
        $ip = $this->server['REMOTE_ADDR'] ?? '';

        return is_string($ip) && $ip !== '' ? substr($ip, 0, 45) : '0.0.0.0';
    }

    public function isHttps(): bool
    {
        $https = $this->server['HTTPS'] ?? '';

        return is_string($https) && $https !== '' && strtolower($https) !== 'off';
    }

    /**
     * Lê exclusivamente objetos JSON (POST/PUT).
     *
     * @return array<string, mixed>
     */
    public function json(int $maxBytes = 1_048_576, bool $allowEmptyObject = false): array
    {
        $contentType = strtolower(trim(explode(';', (string) ($this->server['CONTENT_TYPE'] ?? ''))[0]));
        if ($contentType !== 'application/json') {
            throw new ApiException(415, 'Envie os dados no formato JSON.');
        }

        if ((int) ($this->server['CONTENT_LENGTH'] ?? 0) > $maxBytes) {
            throw new ApiException(413, 'A requisição excede o tamanho permitido.');
        }

        $raw = $this->body ?? file_get_contents('php://input');
        if ($raw === false || trim($raw) === '') {
            throw new ApiException(400, 'O corpo da requisição está vazio.');
        }
        if (strlen($raw) > $maxBytes) {
            throw new ApiException(413, 'A requisição excede o tamanho permitido.');
        }

        try {
            $data = json_decode($raw, true, 32, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            throw new ApiException(400, 'JSON inválido.');
        }

        if (!is_array($data) || (array_is_list($data) && !($allowEmptyObject && $data === [] && str_starts_with(ltrim($raw), '{')))) {
            throw new ApiException(400, 'Formato de dados inválido.');
        }

        return $data;
    }
}
