<?php

declare(strict_types=1);

namespace SenseGuard\Auth;

use InvalidArgumentException;

/** Strict argument parsing for token administration; a typo must not broaden access. */
final class TokenCliOptions
{
    /** @param list<string> $arguments @param list<string> $allowed @return array<string, string> */
    public static function parse(array $arguments, array $allowed): array
    {
        $options = [];
        foreach ($arguments as $argument) {
            if (preg_match('/^--([a-z-]+)=(.*)$/sD', $argument, $match) !== 1
                || !in_array($match[1], $allowed, true) || isset($options[$match[1]])) {
                throw new InvalidArgumentException('Opção desconhecida, repetida ou inválida. Use --opcao=valor.');
            }
            $options[$match[1]] = $match[2];
        }

        return $options;
    }

    public static function positiveId(?string $value): int
    {
        if ($value === null || preg_match('/^[1-9][0-9]{0,9}$/D', $value) !== 1
            || (float) $value > min(4294967295, PHP_INT_MAX)) {
            throw new InvalidArgumentException('Informe um identificador inteiro positivo válido.');
        }

        return (int) $value;
    }

    /** @return list<string> */
    public static function ips(?string $value): array
    {
        $ips = IpAllowList::parse($value);
        if ($value !== null && $ips === []) {
            throw new InvalidArgumentException('Lista de IPs vazia. Omita --ips para permitir qualquer origem.');
        }
        if (strlen(implode(',', $ips)) > 500) {
            throw new InvalidArgumentException('A lista de IPs excede o limite de 500 caracteres.');
        }
        foreach ($ips as $rule) {
            $probe = explode('/', $rule, 2)[0];
            if (!IpAllowList::matches($probe, $rule)) {
                throw new InvalidArgumentException('IP ou faixa CIDR inválida em --ips.');
            }
        }

        return $ips;
    }
}
