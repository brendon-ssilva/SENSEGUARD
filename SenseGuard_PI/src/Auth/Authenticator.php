<?php

declare(strict_types=1);

namespace SenseGuard\Auth;

use PDO;
use SenseGuard\Http\ApiException;

/** Login, logout e validação contínua da sessão. */
final class Authenticator
{
    /**
     * Hash bcrypt fictício: garante que o tempo de resposta seja parecido quando
     * o e-mail não existe, evitando enumeração de usuários por tempo.
     */
    private const DUMMY_HASH = '$2y$12$FW0S.cQJWIYa.fixYV54T.KsNw2zLeDPX7at7IhNyZjfdl6hZMaOu';

    public function __construct(
        private PDO $pdo,
        private SessionStore $session,
        private Csrf $csrf,
        private LoginThrottle $throttle,
        private int $sessionTtl,
        private bool $isProduction,
    ) {
    }

    /** Usuário da sessão atual, revalidado no banco a cada requisição (ou null). */
    public function currentUser(): ?CurrentUser
    {
        $sessionId = $this->session->get('user_id');
        if (!is_string($sessionId) || !ctype_digit($sessionId) || (int) $sessionId < 1) {
            return null;
        }

        $lastActivity = (int) ($this->session->get('last_activity') ?? $this->session->get('authenticated_at') ?? time());
        if (time() - $lastActivity > $this->sessionTtl) {
            $this->session->destroy();

            return null;
        }

        $stmt = $this->pdo->prepare(
            'SELECT id_usuario, nome, email, role, status, id_corporacao FROM usuario WHERE id_usuario = ? LIMIT 1'
        );
        $stmt->execute([(int) $sessionId]);
        $row = $stmt->fetch();

        if (!is_array($row) || ($row['status'] ?? '') !== 'ativo') {
            $this->session->destroy();

            return null;
        }

        $user = CurrentUser::fromRow($row);
        if ($user === null) {
            $this->session->destroy();

            return null;
        }

        $this->session->set('user_role', $user->role->value);
        $this->session->set('corporation_id', (string) $user->corporationId);
        $this->session->set('last_activity', time());

        return $user;
    }

    public function login(string $email, string $password, string $ip): CurrentUser
    {
        $this->throttle->assertAllowed($email, $ip);

        $stmt = $this->pdo->prepare(
            'SELECT id_usuario, nome, email, senha, role, status, id_corporacao FROM usuario WHERE email = ? LIMIT 1'
        );
        $stmt->execute([$email]);
        $row = $stmt->fetch();

        $hash = is_array($row) && is_string($row['senha'] ?? null) ? $row['senha'] : self::DUMMY_HASH;
        $passwordOk = password_verify($password, $hash);
        $active = is_array($row) && ($row['status'] ?? '') === 'ativo';

        if (!is_array($row) || !$active || !$passwordOk) {
            $this->throttle->recordFailure($email, $ip);
            throw new ApiException(401, 'E-mail ou senha incorretos.');
        }

        $user = CurrentUser::fromRow($row);
        if ($user === null) {
            error_log('SenseGuard login: usuário com perfil inválido. ID=' . (string) $row['id_usuario']);
            throw new ApiException(403, 'A conta não possui um perfil autorizado.');
        }

        if ($this->isProduction && str_ends_with(strtolower($user->email), '@senseguard.local')) {
            throw new ApiException(403, 'Contas de demonstração (@senseguard.local) estão desativadas em produção. Crie um administrador com bin/criar-admin.php.');
        }

        $this->session->regenerate();
        $now = time();
        $this->session->set('user_id', (string) $user->id);
        $this->session->set('user_name', $user->name);
        $this->session->set('user_email', $user->email);
        $this->session->set('user_role', $user->role->value);
        $this->session->set('corporation_id', (string) $user->corporationId);
        $this->session->set('authenticated_at', $now);
        $this->session->set('last_activity', $now);
        $this->csrf->rotate();
        $this->throttle->clear($email);

        if (password_needs_rehash((string) $row['senha'], PASSWORD_DEFAULT)) {
            $update = $this->pdo->prepare('UPDATE usuario SET senha = ? WHERE id_usuario = ?');
            $update->execute([password_hash($password, PASSWORD_DEFAULT), $user->id]);
        }

        return $user;
    }

    public function logout(): void
    {
        $this->session->destroy();
    }
}
