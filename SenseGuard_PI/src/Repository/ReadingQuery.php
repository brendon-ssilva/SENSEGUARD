<?php

declare(strict_types=1);

namespace SenseGuard\Repository;

use SenseGuard\Domain\ReadingOrigin;
use SenseGuard\Domain\SensorType;
use SenseGuard\Http\ApiException;
use SenseGuard\Validation\Validator;

/** Consulta exclusivamente operacional; nenhum identificador de usuário é projetado. */
final class ReadingQuery
{
    public const PAGE_SIZE = 50;
    public const MAX_PAGE = 2000;

    /**
     * @param array<string, mixed> $input
     * @return array{sql: string, params: list<int|string>, page: int}
     */
    public static function build(array $input, int $corporationId): array
    {
        Validator::rejectUnknown($input, ['q', 'type', 'origin', 'from', 'to', 'sort', 'page']);
        $page = $input['page'] ?? 1;
        if (!is_int($page) || $page < 1 || $page > self::MAX_PAGE) {
            throw new ApiException(422, 'Página fora do intervalo permitido.', 'page');
        }
        $sort = $input['sort'] ?? 'recent';
        $orders = ['recent' => 'd.data_hora DESC, d.id_medida DESC', 'oldest' => 'd.data_hora ASC, d.id_medida ASC'];
        if (!is_string($sort) || !isset($orders[$sort])) {
            throw new ApiException(422, 'Ordenação inválida.', 'sort');
        }

        $where = ['d.id_corporacao = ?', 'd.anulada_em IS NULL'];
        $params = [$corporationId];

        $q = Validator::text($input['q'] ?? null, 'q', 'busca', 100);
        if ($q !== null) {
            // LIKE literal: !, % e _ não podem ampliar a pesquisa como curingas.
            $pattern = '%' . strtr($q, ['!' => '!!', '%' => '!%', '_' => '!_']) . '%';
            $where[] = "(s.nome LIKE ? ESCAPE '!' OR m.nome LIKE ? ESCAPE '!')";
            $params[] = $pattern;
            $params[] = $pattern;
        }
        foreach (['type' => [SensorType::class, 'd.tipo_medida'], 'origin' => [ReadingOrigin::class, 'd.origem']] as $field => [$enum, $column]) {
            $value = $input[$field] ?? null;
            if ($value !== null && $value !== '') {
                $where[] = $column . ' = ?';
                $params[] = Validator::enum($value, $enum, $field, $field === 'type' ? 'tipo de medida' : 'origem');
            }
        }

        $from = Validator::date($input['from'] ?? null, 'from', 'data inicial');
        $to = Validator::date($input['to'] ?? null, 'to', 'data final');
        foreach (['from' => $from, 'to' => $to] as $field => $date) {
            if ($date !== null && $date < '1000-01-01') {
                throw new ApiException(422, 'Data fora do intervalo do banco.', $field);
            }
        }
        if ($from !== null && $to !== null && $from > $to) {
            throw new ApiException(422, 'A data final deve ser igual ou posterior à inicial.', 'to');
        }
        if ($from !== null) {
            $where[] = 'd.data_hora >= ?';
            $params[] = $from . ' 00:00:00';
        }
        if ($to !== null) {
            $where[] = 'd.data_hora <= ?';
            $params[] = $to . ' 23:59:59';
        }

        $sql = 'SELECT d.id_medida, d.tipo_medida, d.valor, d.data_hora, d.origem, '
            . 's.nome AS sensor, m.nome AS maquina '
            . 'FROM dados AS d '
            . 'LEFT JOIN sensor AS s ON s.id_sensor = d.id_sensor AND s.id_corporacao = d.id_corporacao '
            . 'LEFT JOIN maquina AS m ON m.id_maquina = d.id_maquina AND m.id_corporacao = d.id_corporacao '
            . 'WHERE ' . implode(' AND ', $where)
            . ' ORDER BY ' . $orders[$sort] . ' LIMIT ? OFFSET ?';

        $params[] = self::PAGE_SIZE + 1;
        $params[] = ($page - 1) * self::PAGE_SIZE;

        return ['sql' => $sql, 'params' => $params, 'page' => $page];
    }
}
