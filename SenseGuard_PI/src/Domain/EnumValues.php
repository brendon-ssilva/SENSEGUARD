<?php

declare(strict_types=1);

namespace SenseGuard\Domain;

/** Utilitários comuns aos enums de domínio (todos "backed" por string e com label()). */
trait EnumValues
{
    /** @return list<string> */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }

    /** @return list<array{value: string, label: string}> */
    public static function options(): array
    {
        return array_map(
            static fn (self $case): array => ['value' => $case->value, 'label' => $case->label()],
            self::cases()
        );
    }
}
