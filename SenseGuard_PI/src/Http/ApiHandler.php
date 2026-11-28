<?php

declare(strict_types=1);

namespace SenseGuard\Http;

use SenseGuard\Controller\ApiContext;
use SenseGuard\Controller\AuditController;
use SenseGuard\Controller\CorporationController;
use SenseGuard\Controller\DeviceIngestController;
use SenseGuard\Controller\IntegrationSensorController;
use SenseGuard\Controller\MachineController;
use SenseGuard\Controller\OrderController;
use SenseGuard\Controller\ProfileController;
use SenseGuard\Controller\ReadingController;
use SenseGuard\Controller\SensorController;
use SenseGuard\Controller\UserController;
use SenseGuard\Core\App;
use SenseGuard\Domain\EnumCatalog;
use SenseGuard\Service\AuditLog;

/**
 * Orquestra uma chamada de api.php: valida método, autentica (sessão ou token de
 * dispositivo), confere o CSRF e despacha para o controller do recurso.
 */
final class ApiHandler
{
    private const METHODS = ['GET', 'POST', 'PUT', 'DELETE'];

    public function __construct(private App $app)
    {
    }

    public function handle(Request $request): Response
    {
        $method = $request->method();
        if (!in_array($method, self::METHODS, true)) {
            throw new ApiException(405, 'Método não permitido.', null, ['Allow' => implode(', ', self::METHODS)]);
        }

        $entity = $request->query('entity');
        if ($entity === null || $entity === '') {
            throw new ApiException(400, 'Entidade não informada.');
        }

        // Ingestão de leituras: autenticada por token de dispositivo, sem sessão nem CSRF.
        if ($entity === 'readings' && $method === 'POST') {
            return (new DeviceIngestController($this->app->pdo()))->ingest($request);
        }

        // Consulta de sensores por integrações: token com a permissão sensors:read (sem sessão).
        if ($entity === 'integration-sensors' && $method === 'GET') {
            return (new IntegrationSensorController($this->app->pdo()))->index($request);
        }

        $user = $this->app->authenticator()->currentUser();
        if ($user === null) {
            throw new ApiException(401, 'Sua sessão expirou. Entre novamente.');
        }

        if ($method !== 'GET') {
            $this->app->csrf()->assertValid($request);
        }

        $pdo = $this->app->pdo();
        $context = new ApiContext(
            $pdo,
            $user,
            $this->app->config(),
            new AuditLog($pdo, $user->corporationId, $user->id, $user->name, $request->ip())
        );

        return $this->router($context)->dispatch($request);
    }

    private function router(ApiContext $context): Router
    {
        /** @var array<class-string, object> $instances */
        $instances = [];
        $make = static function (string $class) use ($context, &$instances): object {
            return $instances[$class] ??= new $class($context);
        };

        $router = new Router();
        $router->resource('machines', static fn (): MachineController => $make(MachineController::class));
        $router->resource('sensors', static fn (): SensorController => $make(SensorController::class));
        $router->resource('orders', static fn (): OrderController => $make(OrderController::class));
        $router->resource('users', static fn (): UserController => $make(UserController::class));
        $router->resource('corporations', static fn (): CorporationController => $make(CorporationController::class));

        $router->add('me', 'GET', static fn (Request $r): Response => $make(ProfileController::class)->show($r));
        $router->add('me', 'PUT', static fn (Request $r): Response => $make(ProfileController::class)->update($r));
        $router->add('audit', 'GET', static fn (Request $r): Response => $make(AuditController::class)->index($r));
        $router->add('readings', 'GET', static fn (Request $r): Response => $make(ReadingController::class)->history($r));

        $router->add('readings-query', 'POST', static fn (Request $r): Response => $make(ReadingController::class)->search($r));

        // Carga inicial do painel: todas as listas e o catálogo de valores em uma só chamada.
        $router->add('all', 'GET', static fn (Request $r): Response => Response::json([
            'users' => $make(UserController::class)->listAll(),
            'machines' => $make(MachineController::class)->listAll(),
            'sensors' => $make(SensorController::class)->listAll(),
            'orders' => $make(OrderController::class)->listAll(),
            'corporations' => $make(CorporationController::class)->listAll(),
            'meta' => EnumCatalog::all(),
        ]));

        return $router;
    }
}
