<?php

declare(strict_types=1);

namespace SenseGuard\Controller;

use PDO;
use SenseGuard\Auth\CurrentUser;
use SenseGuard\Core\Config;
use SenseGuard\Service\AuditLog;

/** Dependências de uma requisição autenticada. */
final class ApiContext
{
    public function __construct(
        public readonly PDO $pdo,
        public readonly CurrentUser $user,
        public readonly Config $config,
        public readonly AuditLog $audit,
    ) {
    }
}
