# SenseGuard — consulta dinâmica de medições

Entrega de 27/11/2026. Base: `chore/avaliacao-reestruturacao`, commit `0fed8c84f59518722b2816c5dc9d42e968371445`. Branch: `feat/senseguard-filtros-dinamicos`.

## Contexto e decisão

O SenseGuard é um sistema web de manutenção industrial: painel, máquinas, sensores, ordens, usuários, auditoria e ingestão de medições. A branch remota foi adotada como fonte de verdade, por ser mais recente que os arquivos PHP/JS monolíticos anexados ao projeto de conversa. Foi inventariada a árvore completa e feita revisão direcionada do fluxo de sessão, permissões, HTTP, validação, repositórios, schema e migrations relevantes, navegação, configuração, documentação e geração de medições. Não se trata de auditoria linha a linha de todos os módulos legados ou de certificação de segurança.

Já havia busca remota de máquinas via GET, filtros locais em outras telas e histórico de um sensor via GET. Faltava consulta histórica combinada no servidor com formulário POST JSON. A nova view **Histórico de leituras**, dentro do painel autenticado, resolve essa lacuna sem substituir os CRUDs, a pesquisa existente, as views SQL de relatórios ou os endpoints de dispositivo. A tabela dados contém o tipo, valor, horário, organização e vínculos da medição; a migration 009 registra origem e anulação, e a 005 permite máquina ausente.

## Operação

No painel, abra **Histórico de leituras**. A primeira página carrega automaticamente. Combine pesquisa literal por nome atual do sensor ou da máquina registrada na medição, tipo, origem, datas inicial/final (inclusive) e ordenação. Aplique com o botão ou Enter. Limpar filtros retorna à consulta inicial. Anterior/Próxima percorrem os resultados da última consulta aplicada. A resposta retorna até 50 medições por página; não há COUNT global. Nomes ausentes aparecem como travessão. Não inferimos unidade histórica a partir do cadastro atual, nem status histórico a partir dos limites atuais.

O acesso é permitido a admin, supervisor e técnico autenticados, como na consulta operacional existente, exclusivamente na própria organização. A nova operação é somente leitura, mesmo usando POST.

## Fluxo e requisitos

| Requisito | Implementação |
|---|---|
| Formulário | public/assets/js/views/readings.js, navegação por constants.js e main.js |
| submit sem recarga | evento submit e event.preventDefault() na view |
| fetch + QUERY | apiFetch() em api.js utiliza window.fetch; URL api.php?entity=readings-query e filtros no corpo JSON |
| php://input | Request::json(4096, true), chamado em ReadingController::search |
| SELECT parametrizado | ReadingQuery::build e ReadingRepository::search; bindValue com PDO::PARAM_INT/STR, prepared statements nativos |
| Renderização DOM | createElement, textContent, replaceChildren; somente a tabela e seus controles são atualizados |
| Entrega GitHub | branch dedicada contendo SenseGuard_PI e SenseGuard-Data-Generator |

Fluxo: formulário -> apiFetch (POST JSON + cookie + CSRF) -> ApiHandler (sessão e CSRF) -> Router -> ReadingController -> ReadingQuery/ReadingRepository -> PDO/MySQL -> Response JSON -> DOM. A query string contém apenas o nome fixo do recurso, não os filtros. A abordagem foi escolhida para atender simultaneamente ao enunciado e à leitura obrigatória de php://input.

Os LEFT JOINs de sensor e máquina incluem o identificador da organização. O WHERE usa a organização do usuário autenticado, nunca do corpo ou URL, e ignora medições anuladas. As condições opcionais são unidas por AND; pesquisa usa LIKE com escape explícito de !, % e _. Ordenação e campos vêm de listas fixas. Datas não aplicam funções às colunas. Valores decimais são retornados como texto para evitar perda de precisão. A paginação é determinística para dados estáticos (horário e ID como desempate).

## Instalação e uso com o gerador

Siga o README principal e o README do gerador. Não há migration nova nem dependência adicional na aplicação web. Use PHP 8.1+, PDO MySQL, Apache e MySQL/MariaDB. Nunca publique config/config.local.php.

Para teste do gerador, use exclusivamente um banco local separado chamado senseguard_teste ou senseguard_homologacao, com migrations 001–010 e views. Configure a aplicação PHP para apontar para o mesmo banco; confira o destino do schema (o script de instalação limpa cria/seleciona senseguard; não o importe cegamente no banco de teste). Prefira criar o banco isolado e aplicar as migrations pelo bin/migrate.php conforme o README. Crie usuário de teste via CLI e, se desejar, use o gerador para criar organizações/usuários, máquinas, sensores e medições. Use credenciais dedicadas, não as de produção.

No Windows, dentro de SenseGuard-Data-Generator, crie/ative o ambiente virtual, instale requirements.txt e execute main.py. Teste a conexão antes de gravar; gere os dados fictícios da organização usada no login, depois filtre por origem Importação. O código e a estrutura do gerador foram mantidos idênticos à origem (árvore Git a98ea9d3b9ca12bcddaedb2b15056542518bb93f). Seu build EXE e a integração com MariaDB não foram executados nesta entrega.

## Segurança e privacidade

- Sessão revalidada no banco, escopo obrigatório por organização, CSRF existente em POST, sem CORS adicional. Tokens de dispositivo não autenticam esta consulta.
- Validação de nomes de campos, enums, datas reais e período, texto até 100 caracteres, página inteira de 1 a 2000. Corpo JSON limitado a 4096 bytes, verificado antes do parse.
- Prepared statements nativos, colunas explícitas, ordenação de allowlist e LIMIT/OFFSET parametrizados. Respostas sem cache; dados externos renderizados como texto.
- Não consulta a tabela usuario, auditoria ou token_dispositivo, nem retorna id_usuario, e-mail, telefone, credenciais ou IP. Não registra pesquisas no AuditLog. Não há coleta pessoal adicional, mecanismo de consentimento ou declaração de anonimização.
- A interface usa rótulos, navegação por teclado, região aria-live, aria-busy, foco visível e grade CSS adaptativa. AbortController, botão desabilitado durante a consulta e verificação da conexão do formulário ao DOM evitam sobrescrita por respostas antigas.
- O gerador cria identificadores fictícios, CNPJ com dígito deliberadamente inválido, e-mails example.test e senhas de teste com bcrypt; verifica o banco de destino. Não inserir dados reais nos campos livres ou exportar dados de produção.

Estas medidas atendem tecnicamente aos princípios de finalidade, adequação, necessidade, segurança e prevenção (LGPD art. 6º e 46, https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm). A conformidade jurídica e organizacional depende também de bases legais, transparência, retenção, direitos dos titulares, governança e controles de implantação. Não há certificação LGPD.

Riscos residuais: o sistema existente registra IP, nome e alterações na auditoria, além de dados de tentativas de login; revisar retenção, acesso e eventual minimização desses logs. Nomes de máquinas/sensores podem conter dados pessoais caso sejam preenchidos indevidamente. Não foram revisados exaustivamente segredos no histórico Git anterior. A conta de demonstração e o config de exemplo são exclusivos de desenvolvimento. Não houve mudança da política geral de permissões.

## Desempenho e limitações

A página é limitada a 50 registros e o banco recupera 51 para determinar a existência da próxima página. O teto de 2000 páginas evita offsets arbitrários, mas não substitui rate limiting centralizado e não limita o custo de todas as buscas LIKE. Em produção, medir EXPLAIN com volumes reais, considerar índice composto (id_corporacao, anulada_em, data_hora, id_medida) e paginação por cursor. Não se introduziu uma migration sem validar sua necessidade. Em ingestão concorrente, OFFSET pode repetir/pular registros; não é um snapshot consistente. A navegação não mantém filtros quando a view é reconstruída, intencionalmente; filtros não são gravados no navegador.

## Validação executada e pendências

Ambiente PHP CLI 8.4.24, Node 22.16.0. O clone direto estava indisponível por DNS e não havia driver PDO no ambiente. Arquivos necessários foram recuperados/reproduzidos localmente e conferidos por hash Git com a branch; não foi executada a suíte inteira do projeto.

| Cenário | Resultado |
|---|---|
| 7 testes PHP de ReadingQueryTest | Aprovados em runner isolado com classes reais de domínio, Request e Validator |
| 2 testes Node de readings.test.mjs | Aprovados com módulos reais da branch |
| SELECT com parâmetros, combinação, isolamento tenant/JOIN, anuladas, datas inclusivas, 60 registros e página seguinte, busca literal/injeção/resultado vazio | Aprovados em fixture SQLite em memória usando o SQL produzido pela classe PHP; não equivale a MySQL/PDO |
| DOM real Chromium com fonte JS da branch reunida em fixture isolada e fetch simulado | Aprovados: POST e cabeçalhos, preenchimento combinado, Enter, paginação, limpeza, estado vazio, erro 500, falha de rede, carregamento, XSS como texto, resposta antiga ignorada, preservação do documento |
| Sessão real, CSRF real, integração PHP + MySQL, volume real, regressões completas, gerador e layout responsivo completo | Não executados; ambiente sem PDO MySQL, clone direto e navegação HTTP bloqueados |

Os testes de unidade estão versionados. Rode na cópia do projeto:

    php tests/run.php
    node --test tests/js/*.test.mjs

Validação manual final no XAMPP (banco de teste): testar cada filtro e combinação, limpar, buscar texto inexistente, datas inválidas, caracteres especiais, tentar enviar corporationId e sort inválido no DevTools (400/422), verificar 401 sem sessão e 403 sem CSRF, comparar resultados com SELECT no banco, criar duas organizações fictícias e confirmar isolamento de dados em sessões distintas, gerar mais de 50 medições, conferir paginação e console/network sem recarga. Simular offline/HTTP 500. Validar os três perfis, CRUDs, ingestão com token, histórico GET antigo, configurações e auditoria. Conferir os temas claro/escuro e visual em desktop/mobile. Executar os testes do gerador com dependências instaladas.

## Organização Git

A nova branch foi criada a partir do commit original, com apenas as duas pastas solicitadas no estado atual. A remoção de versões antigas e arquivos de raiz ocorreu apenas na nova branch; o histórico e a branch de origem foram preservados. Não foi feito force push. Configuração local, backups, dumps e artefatos gerados não foram adicionados.
