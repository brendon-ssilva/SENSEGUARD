<?php

declare(strict_types=1);

namespace SenseGuard\Auth;

/** Permissões de um token de dispositivo/integração (guardadas em token_dispositivo.permissoes). */
final class TokenPermissions
{
    public const READINGS_WRITE = 'readings:write';
    public const SENSORS_READ = 'sensors:read';
    public const IMPORTS_WRITE = 'imports:write';
    public const IMPORTS_READ = 'imports:read';
    public const IMPORTS_CANCEL = 'imports:cancel';

    public const ALL = [
        self::READINGS_WRITE,
        self::SENSORS_READ,
        self::IMPORTS_WRITE,
        self::IMPORTS_READ,
        self::IMPORTS_CANCEL,
    ];

    /**
     * "a:b, c:d" => ['a:b', 'c:d'] (minúsculas, sem repetições nem itens vazios).
     *
     * @return list<string>
     */
    public static function parse(?string $text): array
    {
        $items = [];
        foreach (explode(',', (string) $text) as $item) {
            $item = strtolower(trim($item));
            if ($item !== '' && !in_array($item, $items, true)) {
                $items[] = $item;
            }
        }

        return $items;
    }

    /**
     * @param list<string> $permissions
     * @return list<string> Itens que não existem.
     */
    public static function unknown(array $permissions): array
    {
        return array_values(array_diff($permissions, self::ALL));
    }

    /** @param list<string> $granted */
    public static function has(array $granted, string $needed): bool
    {
        return in_array($needed, $granted, true);
    }
}
