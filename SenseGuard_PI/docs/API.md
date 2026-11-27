# API do SenseGuard

Base: `public/api.php`. Respostas em JSON (UTF-8). Autenticação por sessão (cookie) — exceto o envio de leituras e a consulta de sensores por integrações, que usam token de dispositivo.

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

`POST api.php?entity=readings`, sem sessão nem CSRF, com `X-Device-Token: <token>` (ou `Authorization: Bearer <token>`) e a permissão `readings:write`. Gere o token com `php bin/criar-token-dispositivo.php --corporacao=ID --nome=...`.

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

`GET api.php?entity=readings&sensorId=1` também devolve `origin` em cada leitura (`dispositivo`, `importacao` ou `manual`); leituras anuladas não aparecem.

## Tokens, permissões e origem

Os endpoints sem sessão (envio de leituras e consulta de sensores) usam um token de dispositivo ou integração. Cada token pertence a uma organização e carrega permissões e, opcionalmente, uma lista de origens (IP ou CIDR) permitidas.

| Permissão | Libera |
|---|---|
| `readings:write` | `POST entity=readings` (tokens antigos continuam só com esta) |
| `sensors:read` | `GET entity=integration-sensors` |
| `imports:write`, `imports:read`, `imports:cancel` | reservadas para o módulo de importação |

Erros de autenticação trazem um `code` estável, além de `success` e `error`:

- `401` `TOKEN_INVALIDO`: token ausente, inválido, desconhecido, revogado ou cabeçalhos de autenticação simultâneos.
- `403` `PERMISSAO_NEGADA`: o token não tem a permissão da operação.
- `403` `IP_NAO_PERMITIDO`: a origem da requisição não está na lista do token.

## Consulta de sensores por integrações

`GET api.php?entity=integration-sensors` (permissão `sensors:read`). Devolve, para a organização do token, a lista reduzida usada para validar mapeamentos antes de enviar arquivos:

```json
[{"id": "1", "name": "TMP-001", "type": "temperatura", "unit": "°C", "minThreshold": 20.0, "maxThreshold": 85.0}]
```
Aceita `limit` (padrão 100, máximo 1000) e `offset` (padrão 0, máximo 1000000). Não expõe leitura atual, status nem dados de máquina.

## Leituras manuais

Todo valor digitado no painel (criar sensor com leitura diferente de zero, ou alterar a leitura atual) grava também uma linha em `dados` com `origem = manual` e o usuário responsável, na mesma transação do sensor. Isso garante que o histórico sempre tenha um valor anterior para onde voltar quando uma importação for cancelada. Valores manuais anteriores à versão 3.1 podem ser recuperados com `database/optional/backfill_leituras_manuais.sql`.

### Administração segura

Execute os scripts apenas em um terminal autorizado no servidor. A organização é obrigatória para criação, e as opções desconhecidas ou duplicadas são rejeitadas. O token é exibido uma única vez, nunca é listado e não deve ser colocado em histórico do shell, logs ou URLs.

```bash
php bin/criar-token-dispositivo.php --corporacao=ID --nome="Gateway" --permissoes=readings:write,sensors:read
php bin/listar-tokens.php --corporacao=ID
php bin/revogar-token.php --id=ID_DO_TOKEN
```

Substitua os IDs por valores do ambiente de teste autorizado. Omitir `--ips` permite qualquer origem; uma lista explicitamente vazia é rejeitada. Em produção use HTTPS, rate limiting no proxy/firewall e armazenamento de segredo protegido. A regra de IP usa `REMOTE_ADDR`; configure proxies confiáveis no Apache, não cabeçalhos de origem arbitrários. Envie somente um dos cabeçalhos de autenticação. A revogação bloqueia novas autenticações, não interrompe requisições já autenticadas. Não há expiração automática; faça rotação planejada (criar, substituir, revogar).

Exemplo de consulta (o segredo é carregado previamente de forma segura na variável de ambiente, não digitado na linha de comando):

```bash
curl -H "Authorization: Bearer $SENSEGUARD_DEVICE_TOKEN" \
  'http://localhost/SENSEGUARD/public/api.php?entity=integration-sensors&limit=20'
```

Exemplo de envio:

```bash
curl -X POST -H "X-Device-Token: $SENSEGUARD_DEVICE_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"sensorId":1,"value":72.4}' \
  'http://localhost/SENSEGUARD/public/api.php?entity=readings'
```

Os exemplos HTTP são exclusivos do localhost; fora dele use HTTPS. Evite compartilhamento de processos/diagnósticos que capturem cabeçalhos ou argumentos do curl.

### Migração da branch de reestruturação

Preserve `008_views_relatorios.sql`. A rastreabilidade chega em `009_dados_origem_e_rastreio.sql` e as permissões de tokens em `010_token_permissoes_e_ips.sql`. Tokens antigos continuam com `readings:write`, sem IP restrito. Faça backup e teste em banco descartável antes de atualizar um banco existente. O `schema.sql` continua destinado a instalação limpa: a migration 008 das views permanece separada e deve ser aplicada pelo migrador. Se já tiver usado o ZIP v3.1 independente (migrations 008/009 com outros nomes), não rode estas migrations automaticamente: compare colunas e registros de `migracao` e planeje a reconciliação manual. A migration DDL não possui rollback transacional no MySQL. A coluna `id_importacao` é reservada; não existe tabela nem endpoint de importação nesta entrega.
