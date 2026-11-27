<?php

declare(strict_types=1);

namespace SenseGuard\Auth;

/**
 * Lista de origens permitidas para um token: IPs exatos ou faixas CIDR (IPv4 e IPv6).
 * Lista vazia = qualquer origem. É uma camada extra: não substitui o token nem o firewall.
 */
final class IpAllowList
{
    /**
     * "10.0.0.5, 192.168.1.0/24" => ['10.0.0.5', '192.168.1.0/24'].
     *
     * @return list<string>
     */
    public static function parse(?string $text): array
    {
        $items = [];
        foreach (preg_split('/[\s,;]+/', (string) $text) ?: [] as $item) {
            $item = trim($item);
            if ($item !== '' && !in_array($item, $items, true)) {
                $items[] = $item;
            }
        }

        return $items;
    }

    /** @param list<string> $rules */
    public static function allows(array $rules, string $ip): bool
    {
        if ($rules === []) {
            return true;
        }
        foreach ($rules as $rule) {
            if (self::matches($ip, $rule)) {
                return true;
            }
        }

        return false;
    }

    public static function matches(string $ip, string $rule): bool
    {
        $packedIp = self::pack($ip);
        if ($packedIp === null) {
            return false;
        }

        if (!str_contains($rule, '/')) {
            return $packedIp === self::pack($rule);
        }

        [$network, $bitsText] = explode('/', $rule, 2);
        $packedNetwork = self::pack($network);
        if ($packedNetwork === null || !ctype_digit($bitsText) || strlen($packedNetwork) !== strlen($packedIp)) {
            return false;
        }

        $bits = (int) $bitsText;
        if ($bits > strlen($packedNetwork) * 8) {
            return false;
        }

        $fullBytes = intdiv($bits, 8);
        if ($fullBytes > 0 && substr($packedIp, 0, $fullBytes) !== substr($packedNetwork, 0, $fullBytes)) {
            return false;
        }

        $remaining = $bits % 8;
        if ($remaining === 0) {
            return true;
        }

        $mask = (0xFF << (8 - $remaining)) & 0xFF;

        return (ord($packedIp[$fullBytes]) & $mask) === (ord($packedNetwork[$fullBytes]) & $mask);
    }

    /** Endereço em formato binário; IPv6 "mapeado" (::ffff:a.b.c.d) vira IPv4. null se inválido. */
    private static function pack(string $address): ?string
    {
        $packed = @inet_pton($address);
        if ($packed === false) {
            return null;
        }

        if (strlen($packed) === 16 && substr($packed, 0, 12) === "\0\0\0\0\0\0\0\0\0\0\xff\xff") {
            return substr($packed, 12);
        }

        return $packed;
    }
}
