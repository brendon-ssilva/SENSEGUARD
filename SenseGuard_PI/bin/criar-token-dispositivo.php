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
 * --ips         opcional: IPs ou faixas CIDR autorizados; vazio = qualquer origem (camada extra)
 *
 * O token aparece uma única vez; no banco fica apenas o hash SHA-256.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require dirname(__DIR__) . '/src/bootstrap.php';

use SenseGuard\Auth\DeviceAuth;
use SenseGuard\Auth\IpAllowList;
use SenseGuard\Auth\TokenPermissions;
use SenseGuard\Core\App;

$options = [];
foreach (array_slice($argv, 1) as $argument) {
    if (preg_match('/^--([a-z-]+)=(.*)$/s', $argument, $match) === 1) {
        $options[$match[1]] = $match[2];
    }
}

$fail = static function (string $message): never {
    fwrite(STDERR, $message . PHP_EOL);
    exit(1);
};

$name = trim($options['nome'] ?? '');
if ($name === '' || strlen($name) > 100 || !isset($options['corporacao']) || !ctype_digit($options['corporacao'])) {
    $fail('Uso: php bin/criar-token-dispositivo.php --corporacao=ID --nome="Gateway Linha 1" [--permissoes=...] [--ips=...]');
}
$corporationId = (int) $options['corporacao'];

$permissions = TokenPermissions::parse($options['permissoes'] ?? TokenPermissions::READINGS_WRITE);
if ($permissions === []) {
    $fail('Informe ao menos uma permissão em --permissoes.');
}
$unknown = TokenPermissions::unknown($permissions);
if ($unknown !== []) {
    $fail('Permissão desconhecida: ' . implode(', ', $unknown) . '. Válidas: ' . implode(', ', TokenPermissions::ALL));
}

$ips = IpAllowList::parse($options['ips'] ?? '');
foreach ($ips as $rule) {
    // Valida a regra testando-a contra ela mesma (para CIDR, contra o endereço de rede).
    $probe = str_contains($rule, '/') ? explode('/', $rule, 2)[0] : $rule;
    if (!IpAllowList::matches($probe, $rule)) {
        $fail("IP ou faixa inválida em --ips: {$rule}");
    }
}

try {
    $pdo = App::boot()->pdo();
} catch (Throwable $e) {
    $fail('Não foi possível conectar ao banco: ' . $e->getMessage());
}

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

echo "Token criado para \"{$name}\" (organização {$corporationId}, id " . $pdo->lastInsertId() . ').' . PHP_EOL;
echo 'Permissões: ' . implode(', ', $permissions) . PHP_EOL;
echo 'Origens permitidas: ' . ($ips === [] ? 'qualquer' : implode(', ', $ips)) . PHP_EOL;
echo 'Guarde agora, ele não será exibido de novo:' . PHP_EOL . PHP_EOL . $token . PHP_EOL . PHP_EOL;

if (TokenPermissions::has($permissions, TokenPermissions::READINGS_WRITE)) {
    echo 'Exemplo de envio de leitura:' . PHP_EOL;
    echo "  curl -X POST \"http://localhost/SENSEGUARD/public/api.php?entity=readings\" \\" . PHP_EOL;
    echo "    -H \"Content-Type: application/json\" -H \"X-Device-Token: {$token}\" \\" . PHP_EOL;
    echo "    -d '{\"sensorId\": 1, \"value\": 72.4}'" . PHP_EOL;
}
if (TokenPermissions::has($permissions, TokenPermissions::SENSORS_READ)) {
    echo 'Exemplo de consulta de sensores:' . PHP_EOL;
    echo "  curl \"http://localhost/SENSEGUARD/public/api.php?entity=integration-sensors\" -H \"X-Device-Token: {$token}\"" . PHP_EOL;
}
