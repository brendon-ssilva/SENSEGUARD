<?php

declare(strict_types=1);

namespace SenseGuard\Auth;

use PDO;
use SenseGuard\Http\ApiException;

/**
 * Limita tentativas de login por e-mail e por IP usando a tabela login_tentativa.
 * Ao contrário de um contador na sessão, não é contornado apagando o cookie.
 */
final class LoginThrottle
{
    public function __construct(
        private PDO $pdo,
        private int $windowSeconds = 900,
        private int $maxPerEmail = 5,
        private int $maxPerIp = 20,
    ) {
    }

    public function assertAllowed(string $email, string $ip): void
    {
        $since = date('Y-m-d H:i:s', time() - $this->windowSeconds);

        $byEmail = $this->count('email', self::normalize($email), $since);
        $byIp = $this->count('ip', $ip, $since);

        if ($byEmail >= $this->maxPerEmail || $byIp >= $this->maxPerIp) {
            throw new ApiException(
                429,
                'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
                null,
                ['Retry-After' => (string) $this->windowSeconds]
            );
        }
    }

    public function recordFailure(string $email, string $ip): void
    {
        $stmt = $this->pdo->prepare('INSERT INTO login_tentativa (email, ip, criado_em) VALUES (?, ?, ?)');
        $stmt->execute([self::normalize($email), $ip, date('Y-m-d H:i:s')]);

        // Limpeza ocasional de registros antigos.
        if (random_int(1, 20) === 1) {
            $cleanup = $this->pdo->prepare('DELETE FROM login_tentativa WHERE criado_em < ?');
            $cleanup->execute([date('Y-m-d H:i:s', time() - 86400)]);
        }
    }

    /** Após um login válido, zera apenas as falhas daquele e-mail (as do IP continuam valendo). */
    public function clear(string $email): void
    {
        $stmt = $this->pdo->prepare('DELETE FROM login_tentativa WHERE email = ?');
        $stmt->execute([self::normalize($email)]);
    }

    private function count(string $column, string $value, string $since): int
    {
        // $column vem apenas das chamadas internas acima (nunca de entrada do usuário).
        $stmt = $this->pdo->prepare('SELECT COUNT(*) FROM login_tentativa WHERE ' . $column . ' = ? AND criado_em >= ?');
        $stmt->execute([$value, $since]);

        return (int) $stmt->fetchColumn();
    }

    private static function normalize(string $email): string
    {
        return substr(strtolower(trim($email)), 0, 191);
    }
}
