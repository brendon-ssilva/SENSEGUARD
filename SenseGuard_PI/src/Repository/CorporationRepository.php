<?php

declare(strict_types=1);

namespace SenseGuard\Repository;

/** Somente leitura: cada usuário enxerga apenas a própria organização. */
final class CorporationRepository extends TenantRepository
{
    protected function table(): string
    {
        return 'corporacao';
    }

    protected function primaryKey(): string
    {
        return 'id_corporacao';
    }

    protected function columns(): string
    {
        return 'id_corporacao, nome, cnpj, email';
    }
}
