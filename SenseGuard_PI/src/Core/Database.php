<?php

declare(strict_types=1);

namespace SenseGuard\Core;

use PDO;
use PDOException;
use Throwable;

/** Conexão PDO e utilitário de transações. */
final class Database
{
    public static function connect(Config $config): PDO
    {
        $db = $config->section('db');
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            (string) ($db['host'] ?? '127.0.0.1'),
            (int) ($db['port'] ?? 3306),
            (string) ($db['name'] ?? 'senseguard')
        );

        try {
            return new PDO($dsn, (string) ($db['user'] ?? ''), (string) ($db['pass'] ?? ''), [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_STRINGIFY_FETCHES => false,
            ]);
        } catch (PDOException $e) {
            error_log('SenseGuard: falha ao conectar ao banco: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Executa $callback dentro de uma transação. Se já houver uma transação
     * aberta, apenas executa o callback (a transação externa decide o commit).
     *
     * @template T
     * @param callable(): T $callback
     * @return T
     */
    public static function transaction(PDO $pdo, callable $callback): mixed
    {
        if ($pdo->inTransaction()) {
            return $callback();
        }

        $pdo->beginTransaction();
        try {
            $result = $callback();
            $pdo->commit();

            return $result;
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }
}
