<?php

declare(strict_types=1);

namespace SenseGuard\Validation;

use LogicException;

/** Valida e apresenta campos a partir de uma especificação (ver Domain\Specs). */
final class Fields
{
    /**
     * Valida a entrada e devolve [coluna => valor].
     *
     * @param array<string, mixed> $input
     * @param array<string, array<string, mixed>> $spec
     * @param bool $onlyProvided Se true, valida só as chaves presentes (atualização parcial).
     * @return array<string, mixed>
     */
    public static function validate(array $input, array $spec, bool $onlyProvided = false): array
    {
        $data = [];
        foreach ($spec as $key => $field) {
            if ($onlyProvided && !array_key_exists($key, $input)) {
                continue;
            }

            $value = array_key_exists($key, $input) ? $input[$key] : ($field['default'] ?? null);
            $label = (string) $field['label'];

            $data[(string) $field['col']] = match ($field['type']) {
                'text' => Validator::text($value, $key, $label, (int) $field['max'], (bool) ($field['required'] ?? false)),
                'date' => Validator::date($value, $key, $label),
                'datetime' => Validator::dateTime($value, $key, $label),
                'number' => Validator::number($value, $key, $label, (float) $field['min'], (float) $field['max']),
                'enum' => Validator::enum($value, (string) $field['enum'], $key, $label),
                default => throw new LogicException('Tipo de campo desconhecido: ' . (string) $field['type']),
            };
        }

        return $data;
    }

    /**
     * Converte uma linha do banco nas chaves da API.
     *
     * @param array<string, mixed> $row
     * @param array<string, array<string, mixed>> $spec
     * @return array<string, mixed>
     */
    public static function present(array $row, array $spec): array
    {
        $out = [];
        foreach ($spec as $key => $field) {
            $value = $row[$field['col']] ?? null;
            $out[$key] = $field['type'] === 'number' ? (float) ($value ?? 0) : (string) ($value ?? '');
        }

        return $out;
    }
}
