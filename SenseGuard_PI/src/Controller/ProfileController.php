<?php

declare(strict_types=1);

namespace SenseGuard\Controller;

use SenseGuard\Http\ApiException;
use SenseGuard\Http\Request;
use SenseGuard\Http\Response;
use SenseGuard\Validation\Validator;

/** Perfil do usuário autenticado (api.php?entity=me). */
final class ProfileController extends ApiController
{
    public function show(Request $request): Response
    {
        $user = $this->ctx->user;

        return Response::json($this->payload($user->id, $user->name, $user->email, $user->role->value));
    }

    public function update(Request $request): Response
    {
        $input = $request->json();
        if (array_diff(array_keys($input), ['name']) !== [] || !array_key_exists('name', $input)) {
            throw new ApiException(400, 'Envie somente o campo de nome.');
        }

        $name = $input['name'];
        if (!is_string($name)) {
            throw new ApiException(400, 'Informe um nome válido.', 'name');
        }

        $name = trim($name);
        $length = Validator::length($name);
        if ($name === '' || $length > 100 || preg_match('/[\x00-\x1F\x7F]/u', $name) === 1) {
            throw new ApiException(422, 'O nome deve ter entre 1 e 100 caracteres válidos.', 'name');
        }

        $user = $this->ctx->user;
        $update = $this->ctx->pdo->prepare('UPDATE usuario SET nome = ? WHERE id_usuario = ? AND id_corporacao = ?');
        $update->execute([$name, $user->id, $user->corporationId]);

        if ($name !== $user->name) {
            $this->ctx->audit->record('me', $user->id, 'atualizar', ['nome' => ['de' => $user->name, 'para' => $name]]);
        }

        return Response::json($this->payload($user->id, $name, $user->email, $user->role->value));
    }

    /** @return array<string, string> */
    private function payload(int $id, string $name, string $email, string $role): array
    {
        return ['id' => (string) $id, 'name' => $name, 'email' => $email, 'role' => $role];
    }
}
