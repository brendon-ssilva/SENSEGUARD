<?php

declare(strict_types=1);

/**
 * Gera um token para um dispositivo/gateway ou para uma integração (ex.: serviço Laravel).
 *
 *   php bin/criar-token-dispositivo.php --corporacao=1 --nome="Gateway Linha 1"
 *   php bin/criar-token-dispositivo.php --corporacao=1 --nome="Integração Laravel" \
 *       --permissoes=sensors:read,imports:write,imports:read,imports:cancel --ips=10.0.0.5,192.168.1.0/24
 *
 * --corporacao  OBRIGATÓRIO (não há mais padrão: cada token pertence a uma organização)
 * --permissoes  readings:write (padrão), sensors:read, imports:write, imports:read, imports:cancel
 * --ips         opcional: IPs ou faixas CIDR autorizados; omita --ips para qualquer origem (camada extra)
 *
 * O token aparece uma única vez; no banco fica apenas o hash SHA-256.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require dirname(__DIR__) . '/src/bootstrap.php';

use SenseGuard\Auth\DeviceAuth;
use SenseGuard\Auth\TokenCliOptions;
use SenseGuard\Auth\TokenPermissions;
use SenseGuard\Core\App;

$fail = static function (string $message): never {
    fwrite(STDERR, $message . PHP_EOL);
    exit(1);
};

try {
    $options = TokenCliOptions::parse(array_slice($argv, 1), ['nome', 'corporacao', 'permissoes', 'ips']);
    $corporationId = TokenCliOptions::positiveId($options['corporacao'] ?? null);
    $ips = TokenCliOptions::ips($options['ips'] ?? null);
} catch (InvalidArgumentException $e) {
    $fail($e->getMessage());
}
$name = trim($options['nome'] ?? '');
if ($name === '' || strlen($name) > 100 || preg_match('/[\x00-\x1f\x7f]/', $name) === 1) {
    $fail('Informe --nome com 1 a 100 bytes válidos.');
}

$permissions = TokenPermissions::parse($options['permissoes'] ?? TokenPermissions::READINGS_WRITE);
if ($permissions === []) {
    $fail('Informe ao menos uma permissão em --permissoes.');
}
$unknown = TokenPermissions::unknown($permissions);
if ($unknown !== []) {
    $fail('Permissão desconhecida: ' . implode(', ', $unknown) . '. Válidas: ' . implode(', ', TokenPermissions::ALL));
}

try {
    $pdo = App::boot()->pdo();

    $exists = $pdo->prepare('SELECT COUNT(*) FROM corporacao WHERE id_corporacao = ?');
    $exists->execute([$corporationId]);
    if ((int) $exists->fetchColumn() === 0) {
        $fail("A organização {$corporationId} não existe.");
    }

    $token = bin2hex(random_bytes(32));
    $insert = $pdo->prepare(
        'INSERT INTO token_dispositivo (id_corporacao, nome, token_hash, permissoes, ips_permitidos) VALUES (?, ?, ?, ?, ?)'
    );
    $insert->execute([
        $corporationId,
        $name,
        DeviceAuth::hashToken($token),
        implode(',', $permissions),
        $ips === [] ? null : implode(',', $ips),
    ]);
} catch (Throwable $e) {
    $fail('Não foi possível criar o token. Confira a conexão, a migração e as permissões do banco.');
}

echo "Token criado para \"{$name}\" (organização {$corporationId}, id " . $pdo->lastInsertId() . ').' . PHP_EOL;
echo 'Permissões: ' . implode(', ', $permissions) . PHP_EOL;
echo 'Origens permitidas: ' . ($ips === [] ? 'qualquer' : implode(', ', $ips)) . PHP_EOL;
echo 'Guarde agora, ele não será exibido de novo:' . PHP_EOL . PHP_EOL . $token . PHP_EOL . PHP_EOL;

echo 'Exemplos de requisição: docs/API.md (não copie o segredo para logs ou histórico do shell).' . PHP_EOL;
