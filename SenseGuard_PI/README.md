# SenseGuard

Sistema de gestão de manutenção industrial com monitoramento de sensores: máquinas, sensores, ordens de serviço, usuários, auditoria e recebimento de leituras de dispositivos.

**Stack:** PHP 8.1+ (PDO), MySQL/MariaDB, JavaScript (módulos ES, sem bibliotecas), HTML e CSS. Funciona no XAMPP.

## Estrutura

```
SenseGuard_PI/
├── public/                  ← única pasta que o servidor web deve expor
│   ├── index.php            login
│   ├── dashboard.php        painel (exige sessão)
│   ├── api.php              API JSON (?entity=...)
│   ├── login.php  logout.php
│   └── assets/
│       ├── css/             tokens, base, layout, componentes, uma folha por tela, tema claro
│       └── js/              main.js + módulos (api, state, events, ui/, utils/, views/)
├── src/                     código PHP (namespace SenseGuard\, autoload PSR-4 próprio)
│   ├── Core/                App, Config, Database, View
│   ├── Http/                Request, Response, Router, ApiHandler, SecurityHeaders
│   ├── Auth/                sessão, CSRF, login, limite de tentativas, token de dispositivo
│   ├── Domain/              enums (status, perfis...), Specs (campos de cada entidade), regras do sensor
│   ├── Validation/          Validator e Fields
│   ├── Repository/          SQL de cada entidade (sempre filtrado pela organização)
│   ├── Service/             AuditLog, ReadingIngestor
│   └── Controller/          um controller por recurso
├── config/                  config.local.php (não vai para o Git) e o exemplo
├── database/
│   ├── migrations/          001…007 (histórico versionado do banco)
│   ├── seeds/               dados opcionais (usuário de teste — só desenvolvimento)
│   └── schema.sql           instalação limpa (gerado a partir das migrações)
├── bin/                     migrate.php, criar-admin.php, criar-token-dispositivo.php
├── tests/                   run.php (PHP) e js/ (Node)
└── docs/                    API.md e MUDANCAS.md
```

## Instalação no XAMPP

1. Copie a pasta para `C:\xampp\htdocs\SENSEGUARD` e inicie **Apache** e **MySQL**.
2. Crie a configuração: copie `config/config.local.php.example` para `config/config.local.php` e confira usuário/senha do banco (no XAMPP: `root` sem senha). Para uso local deixe `'env' => 'development'`.
3. **Banco novo:** no phpMyAdmin, importe `database/schema.sql` (cria o banco `senseguard` já completo).
   **Banco existente (versão anterior):** faça **backup** e rode
   `C:\xampp\php\php.exe bin\migrate.php`. Use `--status` para só listar o que falta.
4. Crie o primeiro administrador:
   `C:\xampp\php\php.exe bin\criar-admin.php --nome="Seu Nome" --email=voce@empresa.com`
   (a senha vem de `SENSEGUARD_ADMIN_PASSWORD` ou é gerada e mostrada uma vez). Para demonstração, em vez disso, importe `database/seeds/dev_usuario_teste.sql` (usuário `admin.teste@senseguard.local`, senha `SenseGuard@123`; só funciona com `'env' => 'development'`).
5. Abra `http://localhost/SENSEGUARD/` (redireciona para `public/`).

Em produção, aponte o *DocumentRoot* para a pasta `public/` e use `'env' => 'production'` e HTTPS.

## Configuração (`config/config.local.php`)

| Chave | Padrão | Para quê |
|---|---|---|
| `db.*` | 127.0.0.1 / senseguard / root | Conexão com o banco |
| `app.env` | `production` | `development` mostra o acesso rápido de demonstração no login |
| `app.session_ttl` | 7200 | Segundos de inatividade até a sessão expirar |
| `app.secure_cookies` | `null` | `null` detecta HTTPS; `true`/`false` força |
| `app.sensor_offline_after_minutes` | 0 | Acima de 0, sensores sem leitura há N min aparecem como offline |
| `security.login_*` | 900 / 5 / 20 | Janela (s), máx. de falhas por e-mail e por IP |

## Perfis

| Perfil | Pode |
|---|---|
| Administrador | Tudo: usuários, máquinas, sensores, ordens, auditoria |
| Supervisor | Criar/editar/excluir máquinas, sensores e ordens |
| Técnico | Consultar tudo e atualizar **status e descrição das ordens atribuídas a ele** |

## Leituras de sensores

Gateways enviam leituras para `POST /public/api.php?entity=readings` com um token de dispositivo; o sistema grava o histórico, atualiza a leitura atual e calcula o status (alerta/online) pelos limites do sensor.

```bash
php bin/criar-token-dispositivo.php --nome="Gateway Linha 1"
curl -X POST "http://localhost/SENSEGUARD/public/api.php?entity=readings" \
  -H "Content-Type: application/json" -H "X-Device-Token: <token>" \
  -d '{"sensorId": 1, "value": 72.4}'
```
Detalhes (lote, histórico, erros) em [`docs/API.md`](docs/API.md).

## Testes e qualidade

```bash
php tests/run.php                       # testes unitários PHP (sem banco, sem Composer)
node --test tests/js/*.test.mjs         # testes das telas em JS (Node 18+, opcional)
composer analyse                        # PHPStan (opcional: composer install)
npm run lint                            # ESLint (opcional: npm install)
```

## Segurança (resumo)

- Consultas sempre com *prepared statements*; toda leitura/escrita é filtrada por organização.
- Senhas com `password_hash`; sessão com cookie HttpOnly/SameSite, `session_regenerate_id` no login e expiração por inatividade.
- CSRF em toda escrita; limite de tentativas de login por e-mail **e** IP, gravado no banco.
- CSP com `script-src 'self'` (sem scripts nem handlers inline), `X-Frame-Options`, `nosniff`, HSTS em HTTPS. Única origem externa: Google Fonts.
- Auditoria de criação, alteração e exclusão (e logins) com usuário, IP e diferenças.
- Contas `@senseguard.local` (demonstração) são recusadas quando `app.env` é `production`.

## Problemas comuns

- **"Configuração local indisponível"** → falta `config/config.local.php`.
- **`Table '...login_tentativa' doesn't exist` / `Unknown column 'id_responsavel'`** → o banco não foi migrado: rode `php bin/migrate.php`.
- **Login de teste recusado** → ajuste `'env' => 'development'` na configuração.
- **Página sem estilo/JS** → acesse por `.../SENSEGUARD/public/` (ou configure o DocumentRoot para `public/`).

Histórico detalhado das mudanças da versão 3.0 e como migrar: [`docs/MUDANCAS.md`](docs/MUDANCAS.md).
