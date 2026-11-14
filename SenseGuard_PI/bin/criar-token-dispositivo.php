<?php

declare(strict_types=1);

/**
 * Gera um token para um dispositivo/gateway enviar leituras a api.php?entity=readings.
 *
 *   php bin/criar-token-dispositivo.php --nome="Gateway Linha 1" [--corporacao=1]
 *
 * O token aparece uma única vez; no banco fica apenas o hash SHA-256.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require dirname(__DIR__) . '/src/bootstrap.php';

use SenseGuard\Auth\DeviceAuth;
use SenseGuard\Core\App;

$options = [];
foreach (array_slice($argv, 1) as $argument) {
    if (preg_match('/^--([a-z-]+)=(.*)$/s', $argument, $match) === 1) {
        $options[$match[1]] = $match[2];
    }
}

$name = trim($options['nome'] ?? '');
$corporationId = (int) ($options['corporacao'] ?? 1);

if ($name === '' || strlen($name) > 100) {
    fwrite(STDERR, 'Uso: php bin/criar-token-dispositivo.php --nome="Gateway Linha 1" [--corporacao=1]' . PHP_EOL);
    exit(1);
}

try {
    $pdo = App::boot()->pdo();
} catch (Throwable $e) {
    fwrite(STDERR, 'Não foi possível conectar ao banco: ' . $e->getMessage() . PHP_EOL);
    exit(1);
}

$exists = $pdo->prepare('SELECT COUNT(*) FROM corporacao WHERE id_corporacao = ?');
$exists->execute([$corporationId]);
if ((int) $exists->fetchColumn() === 0) {
    fwrite(STDERR, "A organização {$corporationId} não existe." . PHP_EOL);
    exit(1);
}

$token = bin2hex(random_bytes(32));
$insert = $pdo->prepare('INSERT INTO token_dispositivo (id_corporacao, nome, token_hash) VALUES (?, ?, ?)');
$insert->execute([$corporationId, $name, DeviceAuth::hashToken($token)]);

echo "Token criado para \"{$name}\" (organização {$corporationId})." . PHP_EOL;
echo "Guarde agora, ele não será exibido de novo:" . PHP_EOL . PHP_EOL . $token . PHP_EOL . PHP_EOL;
echo 'Exemplo de envio:' . PHP_EOL;
echo "  curl -X POST \"http://localhost/SENSEGUARD/public/api.php?entity=readings\" \\" . PHP_EOL;
echo "    -H \"Content-Type: application/json\" -H \"X-Device-Token: {$token}\" \\" . PHP_EOL;
echo "    -d '{\"sensorId\": 1, \"value\": 72.4}'" . PHP_EOL;
