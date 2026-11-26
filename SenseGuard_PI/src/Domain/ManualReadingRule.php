<?php

declare(strict_types=1);

namespace SenseGuard\Domain;

/**
 * Quando um valor digitado no painel vira uma leitura no histórico (origem "manual").
 * Assim o desfazer de uma importação sempre tem um valor anterior para onde voltar.
 */
final class ManualReadingRule
{
    private const EPSILON = 1e-9;

    /**
     * @param float|null $previousValue Valor atual do sensor antes da edição; null ao criar o sensor.
     */
    public static function shouldRecord(?float $previousValue, float $newValue): bool
    {
        if ($previousValue === null) {
            // Novo sensor: o 0 padrão do formulário não é uma leitura.
            return abs($newValue) > self::EPSILON;
        }

        return abs($newValue - $previousValue) > self::EPSILON;
    }
}
