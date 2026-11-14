# Mudanças da versão 3.0

Resultado da revisão de código. Cada seção segue os pontos levantados na revisão.

## 1. Pontos prioritários

| Ponto | O que foi feito |
|---|---|
| 1.1 Leituras dos sensores | Novo endpoint de ingestão `POST api.php?entity=readings` (token de dispositivo, lote de até 100, transacional), histórico em `dados`, leitura atual atualizada e status **derivado** dos limites. Histórico consultável por `GET ...&sensorId=`. Tokens criados por `bin/criar-token-dispositivo.php` (só o hash SHA-256 fica no banco). Opção `sensor_offline_after_minutes` para marcar sensores sem leitura como offline. |
| 1.2 Bugs de lógica | KPI "Concluídas no mês" agora conta o mês de fato (antes contava todas). Alerta diferencia "abaixo do mínimo" e "acima do máximo". **Bug extra encontrado:** `renderBarChart` tinha o parâmetro `h` (altura) escondendo a função `h()` de escape, o que lançava `TypeError` e derrubava o Dashboard sempre que existia alguma máquina; corrigido e coberto por teste. A grade do gráfico deixou de desenhar uma linha por inteiro. A busca perdia o foco a cada letra digitada; agora o foco e o cursor são preservados. O breadcrumb dizia "MaintPro"; agora "SenseGuard". |
| 1.3 Técnico | Técnico atualiza **status e descrição** das ordens atribuídas a ele (tela reduzida); qualquer outro campo ou ordem retorna 403. |
| 1.4 Login | Limite de tentativas por e-mail e por IP em tabela (`login_tentativa`), não mais na sessão. `password_verify` com hash fictício quando o e-mail não existe (sem diferença de tempo). Mensagem de bloqueio (429) exibida ao usuário. |
| 1.5 Cabeçalhos e CDN | CSP (`script-src 'self'`), `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS em HTTPS. **GSAP removido**: animações reescritas com a Web Animations API (sem CDN e sem SRI). Única origem externa: Google Fonts. |
| 1.6 Credenciais de teste | `config.local.php` não acompanha o projeto (só o `.example`). O usuário de teste saiu do schema e virou `database/seeds/dev_usuario_teste.sql`, recusado em produção. Novo `bin/criar-admin.php` cria o primeiro administrador com senha própria/gerada. O botão de acesso rápido do login só aparece em `env=development`. |

## 2. Backend PHP

- **`api.php` (804 linhas) dividido** em `Http` (Request, Response, Router, ApiHandler), `Controller` (um por recurso), `Repository` (SQL), `Validation`, `Domain`, `Auth`, `Service`. Autoload PSR-4 próprio (não exige Composer; há `composer.json` opcional).
- **Duplicação removida:** uma única resposta/erro JSON (`App::run`), um único `bootstrap`, CSRF em uma classe, repositório base que aplica `id_corporacao` automaticamente em toda consulta.
- **Nomenclatura:** código em inglês; banco e interface em português. O mapeamento banco↔API existe em um só lugar (`Domain\Specs`), em vez de duas listas escritas à mão.
- **N+1 eliminado:** os sensores de todas as máquinas vêm em uma consulta. Listas aceitam `limit`/`offset`.
- **Validação:** `Validation\Validator` + `Fields`, guiadas pelas `Specs`. Erros trazem o campo (`field`), e o formulário destaca o input correspondente.
- **Erros:** exceções `ApiException`; erros do banco viram mensagens claras (duplicado, registro vinculado, CHECK).

## 3. Front-end

- `dashboard.js` (1.347 linhas) + `settings.js` + `script.js` viraram **módulos ES**: `api`, `state`, `events`, `data`, `shell`, `session`, `ui/` (modal, toast, charts, motion, componentes, ícones), `utils/`, `views/` (dashboard, machines, sensors, orders, users, audit, settings).
- **Sem handlers inline:** 26 `onclick=` trocados por `data-action` com delegação de eventos. Estilos inline estáticos viraram classes; sobrou só a largura dinâmica das barras de leitura.
- **Um único escape de HTML** (`utils/dom.js`, inclui aspas simples).
- **`saveEntity`/`deleteEntity`** substituem os handlers repetidos; `apiFetch` devolve o JSON direto e trata 401 redirecionando ao login.
- `alert()` → notificações (toast). Tudo com `async/await`. Esc fecha o modal; Enter nos campos salva.
- Versão e cache: a versão vem do servidor e os CSS usam `?v=<filemtime>`.
- `dashboard.html` removido. `index.html` → `index.php` (quem já está logado vai direto ao painel).
- Os valores permitidos (status, tipos...) vêm do servidor (`meta`), não de listas duplicadas no JS.

## 4. Banco de dados (migrações 002–007)

- `permissao` e `usuario.id_permissao` removidos: `usuario.role` é a única fonte. Coluna `cpf` (não usada) removida (LGPD).
- `num_serial` implementado (campo na máquina) e único **por organização**. `codigo_os` implementado (`OS-AAAA-00042`).
- `ordem_servico.id_usuario` → `id_responsavel`; novo `id_criador`.
- `dados.id_maquina` aceita NULL (sensor sem máquina também registra leituras).
- `CHECK` para papéis, status, tipos e prioridades, alinhados com os enums do PHP.
- Novas tabelas: `auditoria`, `login_tentativa`, `token_dispositivo`, `migracao`.
- Estrutura em **migrações numeradas**, `bin/migrate.php` e `schema.sql` consolidado; dados de teste separados.

## 5. Organização e qualidade

- `public/` é a única pasta exposta; `src`, `config`, `database`, `bin`, `tests` ficam bloqueadas por `.htaccess` mesmo no XAMPP. `.htaccess` bloqueia `.md`, `.sql`, `.json` etc.
- README refeito para refletir o projeto real.
- Testes: `tests/run.php` (PHP, sem dependências) e `tests/js` (Node). Configs opcionais de PHPStan, PHP-CS-Fixer e ESLint.
- Auditoria: criação, alteração (com diff) e exclusão de máquinas, sensores, ordens e usuários, mais login/logout; tela exclusiva do administrador.

## Como migrar da versão anterior

1. **Backup do banco.**
2. Substitua os arquivos pelo projeto novo e crie `config/config.local.php` (o formato antigo, plano, ainda é aceito; ele assume `env=production` — adicione `'app' => ['env' => 'development']` para ambiente local).
3. `php bin/migrate.php` (o banco antigo é reconhecido; a 001 é só registrada).
4. Se houver usuários com perfil fora de `admin/supervisor/tecnico` ou valores de status fora dos permitidos, a migração 003/006 avisa e para: corrija e rode de novo.

## Mudanças que quebram compatibilidade

- URLs agora sob `public/` (`.../SENSEGUARD/public/`); a raiz redireciona.
- Erros da API: `{"success": false, "error": "..."}`; validações usam 422 (antes 400).
- Sensor: o status `alerta` não é mais gravado à mão (é calculado).
- Colunas renomeadas/removidas (`id_usuario`→`id_responsavel` em `ordem_servico`, `permissao`, `cpf`): scripts externos que as usam precisam ser ajustados.
- Em produção, o cookie de sessão é restrito à pasta `public/`: usuários terão que entrar de novo uma vez.
