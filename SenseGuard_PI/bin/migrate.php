<?php

declare(strict_types=1);

/**
 * Aplica as migrações de database/migrations em ordem.
 *
 *   php bin/migrate.php            aplica as migrações pendentes
 *   php bin/migrate.php --status   lista o que já foi aplicado e o que falta
 *
 * Bancos criados com o esquema antigo (sem a tabela "migracao") são reconhecidos:
 * a migração 001 é registrada sem ser executada e as demais são aplicadas.
 * FAÇA BACKUP antes: comandos DDL do MySQL não podem ser desfeitos (rollback).
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require dirname(__DIR__) . '/src/bootstrap.php';

use SenseGuard\Core\App;

/** @return list<string> */
function splitSql(string $sql): array
{
    $sql = (string) preg_replace('~/\*.*?\*/~s', '', $sql);
    $statements = [];
    $buffer = '';

    foreach (preg_split('/\R/', $sql) ?: [] as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '--')) {
            continue;
        }
        $buffer .= $line . "\n";
        if (str_ends_with($trimmed, ';')) {
            $statements[] = trim($buffer);
            $buffer = '';
        }
    }

    if (trim($buffer) !== '') {
        $statements[] = trim($buffer);
    }

    return $statements;
}

try {
    $app = App::boot();
    $pdo = $app->pdo();
} catch (Throwable $e) {
    fwrite(STDERR, 'Não foi possível conectar ao banco: ' . $e->getMessage() . PHP_EOL);
    fwrite(STDERR, 'Confira config/config.local.php e se o MySQL está ligado.' . PHP_EOL);
    exit(1);
}

$pdo->exec(
    'CREATE TABLE IF NOT EXISTS migracao (
        versao VARCHAR(100) NOT NULL,
        executada_em DATETIME NOT NULL,
        PRIMARY KEY (versao)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
);

$files = glob(dirname(__DIR__) . '/database/migrations/*.sql') ?: [];
sort($files);

$applied = $pdo->query('SELECT versao FROM migracao')->fetchAll(PDO::FETCH_COLUMN);
$record = $pdo->prepare('INSERT INTO migracao (versao, executada_em) VALUES (?, ?)');

// Banco legado: já tem as tabelas da 001, mas nunca usou o controle de migrações.
if ($applied === [] && $files !== []) {
    $legacy = $pdo->query("SHOW TABLES LIKE 'usuario'")->fetchColumn();
    if ($legacy !== false) {
        $first = basename($files[0], '.sql');
        $record->execute([$first, date('Y-m-d H:i:s')]);
        $applied[] = $first;
        echo "Banco existente detectado: {$first} registrada como já aplicada." . PHP_EOL;
    }
}

$statusOnly = in_array('--status', array_slice($argv, 1), true);
$pending = 0;

foreach ($files as $file) {
    $version = basename($file, '.sql');

    if (in_array($version, $applied, true)) {
        echo "[ok]       {$version}" . PHP_EOL;
        continue;
    }

    $pending++;
    if ($statusOnly) {
        echo "[pendente] {$version}" . PHP_EOL;
        continue;
    }

    echo "[aplicando] {$version} ... ";
    try {
        foreach (splitSql((string) file_get_contents($file)) as $statement) {
            $pdo->exec($statement);
        }
    } catch (Throwable $e) {
        echo 'ERRO' . PHP_EOL;
        fwrite(STDERR, $e->getMessage() . PHP_EOL);
        fwrite(STDERR, "A migração {$version} não foi registrada. Corrija o problema (ou restaure o backup) e rode novamente." . PHP_EOL);
        exit(1);
    }

    $record->execute([$version, date('Y-m-d H:i:s')]);
    echo 'ok' . PHP_EOL;
}

echo $pending === 0 ? 'Nada a fazer: banco atualizado.' . PHP_EOL : ($statusOnly ? "{$pending} migração(ões) pendente(s)." : 'Concluído.') . PHP_EOL;
