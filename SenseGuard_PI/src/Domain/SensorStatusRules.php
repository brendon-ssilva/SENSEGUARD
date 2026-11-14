<?php

declare(strict_types=1);

namespace SenseGuard\Domain;

/**
 * Regras do status do sensor. "alerta" e "online" são derivados da leitura em
 * relação aos limites; "offline" é informado manualmente ou pela falta de leituras.
 */
final class SensorStatusRules
{
    public static function fromValue(float $value, float $min, float $max): SensorStatus
    {
        return ($value < $min || $value > $max) ? SensorStatus::Alerta : SensorStatus::Online;
    }

    /** Status gravado ao salvar manualmente: offline é respeitado, o resto vem da leitura. */
    public static function resolve(SensorStatus $requested, float $value, float $min, float $max): SensorStatus
    {
        if ($requested === SensorStatus::Offline) {
            return SensorStatus::Offline;
        }

        return self::fromValue($value, $min, $max);
    }

    /**
     * Status exibido: se o sensor está sem leitura há mais de $offlineAfterMinutes
     * (e o recurso está ativo), é tratado como offline.
     */
    public static function effective(string $status, ?string $lastReadingAt, int $offlineAfterMinutes, ?int $now = null): string
    {
        if ($status === SensorStatus::Offline->value || $offlineAfterMinutes <= 0 || $lastReadingAt === null || $lastReadingAt === '') {
            return $status;
        }

        $timestamp = strtotime($lastReadingAt);
        if ($timestamp === false) {
            return $status;
        }

        return (($now ?? time()) - $timestamp) > $offlineAfterMinutes * 60 ? SensorStatus::Offline->value : $status;
    }
}
