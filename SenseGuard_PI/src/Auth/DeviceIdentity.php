<?php

declare(strict_types=1);

namespace SenseGuard\Auth;

/** Dispositivo/gateway autenticado por token (ingestão de leituras). */
final class DeviceIdentity
{
    public function __construct(
        public readonly int $tokenId,
        public readonly int $corporationId,
        public readonly string $name,
        /** @var list<string> */
        public readonly array $permissions = [],
    ) {
    }
}
