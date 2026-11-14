
# SenseGuard — Validação de AJAX, Fetch e JSON

## 1. Objetivo

Documentar os testes de comunicação assíncrona entre o
JavaScript, a API PHP e o banco de dados MySQL.

## 2. Ambiente utilizado

- Servidor: Apache (XAMPP)
- Backend: PHP com PDO
- Banco de testes: senseguard_teste
- Frontend: JavaScript com Fetch API e async/await
- Navegador: DevTools, aba Network / Fetch-XHR

Os testes foram realizados em ambiente isolado, sem
alterações no banco principal.

## 3. Testes executados

| Teste | Requisição | Resultado |
|---|---|---|
| Busca dinâmica | GET ?entity=machines&q=compressor | HTTP 200; máquina encontrada |
| Busca inexistente | GET ?entity=machines&q=MAQUINA_INEXISTENTE_999 | Lista JSON vazia |
| Detalhes por ID | GET ?entity=machines&id=2 | HTTP 200; dados exibidos no modal |
| Cadastro de máquina | POST ?entity=machines | HTTP 201; JSON com ID |
| Persistência | Recarregamento e nova busca | Registro mantido no MySQL |
| Exclusão | DELETE pelo painel e GET de conferência | Registro excluído; consulta retornou [] |

## 4. Comportamento da interface

- A busca atualiza os resultados sem recarregar a página.
- A busca apresenta estado de carregamento.
- Pesquisas sem correspondência apresentam mensagem.
- O botão Detalhes consulta a API pelo ID.
- A edição de máquina continua funcionando.
- A listagem é atualizada após salvar ou excluir.

## 5. Segurança e tratamento de dados

- As consultas SQL utilizam parâmetros preparados.
- O backend restringe os registros à corporação autenticada.
- As operações de escrita exigem autenticação e token CSRF.
- O frontend utiliza JSON e trata falhas HTTP.

## 6. Testes automatizados

Executado:

node --test tests/js/views.test.mjs

Resultado observado:
- 7 testes executados
- 7 aprovados
- 0 falhas

Esses testes validam funcionalidades existentes do frontend.
Os fluxos AJAX e a persistência foram verificados
manualmente no navegador e no banco de testes.

## 7. Conclusão

Os testes manuais confirmaram o funcionamento das
requisições GET e POST com JSON, a consulta dinâmica
de máquinas, a exibição de detalhes por ID e a
persistência dos dados no MySQL.

A aplicação preservou o layout e as funcionalidades
anteriores durante as alterações.
