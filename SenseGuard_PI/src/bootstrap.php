<?php

declare(strict_types=1);

/**
 * Bootstrap do SenseGuard: valida a versão do PHP e registra o autoload PSR-4
 * (namespace SenseGuard\ => pasta src/). Não depende do Composer.
 */

if (PHP_VERSION_ID < 80100) {
    http_response_code(500);
    exit('O SenseGuard requer PHP 8.1 ou superior.');
}

if (function_exists('mb_internal_encoding')) {
    mb_internal_encoding('UTF-8');
}

spl_autoload_register(static function (string $class): void {
    $prefix = 'SenseGuard\\';
    if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
        return;
    }

    $file = __DIR__ . '/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
    if (is_file($file)) {
        require $file;
    }
});
