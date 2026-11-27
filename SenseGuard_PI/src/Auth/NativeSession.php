<?php

declare(strict_types=1);

namespace SenseGuard\Auth;

use RuntimeException;

/** Sessão nativa do PHP com cookie HttpOnly/SameSite e início sob demanda. */
final class NativeSession implements SessionStore
{
    public function __construct(
        private int $ttl = 7200,
        private ?bool $secureCookie = null,
    ) {
    }

    private function start(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.cookie_httponly', '1');
        ini_set('session.cookie_samesite', 'Lax');
        ini_set('session.gc_maxlifetime', (string) $this->ttl);

        session_name('SENSEGUARDSESSID');

        $https = $this->secureCookie ?? (
            isset($_SERVER['HTTPS'])
            && $_SERVER['HTTPS'] !== ''
            && strtolower((string) $_SERVER['HTTPS']) !== 'off'
        );

        // O cookie vale apenas para a pasta onde os scripts públicos estão.
        $basePath = str_replace('\\', '/', dirname((string) ($_SERVER['SCRIPT_NAME'] ?? '/')));
        $cookiePath = rtrim($basePath, '/');
        if ($cookiePath === '') {
            $cookiePath = '/';
        }

        session_set_cookie_params([
            'lifetime' => 0,
            'path' => $cookiePath,
            'secure' => $https,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        if (!session_start()) {
            throw new RuntimeException('Não foi possível iniciar a sessão.');
        }
    }

    public function get(string $key, mixed $default = null): mixed
    {
        $this->start();

        return $_SESSION[$key] ?? $default;
    }

    public function set(string $key, mixed $value): void
    {
        $this->start();
        $_SESSION[$key] = $value;
    }

    public function has(string $key): bool
    {
        $this->start();

        return array_key_exists($key, $_SESSION);
    }

    public function remove(string $key): void
    {
        $this->start();
        unset($_SESSION[$key]);
    }

    public function regenerate(): void
    {
        $this->start();
        if (!session_regenerate_id(true)) {
            throw new RuntimeException('Falha ao regenerar o identificador da sessão.');
        }
    }

    public function destroy(): void
    {
        $this->start();
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires' => time() - 42000,
                'path' => $params['path'] ?: '/',
                'domain' => $params['domain'],
                'secure' => $params['secure'],
                'httponly' => $params['httponly'],
                'samesite' => $params['samesite'] ?? 'Lax',
            ]);
        }

        session_destroy();
    }
}
