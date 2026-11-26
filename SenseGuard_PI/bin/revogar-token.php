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

$options = [];
foreach (array_slice($argv, 1) as $argument) {
    if (preg_match('/^--([a-z-]+)=(.*)$/s', $argument, $match) === 1) {
        $options[$match[1]] = $match[2];
    }
}

if (!isset($options['id']) || !ctype_digit($options['id'])) {
    fwrite(STDERR, 'Uso: php bin/revogar-token.php --id=ID (veja os ids com bin/listar-tokens.php)' . PHP_EOL);
    exit(1);
}

try {
    $pdo = App::boot()->pdo();
} catch (Throwable $e) {
    fwrite(STDERR, 'Não foi possível conectar ao banco: ' . $e->getMessage() . PHP_EOL);
    exit(1);
}

$stmt = $pdo->prepare('UPDATE token_dispositivo SET ativo = 0, revogado_em = ? WHERE id_token = ? AND ativo = 1');
$stmt->execute([date('Y-m-d H:i:s'), (int) $options['id']]);

if ($stmt->rowCount() === 0) {
    fwrite(STDERR, 'Token não encontrado ou já revogado.' . PHP_EOL);
    exit(1);
}

echo 'Token ' . (int) $options['id'] . ' revogado.' . PHP_EOL;
