<?php

declare(strict_types=1);

namespace SenseGuard\Http;

use SenseGuard\Controller\ResourceController;

/**
 * Roteador do contrato da API: /api.php?entity=<recurso>[&id=<n>].
 * Cada recurso registra handlers por método HTTP.
 */
final class Router
{
    /** @var array<string, array<string, callable(Request): Response>> */
    private array $routes = [];

    /** @param callable(Request): Response $handler */
    public function add(string $entity, string $method, callable $handler): self
    {
        $this->routes[$entity][strtoupper($method)] = $handler;

        return $this;
    }

    /**
     * Registra GET/POST/PUT/DELETE de um recurso CRUD.
     *
     * @param callable(): ResourceController $factory Criado sob demanda.
     */
    public function resource(string $entity, callable $factory): self
    {
        $this->add($entity, 'GET', static function (Request $request) use ($factory): Response {
            $controller = $factory();
            $id = $request->id();

            return $id === null ? $controller->index($request) : $controller->show($request, $id);
        });
        $this->add($entity, 'POST', static fn (Request $request): Response => $factory()->store($request));
        $this->add($entity, 'PUT', static fn (Request $request): Response => $factory()->update($request, $request->requireId()));
        $this->add($entity, 'DELETE', static fn (Request $request): Response => $factory()->destroy($request, $request->requireId()));

        return $this;
    }

    public function has(string $entity): bool
    {
        return isset($this->routes[$entity]);
    }

    public function dispatch(Request $request): Response
    {
        $entity = (string) $request->query('entity');
        if (!isset($this->routes[$entity])) {
            throw new ApiException(400, 'Entidade inválida.');
        }

        $handler = $this->routes[$entity][$request->method()] ?? null;
        if ($handler === null) {
            throw new ApiException(405, 'Operação não permitida.', null, [
                'Allow' => implode(', ', array_keys($this->routes[$entity])),
            ]);
        }

        return $handler($request);
    }
}
