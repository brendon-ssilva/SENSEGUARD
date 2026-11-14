<?php

declare(strict_types=1);

namespace SenseGuard\Http;

/** Cabeçalhos de segurança para páginas HTML e respostas JSON. */
final class SecurityHeaders
{
    /**
     * CSP das páginas. Scripts só do próprio domínio (sem handlers inline).
     * Atributos style="" continuam permitidos (usados só para larguras dinâmicas);
     * as fontes do Google são a única origem externa.
     */
    public const PAGE_CSP = "default-src 'self'; "
        . "script-src 'self'; "
        . "style-src 'self' https://fonts.googleapis.com; "
        . "style-src-attr 'unsafe-inline'; "
        . "font-src 'self' https://fonts.gstatic.com; "
        . "img-src 'self' data:; "
        . "connect-src 'self'; "
        . "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

    /** @return array<string, string> */
    public static function api(): array
    {
        return [
            'Content-Type' => 'application/json; charset=utf-8',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
            'X-Content-Type-Options' => 'nosniff',
            'Referrer-Policy' => 'same-origin',
            'Vary' => 'Cookie',
            'X-Frame-Options' => 'DENY',
            'Content-Security-Policy' => "default-src 'none'; frame-ancestors 'none'",
            'Cross-Origin-Resource-Policy' => 'same-origin',
        ];
    }

    /** Envia os cabeçalhos de uma página HTML (login e dashboard). */
    public static function sendPage(bool $https): void
    {
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: same-origin');
        header('X-Frame-Options: DENY');
        header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
        header('Content-Security-Policy: ' . self::PAGE_CSP);
        if ($https) {
            header('Strict-Transport-Security: max-age=15552000');
        }
    }
}
