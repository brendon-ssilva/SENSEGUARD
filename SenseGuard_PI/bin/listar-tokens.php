<?php

declare(strict_types=1);

/**
 * Lista os tokens de dispositivos e integrações (nunca mostra o token, só dados de controle).
 *
 *   php bin/listar-tokens.php [--corporacao=1]
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require dirname(__DIR__) . '/src/bootstrap.php';

use SenseGuard\Core\App;
use SenseGuard\Auth\TokenCliOptions;

try {
    $options = TokenCliOptions::parse(array_slice($argv, 1), ['corporacao']);
    $corporationId = isset($options['corporacao']) ? TokenCliOptions::positiveId($options['corporacao']) : null;
} catch (InvalidArgumentException $e) {
    fwrite(STDERR, $e->getMessage() . PHP_EOL);
    exit(1);
}

try {
    $pdo = App::boot()->pdo();
    $sql = 'SELECT id_token, id_corporacao, nome, permissoes, ips_permitidos, ativo, criado_em, ultimo_uso, revogado_em FROM token_dispositivo';
    $params = [];
    if ($corporationId !== null) {
        $sql .= ' WHERE id_corporacao = ?';
        $params[] = $corporationId;
    }
    $stmt = $pdo->prepare($sql . ' ORDER BY id_token');
    $stmt->execute($params);

    $rows = $stmt->fetchAll();
} catch (Throwable $e) {
    fwrite(STDERR, 'Não foi possível listar os tokens. Confira a conexão e as permissões.' . PHP_EOL);
    exit(1);
}

if ($rows === []) {
    echo 'Nenhum token encontrado.' . PHP_EOL;
    exit(0);
}

foreach ($rows as $row) {
    $state = (int) $row['ativo'] === 1 ? 'ativo   ' : 'revogado';
    echo sprintf(
        '#%-4d %s org %-3d %s' . PHP_EOL,
        $row['id_token'],
        $state,
        $row['id_corporacao'],
        $row['nome']
    );
    echo '       permissões: ' . $row['permissoes'] . PHP_EOL;
    echo '       origens:    ' . (($row['ips_permitidos'] ?? '') === '' ? 'qualquer' : $row['ips_permitidos']) . PHP_EOL;
    echo '       criado em ' . $row['criado_em'] . ' · último uso: ' . ($row['ultimo_uso'] ?? 'nunca')
        . ($row['revogado_em'] !== null ? ' · revogado em ' . $row['revogado_em'] : '') . PHP_EOL;
}
