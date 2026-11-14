<?php

declare(strict_types=1);

namespace SenseGuard\Tests\Unit;

use SenseGuard\Auth\ArraySession;
use SenseGuard\Auth\Csrf;
use SenseGuard\Auth\DeviceAuth;
use SenseGuard\Http\Request;
use SenseGuard\Http\Response;
use SenseGuard\Http\Router;
use SenseGuard\Tests\TestCase;

final class HttpTest extends TestCase
{
    private function jsonRequest(string $body, string $method = 'POST'): Request
    {
        return new Request($method, [], ['CONTENT_TYPE' => 'application/json; charset=utf-8'], $body);
    }

    public function testJsonBodyIsParsed(): void
    {
        $this->assertSame(['a' => 1], $this->jsonRequest('{"a":1}')->json());
    }

    public function testJsonRejectsWrongContentTypeInvalidAndListBodies(): void
    {
        $this->assertApiError(fn () => (new Request('POST', [], ['CONTENT_TYPE' => 'text/plain'], '{}'))->json(), 415);
        $this->assertApiError(fn () => $this->jsonRequest('{invalido')->json(), 400);
        $this->assertApiError(fn () => $this->jsonRequest('[1,2]')->json(), 400);
        $this->assertApiError(fn () => $this->jsonRequest('')->json(), 400);
    }

    public function testRequestId(): void
    {
        $this->assertSame(5, (new Request('GET', ['id' => '5']))->id());
        $this->assertNull((new Request('GET', []))->id());
        $this->assertApiError(fn () => (new Request('GET', ['id' => 'abc']))->id(), 400);
        $this->assertApiError(fn () => (new Request('GET', ['id' => '0']))->id(), 400);
        $this->assertApiError(fn () => (new Request('GET', []))->requireId(), 400);
    }

    public function testQueryInt(): void
    {
        $request = new Request('GET', ['limit' => '5000', 'offset' => 'x']);

        $this->assertSame(1000, $request->queryInt('limit', 1, 1000));
        $this->assertNull($request->queryInt('missing', 1, 10));
        $this->assertApiError(fn () => $request->queryInt('offset', 0, 10), 400, 'offset');
    }

    public function testHeadersAndIp(): void
    {
        $request = new Request('GET', [], ['HTTP_X_CSRF_TOKEN' => 'abc', 'REMOTE_ADDR' => '10.0.0.7']);

        $this->assertSame('abc', $request->header('X-CSRF-Token'));
        $this->assertNull($request->header('X-Other'));
        $this->assertSame('10.0.0.7', $request->ip());
    }

    public function testRouterDispatchesByEntityAndMethod(): void
    {
        $router = (new Router())->add('ping', 'GET', static fn (Request $r): Response => Response::json(['pong' => true]));

        $response = $router->dispatch(new Request('GET', ['entity' => 'ping']));
        $this->assertSame(200, $response->status());
        $this->assertSame(['pong' => true], $response->payload());

        $this->assertApiError(fn () => $router->dispatch(new Request('GET', ['entity' => 'nada'])), 400);

        $error = $this->assertApiError(fn () => $router->dispatch(new Request('DELETE', ['entity' => 'ping'])), 405);
        $this->assertSame(['Allow' => 'GET'], $error->headers());
    }

    public function testErrorResponseShape(): void
    {
        $response = Response::error(422, 'Inválido', 'name');

        $this->assertSame(422, $response->status());
        $this->assertSame(['success' => false, 'error' => 'Inválido', 'field' => 'name'], $response->payload());
    }

    public function testCsrfTokenLifecycle(): void
    {
        $csrf = new Csrf(new ArraySession());

        $token = $csrf->token();
        $this->assertSame(64, strlen($token));
        $this->assertSame($token, $csrf->token(), 'o token é estável na sessão');
        $this->assertTrue($csrf->isValid($token));
        $this->assertTrue(!$csrf->isValid('errado'));
        $this->assertTrue(!$csrf->isValid(null));

        $csrf->assertValid(new Request('POST', [], ['HTTP_X_CSRF_TOKEN' => $token]));
        $this->assertApiError(fn () => $csrf->assertValid(new Request('POST', [], [])), 403);

        $new = $csrf->rotate();
        $this->assertTrue($new !== $token);
        $this->assertTrue(!$csrf->isValid($token), 'o token antigo deixa de valer após rotacionar');
    }

    public function testDeviceTokenIsStoredAsSha256(): void
    {
        $hash = DeviceAuth::hashToken('segredo');

        $this->assertSame(64, strlen($hash));
        $this->assertSame(hash('sha256', 'segredo'), $hash);
    }
}
