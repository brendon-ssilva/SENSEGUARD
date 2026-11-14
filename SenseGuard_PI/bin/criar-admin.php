<?php

declare(strict_types=1);

/**
 * Cria um administrador (substitui o usuário de teste documentado).
 *
 *   php bin/criar-admin.php --nome="Maria Silva" --email=maria@empresa.com [--corporacao=1]
 *       [--empresa="Minha Empresa" --cnpj="12.345.678/0001-90" --empresa-email=contato@empresa.com]
 *
 * A senha vem da variável de ambiente SENSEGUARD_ADMIN_PASSWORD (mín. 8 caracteres).
 * Sem ela, uma senha aleatória é gerada e exibida uma única vez.
 * Se a organização informada não existir, informe --empresa e --cnpj para criá-la.
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

$fail = static function (string $message): never {
    fwrite(STDERR, $message . PHP_EOL);
    exit(1);
};

$name = trim($options['nome'] ?? '');
$email = trim($options['email'] ?? '');
$corporationId = (int) ($options['corporacao'] ?? 1);

if ($name === '' || $email === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    $fail('Uso: php bin/criar-admin.php --nome="Nome" --email=email@empresa.com [--corporacao=1]');
}

$password = getenv('SENSEGUARD_ADMIN_PASSWORD');
$generated = false;
if ($password === false || $password === '') {
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#%';
    $password = '';
    for ($i = 0; $i < 16; $i++) {
        $password .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    }
    $generated = true;
}
if (strlen($password) < 8 || strlen($password) > 72) {
    $fail('A senha deve ter entre 8 e 72 caracteres.');
}

try {
    $pdo = App::boot()->pdo();
} catch (Throwable $e) {
    $fail('Não foi possível conectar ao banco: ' . $e->getMessage());
}

$exists = $pdo->prepare('SELECT COUNT(*) FROM corporacao WHERE id_corporacao = ?');
$exists->execute([$corporationId]);
if ((int) $exists->fetchColumn() === 0) {
    $company = trim($options['empresa'] ?? '');
    $cnpj = trim($options['cnpj'] ?? '');
    if ($company === '' || $cnpj === '') {
        $fail("A organização {$corporationId} não existe. Informe --empresa=\"Nome\" e --cnpj=\"00.000.000/0000-00\" para criá-la.");
    }
    $insertCompany = $pdo->prepare('INSERT INTO corporacao (nome, cnpj, email) VALUES (?, ?, ?)');
    $insertCompany->execute([$company, $cnpj, $options['empresa-email'] ?? $email]);
    $corporationId = (int) $pdo->lastInsertId();
    echo "Organização criada (id {$corporationId})." . PHP_EOL;
}

$duplicate = $pdo->prepare('SELECT COUNT(*) FROM usuario WHERE email = ?');
$duplicate->execute([$email]);
if ((int) $duplicate->fetchColumn() > 0) {
    $fail('Já existe um usuário com este e-mail.');
}

$insert = $pdo->prepare(
    "INSERT INTO usuario (nome, email, senha, role, status, id_corporacao) VALUES (?, ?, ?, 'admin', 'ativo', ?)"
);
$insert->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), $corporationId]);

echo "Administrador criado: {$email}" . PHP_EOL;
if ($generated) {
    echo "Senha gerada (anote agora, ela não será exibida de novo): {$password}" . PHP_EOL;
}
