<?php

declare(strict_types=1);

namespace SenseGuard\Validation;

use BackedEnum;
use DateTimeImmutable;
use SenseGuard\Http\ApiException;

/** Validações reutilizáveis. Lançam ApiException(422) indicando o campo com problema. */
final class Validator
{
    public static function length(string $value): int
    {
        if (function_exists('mb_strlen')) {
            return mb_strlen($value, 'UTF-8');
        }
        $count = preg_match_all('/./us', $value);

        return $count === false ? strlen($value) : $count;
    }

    public static function text(mixed $value, string $field, string $label, int $max, bool $required = false): ?string
    {
        if ($required) {
            if (!is_string($value)) {
                throw new ApiException(422, $label . ' é obrigatório.', $field);
            }
            $value = trim($value);
            if ($value === '' || self::length($value) > $max) {
                throw new ApiException(422, 'Informe um valor válido para ' . $label . '.', $field);
            }

            return $value;
        }

        if ($value === null || $value === '') {
            return null;
        }
        if (!is_string($value)) {
            throw new ApiException(422, 'Valor inválido para ' . $label . '.', $field);
        }
        $value = trim($value);
        if (self::length($value) > $max) {
            throw new ApiException(422, $label . ' excede o tamanho permitido.', $field);
        }

        return $value === '' ? null : $value;
    }

    public static function email(string $value, string $field = 'email'): string
    {
        if (filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
            throw new ApiException(422, 'Informe um endereço de e-mail válido.', $field);
        }

        return $value;
    }

    public static function date(mixed $value, string $field, string $label): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        if (!is_string($value)) {
            throw new ApiException(422, 'Data inválida: ' . $label . '.', $field);
        }

        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
        $errors = DateTimeImmutable::getLastErrors();
        if (
            $date === false
            || ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))
            || $date->format('Y-m-d') !== $value
        ) {
            throw new ApiException(422, 'Informe uma data válida para ' . $label . '.', $field);
        }

        return $value;
    }

    public static function dateTime(mixed $value, string $field, string $label): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        if (!is_string($value)) {
            throw new ApiException(422, 'Data e hora inválidas: ' . $label . '.', $field);
        }

        foreach (['!Y-m-d H:i:s', '!Y-m-d\TH:i:s'] as $format) {
            $date = DateTimeImmutable::createFromFormat($format, $value);
            $errors = DateTimeImmutable::getLastErrors();
            if ($date !== false && ($errors === false || ($errors['warning_count'] === 0 && $errors['error_count'] === 0))) {
                return $date->format('Y-m-d H:i:s');
            }
        }

        throw new ApiException(422, 'Informe uma data e hora válidas para ' . $label . '.', $field);
    }

    public static function number(mixed $value, string $field, string $label, float $min, float $max): float
    {
        if (!is_int($value) && !is_float($value) && !(is_string($value) && is_numeric($value))) {
            throw new ApiException(422, 'Informe um número válido para ' . $label . '.', $field);
        }

        $number = (float) $value;
        if (!is_finite($number) || $number < $min || $number > $max) {
            throw new ApiException(422, 'O valor de ' . $label . ' está fora do intervalo permitido.', $field);
        }

        return $number;
    }

    /** @param class-string<BackedEnum> $enumClass */
    public static function enum(mixed $value, string $enumClass, string $field, string $label): string
    {
        if (!is_string($value) || $enumClass::tryFrom($value) === null) {
            throw new ApiException(422, 'Valor inválido para ' . $label . '.', $field);
        }

        return $value;
    }

    public static function id(mixed $value, string $field, string $label): int
    {
        if ((!is_string($value) && !is_int($value)) || !ctype_digit((string) $value) || (int) $value < 1) {
            throw new ApiException(422, 'Selecione um registro válido para ' . $label . '.', $field);
        }

        return (int) $value;
    }

    /** @return list<int> */
    public static function idList(mixed $values, string $field, string $label, int $max = 500): array
    {
        if (!is_array($values) || count($values) > $max || !array_is_list($values)) {
            throw new ApiException(422, 'A lista de ' . $label . ' é inválida.', $field);
        }

        $ids = [];
        foreach ($values as $value) {
            $id = self::id($value, $field, $label);
            if (in_array($id, $ids, true)) {
                throw new ApiException(422, 'A lista contém ' . $label . ' duplicados.', $field);
            }
            $ids[] = $id;
        }

        return $ids;
    }

    /**
     * @param array<string, mixed> $input
     * @param list<string> $allowed
     */
    public static function rejectUnknown(array $input, array $allowed): void
    {
        $unknown = array_values(array_diff(array_keys($input), $allowed));
        if ($unknown !== []) {
            throw new ApiException(400, 'A requisição contém campos não permitidos.', (string) $unknown[0]);
        }
    }
}
