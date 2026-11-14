<?php

declare(strict_types=1);

namespace SenseGuard\Tests;

use RuntimeException;
use SenseGuard\Http\ApiException;
use Throwable;

/** Mini framework de testes (sem dependências): métodos testXxx() de cada classe são executados por tests/run.php. */
abstract class TestCase
{
    protected function assertSame(mixed $expected, mixed $actual, string $message = ''): void
    {
        if ($expected !== $actual) {
            throw new RuntimeException(
                ($message !== '' ? $message . ' — ' : '')
                . 'esperado ' . var_export($expected, true) . ', recebido ' . var_export($actual, true)
            );
        }
    }

    protected function assertTrue(bool $condition, string $message = 'a condição deveria ser verdadeira'): void
    {
        if (!$condition) {
            throw new RuntimeException($message);
        }
    }

    protected function assertNull(mixed $value, string $message = 'o valor deveria ser null'): void
    {
        if ($value !== null) {
            throw new RuntimeException($message . ' (recebido ' . var_export($value, true) . ')');
        }
    }

    /** Garante que $callback lança ApiException com o status (e, opcionalmente, o campo) esperados. */
    protected function assertApiError(callable $callback, int $status, ?string $field = null): ApiException
    {
        try {
            $callback();
        } catch (ApiException $e) {
            $this->assertSame($status, $e->status(), 'status HTTP');
            if ($field !== null) {
                $this->assertSame($field, $e->field(), 'campo do erro');
            }

            return $e;
        } catch (Throwable $e) {
            throw new RuntimeException('Esperava ApiException, mas veio ' . $e::class . ': ' . $e->getMessage());
        }

        throw new RuntimeException('Esperava ApiException(' . $status . '), mas nada foi lançado.');
    }
}
