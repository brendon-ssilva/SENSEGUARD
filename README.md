# SenseGuard

Sistema de gestão de manutenção industrial e monitoramento de sensores, desenvolvido para gerenciamento de equipamentos, acompanhamento de indicadores e simulação de dados industriais.

## Funcionalidades

- Gerenciamento de organizações e usuários.
- Cadastro de máquinas e sensores industriais.
- Monitoramento de leituras e alertas.
- Gerenciamento de ordens de serviço.
- Dashboard com indicadores operacionais.
- Views SQL para consultas e relatórios.
- Controle de acesso e isolamento entre organizações.
- Integração de dispositivos por API de token.

## Estrutura do repositório

| Diretório | Descrição |
|---|---|
| SenseGuard_PI/ | Sistema web principal |
| SenseGuard-Data-Generator/ | Aplicativo independente de geração de dados industriais |

## API de integração

A API permite integrar dispositivos externos ao SenseGuard, utilizando autenticação por token.

- Permissões individualizadas.
- Restrições por IP e CIDR.
- Revogação de tokens.
- Consulta de sensores autorizados.
- Recebimento de leituras individuais e em lote.
- Controle de transações e isolamento entre organizações.

[Consultar documentação da API](SenseGuard_PI/docs/API.md)

## SenseGuard Data Generator

Aplicativo desktop independente desenvolvido em Python para geração de dados fictícios em ambientes de teste e homologação.

### Recursos

- Geração de organizações e usuários.
- Geração de máquinas e sensores.
- Geração de leituras históricas.
- Simulação contínua de sensores e alertas.
- Geração de ordens de serviço.
- Pré-visualização de registros.
- Controle de transações e rollback.
- Histórico persistente de operações.
- Exportação de registros de operações em CSV.

### Download

**Versão atual: 0.7.1 — Windows x64**

[Baixar SenseGuard Data Generator.exe](https://github.com/brendon-ssilva/SENSEGUARD/releases/download/data-generator-v0.7.1/SenseGuard-Data-Generator.exe)

[Consultar Release](https://github.com/brendon-ssilva/SENSEGUARD/releases/tag/data-generator-v0.7.1)

[Consultar código-fonte e instruções de compilação](SenseGuard-Data-Generator/README.md)

O aplicativo compilado não exige instalação separada do Python. É necessário possuir o MariaDB em execução e um banco de testes compatível com o SenseGuard.

## Tecnologias utilizadas

| Sistema web | Data Generator |
|---|---|
| PHP | Python |
| HTML | Tkinter |
| CSS | MySQL Connector |
| JavaScript | bcrypt |
| MySQL / MariaDB | PyInstaller |
| AJAX / Fetch / JSON | JSONL / CSV |

## Instalação e documentação

- [Instalação e configuração do SenseGuard](SenseGuard_PI/README.md)
- [Documentação da API](SenseGuard_PI/docs/API.md)
- [Instalação e compilação do Data Generator](SenseGuard-Data-Generator/README.md)

## Testes automatizados

| Componente | Testes |
|---|---:|
| PHP | 51 |
| JavaScript | 7 |
| Python | 85 |
| **Total** | **143** |

## Segurança

O sistema utiliza autenticação, controle de permissões, consultas parametrizadas e isolamento de dados entre organizações.

O Data Generator é destinado exclusivamente a ambientes locais de testes e homologação. Suas operações diretas no banco não passam pela auditoria HTTP do sistema web.

Não versione credenciais, tokens, configurações privadas ou ambientes virtuais.

## Versionamento

O projeto utiliza Git e GitHub para controle de versões, organização das implementações e distribuição do aplicativo compilado por GitHub Releases.