<?php

declare(strict_types=1);

namespace SenseGuard\Core;

use RuntimeException;

/** Problema de configuração do ambiente (ex.: config.local.php ausente). A mensagem pode ser exibida ao administrador. */
final class ConfigurationException extends RuntimeException
{
}
