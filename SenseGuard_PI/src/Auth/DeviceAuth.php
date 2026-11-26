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

    /**
     * Autentica o token e confere origem (IP) e permissão.
     *
     * @throws ApiException 401 TOKEN_INVALIDO, 403 IP_NAO_PERMITIDO ou 403 PERMISSAO_NEGADA
     */
    public function authenticate(Request $request, string $permission = TokenPermissions::READINGS_WRITE): DeviceIdentity
    {
        $invalid = static fn (): ApiException => new ApiException(
            401,
            'Token de dispositivo ausente ou inválido.',
            null,
            [],
            'TOKEN_INVALIDO'
        );

        $token = $request->header('X-Device-Token');
        $authorization = $request->header('Authorization');
        // Do not silently choose between conflicting authentication schemes.
        if ($token !== null && $authorization !== null) {
            throw $invalid();
        }
        if ($token === null) {
            if ($authorization !== null && stripos($authorization, 'Bearer ') === 0) {
                $token = trim(substr($authorization, 7));
            }
        }

        if ($token === null || strlen($token) < 32 || strlen($token) > 128 || preg_match('/[\x00-\x20\x7f]/', $token) === 1) {
            throw $invalid();
        }

        $stmt = $this->pdo->prepare(
            'SELECT id_token, id_corporacao, nome, permissoes, ips_permitidos
             FROM token_dispositivo WHERE token_hash = ? AND ativo = 1 LIMIT 1'
        );
        $stmt->execute([self::hashToken($token)]);
        $row = $stmt->fetch();

        if (!is_array($row)) {
            throw $invalid();
        }

        $allowedIps = IpAllowList::parse(isset($row['ips_permitidos']) ? (string) $row['ips_permitidos'] : null);
        if (!IpAllowList::allows($allowedIps, $request->ip())) {
            throw new ApiException(403, 'A origem desta requisição não é permitida para este token.', null, [], 'IP_NAO_PERMITIDO');
        }

        $permissions = TokenPermissions::parse((string) $row['permissoes']);
        if (!TokenPermissions::has($permissions, $permission)) {
            throw new ApiException(403, 'Este token não tem permissão para esta operação.', null, [], 'PERMISSAO_NEGADA');
        }

        $touch = $this->pdo->prepare('UPDATE token_dispositivo SET ultimo_uso = ? WHERE id_token = ?');
        $touch->execute([date('Y-m-d H:i:s'), (int) $row['id_token']]);

        return new DeviceIdentity((int) $row['id_token'], (int) $row['id_corporacao'], (string) $row['nome'], $permissions);
    }
}
