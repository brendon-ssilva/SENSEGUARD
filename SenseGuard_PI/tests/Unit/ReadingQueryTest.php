<?php

declare(strict_types=1);

namespace SenseGuard\Tests\Unit;

use SenseGuard\Http\Request;
use SenseGuard\Repository\ReadingQuery;
use SenseGuard\Tests\TestCase;

final class ReadingQueryTest extends TestCase
{
    public function testEmptyFiltersAreTenantScopedAndBounded(): void
    {
        $query = ReadingQuery::build([], 7);
        $this->assertSame([7, 51, 0], $query['params']);
        $this->assertSame(1, $query['page']);
        $this->assertTrue(str_contains($query['sql'], 'd.id_corporacao = ? AND d.anulada_em IS NULL'));
        $this->assertTrue(str_contains($query['sql'], 's.id_corporacao = d.id_corporacao'));
        $this->assertTrue(str_contains($query['sql'], 'm.id_corporacao = d.id_corporacao'));
        $this->assertTrue(str_ends_with($query['sql'], 'ORDER BY d.data_hora DESC, d.id_medida DESC LIMIT ? OFFSET ?'));
        foreach (['id_usuario', 'senha', 'email', 'telefone', 'SELECT *'] as $private) {
            $this->assertTrue(!str_contains($query['sql'], $private));
        }
    }

    public function testCombinedFiltersAndPagination(): void
    {
        $query = ReadingQuery::build([
            'q' => 'Bomba_100%!', 'type' => 'temperatura', 'origin' => 'importacao',
            'from' => '2026-11-01', 'to' => '2026-11-27', 'sort' => 'oldest', 'page' => 2,
        ], 9);
        $this->assertSame([9, '%Bomba!_100!%!!%', '%Bomba!_100!%!!%', 'temperatura', 'importacao',
            '2026-11-01 00:00:00', '2026-11-27 23:59:59', 51, 50], $query['params']);
        $this->assertSame(substr_count($query['sql'], '?'), count($query['params']));
        $this->assertTrue(str_contains($query['sql'], "s.nome LIKE ? ESCAPE '!' OR m.nome LIKE ? ESCAPE '!'"));
        $this->assertTrue(str_contains($query['sql'], 'd.tipo_medida = ? AND d.origem = ?'));
        $this->assertTrue(str_contains($query['sql'], 'd.data_hora >= ? AND d.data_hora <= ?'));
        $this->assertTrue(str_ends_with($query['sql'], 'ORDER BY d.data_hora ASC, d.id_medida ASC LIMIT ? OFFSET ?'));
    }

    public function testEmptyFieldsAndLastPage(): void
    {
        $query = ReadingQuery::build(['q' => '  ', 'type' => '', 'origin' => '', 'from' => '', 'to' => '', 'page' => 2000], 7);
        $this->assertSame([7, 51, 99950], $query['params']);
    }

    public function testTextInjectionRemainsAParameter(): void
    {
        $payload = "' OR 1=1 -- <img src=x onerror=alert(1)>";
        $query = ReadingQuery::build(['q' => $payload], 7);
        $this->assertTrue(!str_contains($query['sql'], $payload));
        $this->assertSame('%' . $payload . '%', $query['params'][1]);
    }

    public function testUnknownFieldsAndInvalidTypesAreRejected(): void
    {
        $this->assertApiError(fn () => ReadingQuery::build(['corporationId' => 8], 7), 400, 'corporationId');
        $this->assertApiError(fn () => ReadingQuery::build(['sort' => 'DESC; DROP TABLE dados'], 7), 422, 'sort');
        $this->assertApiError(fn () => ReadingQuery::build(['type' => 'invalid'], 7), 422, 'type');
        $this->assertApiError(fn () => ReadingQuery::build(['origin' => []], 7), 422, 'origin');
        $this->assertApiError(fn () => ReadingQuery::build(['page' => '2'], 7), 422, 'page');
        $this->assertApiError(fn () => ReadingQuery::build(['page' => 2001], 7), 422, 'page');
        $this->assertApiError(fn () => ReadingQuery::build(['q' => str_repeat('x', 101)], 7), 422, 'q');
    }

    public function testDateValidation(): void
    {
        $this->assertApiError(fn () => ReadingQuery::build(['from' => '2026-02-30'], 7), 422, 'from');
        $this->assertApiError(fn () => ReadingQuery::build(['from' => '0999-01-01'], 7), 422, 'from');
        $this->assertApiError(fn () => ReadingQuery::build(['from' => '2026-11-28', 'to' => '2026-11-27'], 7), 422, 'to');
    }

    public function testRequestAllowsEmptyObjectOnlyWhenOptedIn(): void
    {
        $server = ['CONTENT_TYPE' => 'application/json'];
        $this->assertSame([], (new Request('POST', [], $server, '{ }'))->json(4096, true));
        $this->assertApiError(fn () => (new Request('POST', [], $server, '[]'))->json(4096, true), 400);
        $this->assertApiError(fn () => (new Request('POST', [], $server, '{}'))->json(), 400);
        $this->assertApiError(fn () => (new Request('POST', [], $server, str_repeat('x', 4097)))->json(4096, true), 413);
    }
}
