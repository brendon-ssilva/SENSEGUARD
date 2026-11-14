# API do SenseGuard

Base: `public/api.php`. Respostas em JSON (UTF-8). Autenticação por sessão (cookie) — exceto o envio de leituras, que usa token de dispositivo.

## Convenções

- **Recurso:** `?entity=<nome>`; item: `&id=<n>`. Listas aceitam `limit` (1–1000) e `offset`.
- **Escrita (POST/PUT/DELETE):** corpo `application/json` e cabeçalho `X-CSRF-Token` (o painel lê o token da tag `<meta name="csrf-token">`).
- **Erros:** `{"success": false, "error": "mensagem", "field": "campo?"}` com o status HTTP adequado (400 requisição inválida, 401 sem sessão, 403 sem permissão, 404, 409 conflito, 422 validação, 429 muitas tentativas).
- **Ids** são sempre strings numéricas nas respostas.

## Autenticação

| Endpoint | Corpo | Resposta |
|---|---|---|
| `POST login.php` | `{"email","password"}` | `{"success":true,"redirect":"dashboard.php","user":{...}}` |
| `POST logout.php` | `{}` + CSRF | `{"success":true}` |

Após 5 falhas por e-mail (ou 20 por IP) em 15 minutos: `429` com `Retry-After`.

## Recursos

| `entity` | Métodos | Quem escreve |
|---|---|---|
| `machines` | GET, POST, PUT, DELETE | admin, supervisor |
| `sensors` | GET, POST, PUT, DELETE | admin, supervisor |
| `orders` | GET, POST, PUT, DELETE | admin, supervisor; técnico altera só `status` e `description` das ordens atribuídas a ele |
| `users` | GET, POST, PUT, DELETE | admin (e-mail e telefone só aparecem para admin) |
| `corporations` | GET | somente leitura |
| `me` | GET, PUT | o próprio usuário (PUT altera só `name`) |
| `all` | GET | carga inicial: users, machines, sensors, orders, corporations e `meta` |
| `audit` | GET | admin (`limit`, `offset`, `target=machines\|sensors\|orders\|users\|me\|auth`) |
| `readings` | GET (histórico), POST (ingestão) | ver abaixo |

`meta` traz os valores permitidos (e rótulos) de status, tipos, prioridades e perfis; é a fonte única usada pelos formulários.

### Campos

- **machines:** `name`*, `serialNumber` (único por organização), `model`, `manufacturer`, `location`, `department`, `status`, `installDate`, `lastMaintenance`, `nextMaintenance`, `sensorIds[]`.
- **sensors:** `name`*, `type`*, `unit`, `location`, `minThreshold`, `maxThreshold`, `currentValue`, `status`, `lastReadingAt`, `machineId`. O status `alerta` é **calculado** (leitura fora de `[min, max]`); só `offline` pode ser informado.
- **orders:** `title`*, `machineId`*, `assignedToId`*, `type`, `priority`, `status`, `estimatedHours`, `scheduledFor`, `description`. A resposta traz também `code` (OS-AAAA-00042), `createdAt`, `completedAt` e `createdById`. `completedAt` é preenchido automaticamente ao concluir.
- **users:** `name`*, `email`*, `password` (obrigatória na criação; 8–72 bytes), `phone`, `role`, `status`.

## Envio de leituras (dispositivos)

`POST api.php?entity=readings`, sem sessão nem CSRF, com `X-Device-Token: <token>` (ou `Authorization: Bearer <token>`). Gere o token com `php bin/criar-token-dispositivo.php`.

```json
{"sensorId": 1, "value": 72.4, "readAt": "2026-11-07 14:30:00"}
```
ou em lote (até 100, tudo-ou-nada):
```json
{"readings": [{"sensorId": 1, "value": 72.4}, {"sensorId": 2, "value": 3.1}]}
```
`readAt` é opcional (padrão: agora; não pode estar mais de 5 min no futuro). Resposta `201`:
```json
{"success": true, "accepted": 2, "sensors": [{"id": "1", "status": "alerta", "value": 72.4}]}
```
Leituras mais antigas que a última do sensor entram no histórico, mas não substituem a leitura atual.

`GET api.php?entity=readings&sensorId=1&limit=100` (sessão) devolve o histórico, do mais recente ao mais antigo:
`[{"id","sensorId","machineId","value","at"}]`.
