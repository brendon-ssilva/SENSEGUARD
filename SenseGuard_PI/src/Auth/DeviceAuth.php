<?php

declare(strict_types=1);

namespace SenseGuard\Auth;

use PDO;
use SenseGuard\Http\ApiException;
use SenseGuard\Http\Request;

/**
 * Autenticação de dispositivos por token (cabeçalho X-Device-Token ou
 * Authorization: Bearer). Só o hash SHA-256 do token fica no banco.
 */
final class DeviceAuth
{
    public function __construct(private PDO $pdo)
    {
    }

    public static function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    public function authenticate(Request $request): DeviceIdentity
    {
        $token = $request->header('X-Device-Token');
        if ($token === null) {
            $authorization = $request->header('Authorization');
            if ($authorization !== null && stripos($authorization, 'Bearer ') === 0) {
                $token = trim(substr($authorization, 7));
            }
        }

        if ($token === null || strlen($token) < 32 || strlen($token) > 128) {
            throw new ApiException(401, 'Token de dispositivo ausente ou inválido.');
        }

        $stmt = $this->pdo->prepare(
            'SELECT id_token, id_corporacao, nome FROM token_dispositivo WHERE token_hash = ? AND ativo = 1 LIMIT 1'
        );
        $stmt->execute([self::hashToken($token)]);
        $row = $stmt->fetch();

        if (!is_array($row)) {
            throw new ApiException(401, 'Token de dispositivo ausente ou inválido.');
        }

        $touch = $this->pdo->prepare('UPDATE token_dispositivo SET ultimo_uso = ? WHERE id_token = ?');
        $touch->execute([date('Y-m-d H:i:s'), (int) $row['id_token']]);

        return new DeviceIdentity((int) $row['id_token'], (int) $row['id_corporacao'], (string) $row['nome']);
    }
}
