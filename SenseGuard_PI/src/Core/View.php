<?php

declare(strict_types=1);

namespace SenseGuard\Core;

/** Auxiliares das páginas PHP (login e dashboard). */
final class View
{
    /** Escapa texto para HTML. */
    public static function e(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    /** URL de um arquivo em public/ com ?v=<data de modificação> para invalidar o cache do navegador. */
    public static function asset(string $path): string
    {
        $file = dirname(__DIR__, 2) . '/public/' . ltrim($path, '/');
        $version = is_file($file) ? (string) filemtime($file) : App::VERSION;

        return self::e($path . '?v=' . $version);
    }
}
