<?php

declare(strict_types=1);

namespace SenseGuard\Core;

/**
 * Configuração da aplicação. Os valores locais ficam em config/config.local.php
 * (fora do Git) e são mesclados sobre os padrões abaixo.
 */
final class Config
{
    private const DEFAULTS = [
        'db' => [
            'host' => '127.0.0.1',
            'port' => 3306,
            'name' => 'senseguard',
            'user' => 'root',
            'pass' => '',
        ],
        'app' => [
            // "production" (padrão seguro) ou "development".
            'env' => 'production',
            'timezone' => 'America/Sao_Paulo',
            'session_ttl' => 7200,
            // null = detectar HTTPS automaticamente; true/false força o atributo Secure do cookie.
            'secure_cookies' => null,
            // 0 desativa. Acima de 0, sensores sem leitura há N minutos aparecem como offline.
            'sensor_offline_after_minutes' => 0,
        ],
        'security' => [
            'login_window_seconds' => 900,
            'login_max_per_email' => 5,
            'login_max_per_ip' => 20,
        ],
    ];

    /** @param array<string, mixed> $values */
    private function __construct(private array $values)
    {
    }

    public static function load(string $baseDir): self
    {
        $file = $baseDir . '/config/config.local.php';
        if (!is_file($file) || !is_readable($file)) {
            error_log('SenseGuard: config/config.local.php ausente ou sem permissão de leitura.');
            throw new ConfigurationException('Configuração local indisponível. Copie config/config.local.php.example para config/config.local.php.');
        }

        $local = require $file;
        if (!is_array($local)) {
            throw new ConfigurationException('config/config.local.php deve retornar um array.');
        }

        return self::fromArray($local);
    }

    /** @param array<string, mixed> $local */
    public static function fromArray(array $local): self
    {
        // Compatibilidade com o formato antigo, plano: host/name/user/pass.
        if (isset($local['host']) || isset($local['name']) || isset($local['user'])) {
            $local = ['db' => array_intersect_key($local, array_flip(['host', 'port', 'name', 'user', 'pass']))];
        }

        return new self(self::merge(self::DEFAULTS, $local));
    }

    public function get(string $path, mixed $default = null): mixed
    {
        $value = $this->values;
        foreach (explode('.', $path) as $segment) {
            if (!is_array($value) || !array_key_exists($segment, $value)) {
                return $default;
            }
            $value = $value[$segment];
        }

        return $value;
    }

    /** @return array<string, mixed> */
    public function section(string $name): array
    {
        $section = $this->values[$name] ?? [];

        return is_array($section) ? $section : [];
    }

    /**
     * @param array<string, mixed> $base
     * @param array<string, mixed> $override
     * @return array<string, mixed>
     */
    private static function merge(array $base, array $override): array
    {
        foreach ($override as $key => $value) {
            if (is_array($value) && isset($base[$key]) && is_array($base[$key])) {
                $base[$key] = self::merge($base[$key], $value);
            } else {
                $base[$key] = $value;
            }
        }

        return $base;
    }
}
