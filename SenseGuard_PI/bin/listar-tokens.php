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

$options = [];
foreach (array_slice($argv, 1) as $argument) {
    if (preg_match('/^--([a-z-]+)=(.*)$/s', $argument, $match) === 1) {
        $options[$match[1]] = $match[2];
    }
}

try {
    $pdo = App::boot()->pdo();
} catch (Throwable $e) {
    fwrite(STDERR, 'Não foi possível conectar ao banco: ' . $e->getMessage() . PHP_EOL);
    exit(1);
}

$sql = 'SELECT id_token, id_corporacao, nome, permissoes, ips_permitidos, ativo, criado_em, ultimo_uso, revogado_em FROM token_dispositivo';
$params = [];
if (isset($options['corporacao']) && ctype_digit($options['corporacao'])) {
    $sql .= ' WHERE id_corporacao = ?';
    $params[] = (int) $options['corporacao'];
}
$stmt = $pdo->prepare($sql . ' ORDER BY id_token');
$stmt->execute($params);

$rows = $stmt->fetchAll();
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
