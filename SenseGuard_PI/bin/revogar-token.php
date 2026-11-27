<?php

declare(strict_types=1);

/**
 * Revoga um token (ele deixa de funcionar na hora; o registro é mantido para consulta).
 *
 *   php bin/revogar-token.php --id=3
 *
 * Para trocar um token (rotação): crie o novo com bin/criar-token-dispositivo.php, atualize o
 * segredo no serviço que o usa e só então revogue o antigo.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require dirname(__DIR__) . '/src/bootstrap.php';

use SenseGuard\Core\App;
use SenseGuard\Auth\TokenCliOptions;

try {
    $options = TokenCliOptions::parse(array_slice($argv, 1), ['id']);
    $id = TokenCliOptions::positiveId($options['id'] ?? null);
} catch (InvalidArgumentException $e) {
    fwrite(STDERR, $e->getMessage() . PHP_EOL);
    exit(1);
}

try {
    $pdo = App::boot()->pdo();
    $stmt = $pdo->prepare('UPDATE token_dispositivo SET ativo = 0, revogado_em = ? WHERE id_token = ? AND ativo = 1');
    $stmt->execute([date('Y-m-d H:i:s'), $id]);
} catch (Throwable $e) {
    fwrite(STDERR, 'Não foi possível revogar o token. Confira a conexão e as permissões.' . PHP_EOL);
    exit(1);
}

if ($stmt->rowCount() === 0) {
    fwrite(STDERR, 'Token não encontrado ou já revogado.' . PHP_EOL);
    exit(1);
}

echo 'Token ' . $id . ' revogado.' . PHP_EOL;
