<?php
header('Content-Type: application/json; charset=utf-8');

// Captura os dados recebidos via JSON (fetch) ou FormData/POST
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

$email = trim($input['email'] ?? $_POST['email'] ?? '');
$password = trim($input['password'] ?? $_POST['password'] ?? '');

// 1. Validação de e-mail obrigatório
if (empty($email)) {
    echo json_encode([
        'success' => false,
        'message' => 'é necessario informar o email'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. Validação de senha obrigatória
if (empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => 'é necessario informar a senha'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Credenciais de teste cadastráveis
$usuariosValidos = [
    'administrador@industria.com' => '123456',
    'supervisor@industria.com'    => '123456',
    'tecnico@industria.com'       => '123456'
];

// 3. Validação do e-mail e da senha
if (!isset($usuariosValidos[$email]) || $usuariosValidos[$email] !== $password) {
    echo json_encode([
        'success' => false,
        'message' => 'O email ou a senha informada estão incorretos'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Sucesso na autenticação
echo json_encode([
    'success'  => true,
    'message'  => 'Login realizado com sucesso!',
    'redirect' => 'dashboard.html'
], JSON_UNESCAPED_UNICODE);
exit;