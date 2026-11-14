<?php

declare(strict_types=1);

/**
 * Executa os testes unitários:  php tests/run.php
 * Não precisa de banco de dados nem do Composer.
 */

require dirname(__DIR__) . '/src/bootstrap.php';
require __DIR__ . '/TestCase.php';

use SenseGuard\Tests\TestCase;

$passed = 0;
$failures = [];

$files = glob(__DIR__ . '/Unit/*Test.php') ?: [];
sort($files);

foreach ($files as $file) {
    $before = get_declared_classes();
    require_once $file;

    foreach (array_diff(get_declared_classes(), $before) as $class) {
        if (!is_subclass_of($class, TestCase::class)) {
            continue;
        }

        foreach (get_class_methods($class) as $method) {
            if (!str_starts_with($method, 'test')) {
                continue;
            }

            try {
                (new $class())->$method();
                $passed++;
                echo '.';
            } catch (Throwable $e) {
                $failures[] = $class . '::' . $method . ' — ' . $e->getMessage();
                echo 'F';
            }
        }
    }
}

echo PHP_EOL . PHP_EOL . $passed . ' teste(s) passaram, ' . count($failures) . ' falharam.' . PHP_EOL;
foreach ($failures as $failure) {
    echo ' - ' . $failure . PHP_EOL;
}

exit($failures === [] ? 0 : 1);
