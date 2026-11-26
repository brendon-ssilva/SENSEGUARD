# SenseGuard Data Generator — v0.7.1

Aplicativo independente do PHP. Diagnóstico da etapa 1 preservado; agora gera organizações e usuários fictícios. Não altera schema, migrations ou registros existentes. Não inclui executável Windows nesta etapa.

Referência: `SenseGuard_PI/database/schema.sql`, branch `chore/avaliacao-reestruturacao`, blob `6fa411afe2e9f7d7948427cacbe0f4d05c060c81`; migrations 003 e 006 e `UserController.php`/`Specs.php` da cópia integrada. Perfis: `admin`, `supervisor`, `tecnico`; status `ativo`. Não usa CPF nem tabela `permissao`.

## Atualizar a etapa 1 no Windows

Feche a janela do aplicativo. Extraia o ZIP em uma pasta temporária e copie os arquivos de dentro da pasta `SenseGuard-Data-Generator` sobre a pasta da etapa 1. Preserve `.venv`. Não extraia dentro do repositório PHP.

```powershell
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt
& .\.venv\Scripts\python.exe -m unittest discover -s tests -v
& .\.venv\Scripts\python.exe main.py
```

Se for instalação nova, crie antes o ambiente com `python -m venv .venv`. Python 3.12/3.13 e Tkinter. O MariaDB deve estar ativo no XAMPP. Use credenciais dedicadas ao banco de testes, com SELECT nas tabelas e INSERT em `corporacao` e `usuario` (o SELECT FOR UPDATE também requer privilégio suficiente). Não use credenciais de produção. Banco permitido: `senseguard_teste` ou `senseguard_homologacao`; somente host local. O diagnóstico usa uma transação somente leitura. A configuração efetivamente utilizada é revalidada antes de gravar. Credenciais ficam apenas na memória durante a sessão; não são armazenadas em disco.

## Teste funcional recomendado

1. Faça backup do banco de teste e abra a aplicação. Teste conexão e valide o banco (10 migrations, 3 Views).
2. Clique em **Gerar organizações e usuários**. Escolha novas organizações, quantidade 1; admin 1, supervisor 1, tecnico 2. Informe uma senha exclusivamente de teste (12–72 bytes, sem caractere nulo).
3. Clique **Pré-visualizar (sem gravar)**. Confira 1 organização e 4 usuários. Neste ponto nenhuma operação de escrita foi realizada. Os e-mails terminam em `@example.test` e os CNPJs possuem dígito verificador intencionalmente inválido para evitar representar empresas reais; o schema atual não exige CNPJ válido.
4. Clique **Confirmar e gravar** e aceite a confirmação. A aplicação retorna os IDs e a lista dos cadastros. Os quatro usuários utilizam a senha inicial informada, mas cada um tem salt próprio e hash bcrypt (não criptografia reversível). Não compartilhe a senha.
5. Feche a janela de geração e faça novamente o diagnóstico. Comparado ao banco informado antes do teste, deve haver 3 organizações e 5 usuários (se nenhuma alteração concorrente ocorrer). Máquinas, sensores, leituras e OS não mudam.
6. Teste o login no PHP com o e-mail do admin gerado e a senha escolhida. Saia da sessão antes de entrar. Para gerar usuários em organização existente, abra a lista e selecione o ID/nome apropriado. A geração é aditiva: não repita o teste se não desejar novos dados.

## Garantias e limites

Até 20 empresas, 50 usuários por perfil por empresa e 100 usuários por lote. Todas as inserções do lote são parametrizadas, numa única transação InnoDB. Em erro antes de confirmar, é solicitado rollback; não há UPDATE, DELETE ou DDL. O gerador verifica banco efetivo, presença de colunas/objetos, engine, migrations e foreign_key_checks na conexão de escrita, mas não audita todas as constraints. Índices UNIQUE do banco são a última proteção contra colisões. Se a confirmação do COMMIT falhar, verifique o banco antes de repetir. A gravação direta não passa pela autorização/auditoria HTTP do PHP: por isso o gerador é exclusivo de teste. Não há log persistente nesta versão. Os testes de banco usam conexões simuladas; a validação real de escrita no MariaDB e login no Windows depende de execução local. 20 testes unitários; verificação adicional de hash com password_verify() do PHP no ambiente de desenvolvimento. Os demais geradores e o .exe ainda serão implementados.

## Etapa 03 — Máquinas e sensores (v0.3)

Após validar a conexão, clique em **Gerar máquinas e sensores**. Escolha explicitamente a organização desejada. O destino pode ser novas máquinas (1–20 por lote) ou uma máquina já cadastrada nessa organização. Configure o tipo de máquina e as quantidades de cada tipo de sensor (0–10 por tipo e máquina, até 120 no lote). Máquinas sem sensores também são permitidas. Os tipos e estados correspondem aos enums e CHECKs do SenseGuard. Limites e datas são fictícios, não parâmetros técnicos de manutenção real. Os sensores são gravados offline, com valor inicial 0 e ultima_leitura NULL; nenhuma leitura é inserida nesta etapa. Os sensores são vinculados à máquina e à mesma organização.

A prévia não grava dados; qualquer alteração de parâmetros invalida a prévia. A confirmação executa INSERTs parametrizados em uma única transação, verifica o banco autorizado, o schema e a existência e associação do destino. O aplicativo não altera máquinas existentes nem configurações de segurança. Em caso de erro, não repita automaticamente: se a confirmação do COMMIT for perdida, verifique o banco primeiro. As operações diretas no banco não passam pela auditoria HTTP do PHP.

Para homologar, selecione a organização 3 no ambiente atual e gere duas máquinas, cada uma com um sensor de temperatura, vibração e corrente. Esperado: 2 novas máquinas, 6 sensores novos, nenhum usuário ou leitura adicional. Revise a prévia e confirme uma única vez. A consulta de verificação:

```sql
SELECT m.id_maquina, m.nome, COUNT(s.id_sensor) AS sensores
FROM maquina m LEFT JOIN sensor s
 ON s.id_maquina=m.id_maquina AND s.id_corporacao=m.id_corporacao
WHERE m.id_corporacao=3 GROUP BY m.id_maquina,m.nome;
```

Versão 0.3: 33 testes unitários (13 novos), incluindo conexões simuladas, rollback, validação de limites, máquina de outra organização, destino existente e confirmação incerta. A interface foi exercitada com banco simulado no Linux. Ainda requer homologação de gravação real no MariaDB e Windows. Sem dependências novas, sem alteração no schema e sem executável nesta etapa.

## Versão 0.4 — histórico sintético

Após conectar e validar o banco, clique em **Gerar leituras históricas**. Selecione a organização, escolha os sensores (Ctrl/Shift ou Selecionar todos), informe leituras por sensor (1–1000), intervalo (1–1440 minutos) e percentual de alertas (0–100). O lote é limitado a 5000 leituras e 90 dias de abrangência. O horário final é obtido do relógio do MariaDB ao listar os sensores; use Atualizar sensores e horário para renovar. A prévia não grava registros. O percentual é aplicado ao lote inteiro, arredondado para a quantidade inteira mais próxima, não garantido para cada sensor.

Exemplo: organização 3, seis sensores, 24 leituras por sensor, intervalo de 60 minutos, 10% de alertas: 144 registros, 14 fora dos limites e 130 dentro, abrangendo 23 horas. O último registro de cada sensor pode ser normal ou alerta. Os limites inclusivos são respeitados, com precisão de quatro casas decimais; não são modelos físicos de equipamentos reais.

A confirmação grava em `dados` com `origem='importacao'`, `id_importacao=NULL`, `id_usuario=NULL`, e `recebido_em` pelo default do banco. Essa escolha distingue a simulação direta das leituras recebidas via token. Não há módulo de importação nem uma tabela de importações criada por esta ferramenta. A referência da máquina, quando existente, vem do sensor. O estado atual é atualizado apenas se a leitura mais recente do lote não for anterior a `ultima_leitura`. A interface do SenseGuard pode exibir offline se o tempo desde a leitura ultrapassar a configuração de inatividade. As operações diretas não passam pela auditoria HTTP.

O módulo revalida o banco, a estrutura, a organização e os sensores na transação; rejeita timestamps já existentes para os sensores no lote, alterações nos dados de cadastro dos sensores desde a prévia e datas futuras. Bloqueia as linhas dos sensores durante a gravação, mas não substitui uma restrição única de banco e não garante exclusão mútua com outros produtores que não adotem o mesmo protocolo; pause outros produtores enquanto gerar dados. Não repita automaticamente uma operação se o COMMIT tiver resultado incerto. Faça backup antes de gravar. Nenhuma migration ou dependência nova. Simulação contínua e ordens de serviço disponíveis nas etapas 5 e 6 abaixo.

Testes: `python -m unittest discover -s tests -v` (48 testes na v0.4, incluindo conexões simuladas). A interface foi exercitada com dados simulados em Linux; a gravação real precisa ser validada no MariaDB de teste do usuário. O executável Windows ainda não está compilado.

## Etapa 5 — Simulação contínua (v0.5)

Após validar a conexão, abra **Simular sensores continuamente**, selecione a organização e os sensores. Configure intervalo de 2 a 300 segundos, 1 a 300 ciclos e 0 a 100% de alertas. Limites: 100 sensores e 5000 leituras por sessão. O primeiro ciclo inicia imediatamente; os demais aguardam o intervalo após o commit anterior. Para a organização 3, seis sensores, 5 segundos, 10 ciclos e 10% de alertas produzem 60 leituras e 6 alertas se a sessão terminar normalmente. A distribuição de alertas utiliza arredondamento acumulado por sessão; cada sensor recebe uma leitura por ciclo.

Confirme o resumo antes de iniciar. A interface mostra ciclos, horário do banco, leituras, alertas e sensores atualizados, apenas após confirmação do commit. Interromper ou fechar a janela solicita parada cooperativa: a transação em andamento pode terminar, e os commits anteriores permanecem. Depois da parada, feche a janela normalmente. Em caso de erro, não há repetição automática; confira o banco antes de reiniciar, sobretudo se o resultado do COMMIT for incerto. Se um sensor mudar ou o relógio do banco não avançar, a sessão é interrompida. Use apenas os bancos locais de teste e pause outros produtores de leituras; a proteção de duplicidade do gerador não constitui uma restrição única global. As leituras são gravadas diretamente no MariaDB como `importacao`, sem token HTTP ou auditoria HTTP. Não há alteração de schema. O log desta janela é temporário; exportação persistente fica para etapa posterior. Não há execução em segundo plano após encerrar o aplicativo.

Teste: `python -m unittest discover -s tests -v` (59 testes). A homologação real no Windows/MariaDB é feita separadamente. Nenhuma nova dependência.

## Etapa 6 — Ordens de serviço (v0.6)

Atualize os arquivos sobre a instalação anterior, preservando `.venv`. Após validar a conexão, abra **Gerar ordens de serviço**. Selecione a organização, uma máquina ou todas as listadas, um criador ativo admin/supervisor e um responsável ativo da mesma organização. Selecione 1 a 20 OS por máquina, no máximo 100 por lote. Os tipos, prioridades e status seguem os enums do PHP. A opção `variado` alterna os valores de forma determinística, não estabelece uma distribuição estatística realista. A prévia não grava dados e é invalidada por alterações nos campos.

Exemplo: organização 3, máquinas 6 e 7 (todas), criador ID 2, responsável ID 4, 4 OS por máquina, todos os demais campos `variado`: 8 novas OS, duas por status; 3 preventivas, 3 preditivas e 2 corretivas. Cada OS terá 2, 4, 6 ou 8 horas estimadas. Faça backup antes de confirmar. Datas são calculadas no momento da gravação com o relógio do banco; OS concluídas têm data de abertura e encerramento iguais (simulação de cadastro já concluído), demais não têm encerramento, inclusive canceladas, conforme o PHP. O código `OS-AAAA-00000` é formado após o INSERT pelo ID real e ano do servidor. Os títulos e descrições incluem um identificador de lote fictício. Não altera máquinas, usuários ou leituras. As OS novas podem ser consultadas em `vw_sg_ordens_detalhadas`.

Gravação parametrizada e atômica: valida banco, schema, organização e vínculos; bloqueia as linhas de máquinas e usuários e revalida status/perfil antes de inserir. O usuário do banco necessita permissão de INSERT e UPDATE em `ordem_servico` além de SELECT e privilégios necessários para os bloqueios. Não repita automaticamente após COMMIT incerto. A escrita direta não passa pela auditoria HTTP nem altera o schema. A interface apenas exibe o resultado da operação; exportação persistente e compilação Windows ficam para etapas posteriores.

Testes: 72 testes unitários executados em Python 3.13 no Linux, 13 novos, com conexões simuladas. Abertura da janela, prévia e confirmação simulada verificadas com Tkinter/Xvfb. A homologação de gravação real e interface Windows permanece pendente.

## Etapa 7 — Histórico persistente, exportação e build Windows (v0.7)

O botão **Histórico de operações e exportação CSV** está disponível mesmo sem conectar ao banco. Os eventos são locais, gravados em arquivos JSONL por processo, em `%LOCALAPPDATA%\SenseGuardDataGenerator\logs` (Linux: `~/.local/share/SenseGuardDataGenerator/logs`, se LOCALAPPDATA não estiver definido). Cada operação de escrita iniciada pela interface registra um identificador, horário UTC, banco, organização (quando conhecida), quantidade planejada e, após o retorno do banco, resultado, contagens e IDs aplicáveis. Uma sessão de simulação tem um identificador próprio e cada ciclo tem seus próprios eventos. Não são registrados senhas, hashes, tokens, e-mails, nomes de usuários, SQL ou mensagens brutas de exceção. Diagnósticos, prévias e operações realizadas fora deste aplicativo não são registrados. Os dados criados nas versões anteriores não são registrados retroativamente.

`INICIADO` precede a gravação; `CONFIRMADO` significa retorno de commit confirmado; `FALHA` indica operação sem confirmação, `COMMIT_INCERTO` indica confirmação indisponível. Para sessões há também `CONCLUIDO` e `INTERROMPIDO`. Um início sem desfecho pode indicar encerramento abrupto ou falha de escrita do log: confira o banco antes de repetir. Se não for possível gravar o evento inicial, a operação não começa; se a escrita do resultado falhar, o aplicativo avisa sem mascarar um commit já confirmado. O arquivo local e o MariaDB não formam uma única transação. Os logs não são à prova de adulteração e não substituem auditoria HTTP. Os eventos da sessão são resumos; não some os totais de início, de sessão e de ciclos para obter a quantidade de registros. Considere somente os eventos CONFIRMADO de operações/ciclos. A visualização exibe os últimos 2.000 eventos; CSV exporta todos os eventos legíveis, separados por ponto e vírgula, UTF-8 com BOM, para um novo arquivo (sem sobrescrever). Feche outras instâncias do aplicativo antes de exportar, para evitar ler um arquivo em escrita. Os logs não são removidos automaticamente; mantenha-os em pasta de usuário com acesso restrito e arquive-os conforme necessidade.

### Homologação do módulo

1. Preserve `.venv`, substitua os arquivos e execute `& .\.venv\Scripts\python.exe -m unittest discover -s tests -v` (82 testes esperados).
2. Abra `main.py` com o Python da `.venv`, teste a conexão e abra o histórico. Em uma instalação nova de v0.7, o histórico inicia vazio, mesmo com registros existentes no banco.
3. Na organização 3, selecione os seis sensores e simule 2 ciclos, intervalo 5 segundos, 0% de alertas. Ao terminar, o histórico deve conter 6 eventos: início da sessão, início/commit de cada ciclo e sessão concluída. Esperado: 12 novas leituras, 0 novos alertas, 216 leituras na organização 3 e 221 no banco se nenhum outro produtor tiver gravado desde a v0.6. Após o teste, exporte CSV, feche o aplicativo e reabra para confirmar persistência.
4. Faça outra simulação pequena e interrompa após um ciclo; verifique que os ciclos confirmados permanecem e a sessão aparece INTERROMPIDO se não alcançou o máximo. Teste também login e telas de gráficos/OS no PHP, caso ainda não tenham sido verificados.

### Compilar no Windows

No PowerShell do VS Code, na pasta do aplicativo, com Python 3.13 já instalado e `.venv` existente, execute `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\build.ps1`. O bypass vale apenas para esse processo e não altera permanentemente a política do Windows. Confira o conteúdo do script antes de rodar. Ele instala as dependências e o PyInstaller, executa a suíte e compila em modo onefile/windowed. Requer internet para instalar dependências ainda ausentes. Se algum comando retornar erro, o script interrompe. O arquivo de destino é `dist\SenseGuard-Data-Generator.exe`; o script apresenta o SHA-256. A compilação não usa nem modifica o repositório PHP ou o MariaDB. O comando permite substituir um build anterior na pasta dist; preserve-o se necessário. Execute o .exe e teste conexão, histórico, exportação e um pequeno lote. Não será necessário Python separado no computador de destino, mas será necessário acesso ao MariaDB local de teste e às credenciais. Não distribua o código, o ambiente virtual ou arquivos de configuração do PHP juntamente com o exe. O executável não é assinado digitalmente; não ignore alertas de segurança sem verificar a origem.

Validação de desenvolvimento: 82 testes em Python 3.13 no Linux (10 novos), incluindo conexões simuladas, falha de log, preservação de resultado confirmado, commit incerto, CSV, persistência e parada de sessão. A abertura da janela principal e do histórico com eventos foi testada com Tkinter/Xvfb. O script PowerShell e o build Windows não foram executados neste ambiente Linux; o .exe não está incluído neste ZIP. O build e o teste de execução no Windows são a próxima homologação. Nenhuma alteração no schema ou nas migrations do PHP.

## Correção v0.7.1 — diagnóstico após compilação

O executável v0.7 apresentou RuntimeError no diagnóstico em Windows. A causa exata não foi confirmada. Para reduzir problemas de empacotamento da extensão C do MySQL Connector, todas as conexões passam por uma função comum com `use_pure=True`. O build inclui também os metadados da distribuição do conector. O diagnóstico mostra as últimas localizações da pilha sem texto bruto da exceção, valores locais ou credenciais.

Feche o executável, substitua os arquivos mantendo `.venv`, execute os testes (85 esperados), valide o diagnóstico com `main.py` e recompile via `build.ps1`. Abra a nova cópia em `dist`, não a anterior na Área de Trabalho. Nenhuma alteração no banco ou PHP. O build Windows e a conexão real precisam ser retestados.
