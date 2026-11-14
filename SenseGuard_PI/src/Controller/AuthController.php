<?php

declare(strict_types=1);

namespace SenseGuard\Controller;

use SenseGuard\Core\App;
use SenseGuard\Http\ApiException;
use SenseGuard\Http\Request;
use SenseGuard\Http\Response;
use SenseGuard\Service\AuditLog;

/** login.php e logout.php. */
final class AuthController
{
    public function __construct(private App $app)
    {
    }

    public function login(Request $request): Response
    {
        $this->requirePost($request);
        $input = $request->json(16384);

        $email = $input['email'] ?? null;
        $password = $input['password'] ?? null;
        $invalid = new ApiException(400, 'Informe um e-mail e uma senha válidos.');

        if (!is_string($email) || !is_string($password)) {
            throw $invalid;
        }

        $email = trim($email);
        if (
            $email === ''
            || strlen($email) > 254
            || filter_var($email, FILTER_VALIDATE_EMAIL) === false
            || $password === ''
            || strlen($password) > 72
        ) {
            throw $invalid;
        }

        $user = $this->app->authenticator()->login($email, $password, $request->ip());

        (new AuditLog($this->app->pdo(), $user->corporationId, $user->id, $user->name, $request->ip()))
            ->record('auth', $user->id, 'login');

        return Response::json([
            'success' => true,
            'message' => 'Login realizado com sucesso.',
            'redirect' => 'dashboard.php',
            'user' => [
                'id' => (string) $user->id,
                'nome' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
            ],
        ]);
    }

    public function logout(Request $request): Response
    {
        $this->requirePost($request);
        $this->app->csrf()->assertValid($request);

        $user = $this->app->authenticator()->currentUser();
        if ($user !== null) {
            (new AuditLog($this->app->pdo(), $user->corporationId, $user->id, $user->name, $request->ip()))
                ->record('auth', $user->id, 'logout');
        }

        $this->app->authenticator()->logout();

        return Response::json(['success' => true, 'message' => 'Sessão encerrada com sucesso.']);
    }

    private function requirePost(Request $request): void
    {
        if ($request->method() !== 'POST') {
            throw new ApiException(405, 'Método não permitido.', null, ['Allow' => 'POST']);
        }
    }
}
