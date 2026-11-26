-- ================================================================
-- SenseGuard - esquema completo para INSTALAÇÃO LIMPA (arquivo gerado).
-- Reúne database/migrations/*.sql em ordem e registra as versões aplicadas.
-- Para atualizar um banco existente use: php bin/migrate.php
-- Compatível com PHP/PDO e MySQL 8 / MariaDB 10.4+ (XAMPP).
-- ================================================================

CREATE DATABASE IF NOT EXISTS senseguard
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE senseguard;

-- >>> 001_schema_inicial
-- Baseline: estrutura original do SenseGuard (idempotente: CREATE TABLE IF NOT EXISTS / INSERT IGNORE).
-- Em bancos que já usam este esquema, o migrate.php apenas registra esta migração.
-- Estrutura original do SenseGuard (charset utf8mb4, InnoDB, chaves compostas por organização).
-- Compatível com PHP/PDO e MySQL/MariaDB do XAMPP.

CREATE TABLE IF NOT EXISTS corporacao (
  id_corporacao INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  cnpj VARCHAR(18) NOT NULL,
  email VARCHAR(100) NOT NULL,
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_corporacao),
  UNIQUE KEY uq_corporacao_cnpj (cnpj),
  KEY idx_corporacao_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS permissao (
  id_permissao INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_permissao),
  UNIQUE KEY uq_permissao_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(14) NULL,
  email VARCHAR(100) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'tecnico',
  status VARCHAR(20) NOT NULL DEFAULT 'ativo',
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_permissao INT UNSIGNED NOT NULL,
  id_corporacao INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuario_email (email),
  UNIQUE KEY uq_usuario_cpf (cpf),
  UNIQUE KEY uq_usuario_id_corporacao (id_usuario, id_corporacao),
  KEY idx_usuario_permissao (id_permissao),
  KEY idx_usuario_corporacao (id_corporacao),
  CONSTRAINT fk_usuario_permissao FOREIGN KEY (id_permissao)
    REFERENCES permissao (id_permissao) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_usuario_corporacao FOREIGN KEY (id_corporacao)
    REFERENCES corporacao (id_corporacao) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maquina (
  id_maquina INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  num_serial VARCHAR(50) NULL,
  modelo VARCHAR(100) NULL,
  fabricante VARCHAR(100) NULL,
  localizacao VARCHAR(100) NULL,
  departamento VARCHAR(100) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'operando',
  data_instalacao DATE NULL,
  ultima_manutencao DATE NULL,
  proxima_manutencao DATE NULL,
  id_corporacao INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_maquina),
  UNIQUE KEY uq_maquina_serial (num_serial),
  UNIQUE KEY uq_maquina_id_corporacao (id_maquina, id_corporacao),
  KEY idx_maquina_corporacao (id_corporacao),
  CONSTRAINT fk_maquina_corporacao FOREIGN KEY (id_corporacao)
    REFERENCES corporacao (id_corporacao) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sensor (
  id_sensor INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(50) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  unidade VARCHAR(20) NULL,
  localizacao VARCHAR(100) NULL,
  min_limite DECIMAL(14,4) NOT NULL DEFAULT 0,
  max_limite DECIMAL(14,4) NOT NULL DEFAULT 100,
  valor_atual DECIMAL(14,4) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'online',
  ultima_leitura DATETIME NULL,
  id_maquina INT UNSIGNED NULL,
  id_corporacao INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_sensor),
  KEY idx_sensor_maquina (id_maquina),
  KEY idx_sensor_corporacao (id_corporacao),
  CONSTRAINT fk_sensor_maquina_corporacao FOREIGN KEY (id_maquina, id_corporacao)
    REFERENCES maquina (id_maquina, id_corporacao) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_sensor_corporacao FOREIGN KEY (id_corporacao)
    REFERENCES corporacao (id_corporacao) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dados (
  id_medida BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tipo_medida VARCHAR(50) NOT NULL,
  valor DECIMAL(16,5) NOT NULL,
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_maquina INT UNSIGNED NOT NULL,
  id_sensor INT UNSIGNED NULL,
  id_corporacao INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_medida),
  KEY idx_dados_maquina_data (id_maquina, data_hora),
  KEY idx_dados_sensor_data (id_sensor, data_hora),
  KEY idx_dados_corporacao (id_corporacao),
  CONSTRAINT fk_dados_maquina_corporacao FOREIGN KEY (id_maquina, id_corporacao)
    REFERENCES maquina (id_maquina, id_corporacao) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_dados_sensor FOREIGN KEY (id_sensor)
    REFERENCES sensor (id_sensor) ON UPDATE RESTRICT ON DELETE SET NULL,
  CONSTRAINT fk_dados_corporacao FOREIGN KEY (id_corporacao)
    REFERENCES corporacao (id_corporacao) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ordem_servico (
  id_os INT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo_os VARCHAR(30) NULL,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NULL,
  tipo VARCHAR(30) NOT NULL DEFAULT 'preventiva',
  prioridade VARCHAR(20) NOT NULL DEFAULT 'baixa',
  status VARCHAR(30) NOT NULL DEFAULT 'aberta',
  horas_estimadas DECIMAL(10,2) NOT NULL DEFAULT 2,
  data_prevista DATE NULL,
  data_abertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_encerramento DATETIME NULL,
  id_maquina INT UNSIGNED NOT NULL,
  id_usuario INT UNSIGNED NOT NULL,
  id_corporacao INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_os),
  UNIQUE KEY uq_ordem_servico_codigo (codigo_os),
  KEY idx_os_maquina (id_maquina),
  KEY idx_os_usuario (id_usuario),
  KEY idx_os_corporacao_status (id_corporacao, status),
  CONSTRAINT fk_os_maquina_corporacao FOREIGN KEY (id_maquina, id_corporacao)
    REFERENCES maquina (id_maquina, id_corporacao) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_os_usuario_corporacao FOREIGN KEY (id_usuario, id_corporacao)
    REFERENCES usuario (id_usuario, id_corporacao) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_os_corporacao FOREIGN KEY (id_corporacao)
    REFERENCES corporacao (id_corporacao) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registros-base necessários para o primeiro acesso e para as FKs.
INSERT IGNORE INTO corporacao (id_corporacao, nome, cnpj, email)
VALUES (1, 'Empresa Teste', '00.000.000/0001-00', 'admin@empresa.com');

INSERT IGNORE INTO permissao (id_permissao, nome) VALUES
  (1, 'Administrador'),
  (2, 'Técnico'),
  (3, 'Supervisor');

-- >>> 002_seguranca_e_auditoria
-- Tabelas novas: limite de tentativas de login, trilha de auditoria e tokens de dispositivos (sensores/gateways).

CREATE TABLE IF NOT EXISTS login_tentativa (
  id_tentativa BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(191) NOT NULL,
  ip VARCHAR(45) NOT NULL,
  criado_em DATETIME NOT NULL,
  PRIMARY KEY (id_tentativa),
  KEY idx_login_tentativa_email (email, criado_em),
  KEY idx_login_tentativa_ip (ip, criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auditoria (
  id_auditoria BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_corporacao INT UNSIGNED NOT NULL,
  id_usuario INT UNSIGNED NULL,
  usuario_nome VARCHAR(100) NULL,
  entidade VARCHAR(30) NOT NULL,
  id_registro INT UNSIGNED NULL,
  acao VARCHAR(20) NOT NULL,
  alteracoes MEDIUMTEXT NULL,
  ip VARCHAR(45) NULL,
  criado_em DATETIME NOT NULL,
  PRIMARY KEY (id_auditoria),
  KEY idx_auditoria_corporacao (id_corporacao, id_auditoria),
  KEY idx_auditoria_entidade (id_corporacao, entidade, id_auditoria),
  CONSTRAINT fk_auditoria_corporacao FOREIGN KEY (id_corporacao)
    REFERENCES corporacao (id_corporacao) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS token_dispositivo (
  id_token INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_corporacao INT UNSIGNED NOT NULL,
  nome VARCHAR(100) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_uso DATETIME NULL,
  PRIMARY KEY (id_token),
  UNIQUE KEY uq_token_dispositivo_hash (token_hash),
  KEY idx_token_dispositivo_corporacao (id_corporacao),
  CONSTRAINT fk_token_dispositivo_corporacao FOREIGN KEY (id_corporacao)
    REFERENCES corporacao (id_corporacao) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- >>> 003_usuario_sem_permissao_e_cpf
-- O perfil do usuário passa a ter uma única fonte de verdade: usuario.role.
-- Remove a tabela permissao (redundante) e a coluna cpf (não utilizada; minimização de dados pessoais - LGPD).
-- ATENCAO: faça backup antes. Dados da coluna cpf serão perdidos.

UPDATE usuario SET role = LOWER(TRIM(role)), status = LOWER(TRIM(status));

ALTER TABLE usuario DROP FOREIGN KEY fk_usuario_permissao;
ALTER TABLE usuario DROP INDEX idx_usuario_permissao;
ALTER TABLE usuario DROP COLUMN id_permissao;
ALTER TABLE usuario DROP INDEX uq_usuario_cpf;
ALTER TABLE usuario DROP COLUMN cpf;

DROP TABLE IF EXISTS permissao;

ALTER TABLE usuario ADD CONSTRAINT ck_usuario_role CHECK (role IN ('admin', 'supervisor', 'tecnico'));
ALTER TABLE usuario ADD CONSTRAINT ck_usuario_status CHECK (status IN ('ativo', 'inativo'));

-- >>> 004_ordem_servico_responsavel_criador
-- ordem_servico.id_usuario era o responsável pela OS: o nome passa a dizer isso (id_responsavel).
-- Novo campo id_criador (quem abriu a OS) e código legível (OS-AAAA-00042) para as OS existentes.

ALTER TABLE ordem_servico DROP FOREIGN KEY fk_os_usuario_corporacao;
ALTER TABLE ordem_servico DROP INDEX idx_os_usuario;
ALTER TABLE ordem_servico CHANGE COLUMN id_usuario id_responsavel INT UNSIGNED NOT NULL;
ALTER TABLE ordem_servico ADD KEY idx_os_responsavel (id_responsavel);
ALTER TABLE ordem_servico ADD CONSTRAINT fk_os_responsavel_corporacao FOREIGN KEY (id_responsavel, id_corporacao)
  REFERENCES usuario (id_usuario, id_corporacao) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE ordem_servico ADD COLUMN id_criador INT UNSIGNED NULL AFTER id_responsavel;
ALTER TABLE ordem_servico ADD KEY idx_os_criador (id_criador);
ALTER TABLE ordem_servico ADD CONSTRAINT fk_os_criador_corporacao FOREIGN KEY (id_criador, id_corporacao)
  REFERENCES usuario (id_usuario, id_corporacao) ON UPDATE RESTRICT ON DELETE RESTRICT;

UPDATE ordem_servico
  SET codigo_os = CONCAT('OS-', DATE_FORMAT(data_abertura, '%Y'), '-', LPAD(id_os, 5, '0'))
  WHERE codigo_os IS NULL;

-- >>> 005_dados_maquina_opcional
-- Leituras de sensores sem máquina vinculada também precisam ser registradas: id_maquina passa a aceitar NULL.

ALTER TABLE dados DROP FOREIGN KEY fk_dados_maquina_corporacao;
ALTER TABLE dados MODIFY COLUMN id_maquina INT UNSIGNED NULL;
ALTER TABLE dados ADD CONSTRAINT fk_dados_maquina_corporacao FOREIGN KEY (id_maquina, id_corporacao)
  REFERENCES maquina (id_maquina, id_corporacao) ON UPDATE RESTRICT ON DELETE RESTRICT;

-- >>> 006_restricoes_de_dominio
-- Valores permitidos garantidos pelo banco (CHECK), alinhados com os enums do PHP (src/Domain).
-- Exige MySQL 8.0.16+ ou MariaDB 10.2.1+ para serem aplicadas; versões antigas aceitam a sintaxe e ignoram.

UPDATE maquina SET status = LOWER(TRIM(status));
UPDATE sensor SET status = LOWER(TRIM(status)), tipo = LOWER(TRIM(tipo));
UPDATE ordem_servico SET tipo = LOWER(TRIM(tipo)), prioridade = LOWER(TRIM(prioridade)), status = LOWER(TRIM(status));

ALTER TABLE maquina ADD CONSTRAINT ck_maquina_status CHECK (status IN ('operando', 'alerta', 'critico', 'manutencao', 'inativo'));
ALTER TABLE sensor ADD CONSTRAINT ck_sensor_status CHECK (status IN ('online', 'offline', 'alerta'));
ALTER TABLE sensor ADD CONSTRAINT ck_sensor_tipo CHECK (tipo IN ('temperatura', 'vibracao', 'pressao', 'corrente', 'umidade', 'rpm'));
ALTER TABLE ordem_servico ADD CONSTRAINT ck_os_tipo CHECK (tipo IN ('preventiva', 'preditiva', 'corretiva'));
ALTER TABLE ordem_servico ADD CONSTRAINT ck_os_prioridade CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica'));
ALTER TABLE ordem_servico ADD CONSTRAINT ck_os_status CHECK (status IN ('aberta', 'em_andamento', 'concluida', 'cancelada'));

-- >>> 007_serial_unico_por_corporacao
-- O número de série passa a ser único dentro de cada organização (antes era único no sistema inteiro).

ALTER TABLE maquina DROP INDEX uq_maquina_serial;
ALTER TABLE maquina ADD UNIQUE KEY uq_maquina_corporacao_serial (id_corporacao, num_serial);

-- >>> 009_dados_origem_e_rastreio
-- Rastreabilidade das leituras (base para importações e para desfazê-las):
--   origem        dispositivo | importacao | manual
--   id_importacao identifica a importação de origem (a tabela importacao chega com o Pacote B; sem chave estrangeira por enquanto)
--   recebido_em   quando o SenseGuard recebeu a leitura (data_hora continua sendo quando foi medida)
--   anulada_em    leitura cancelada (nunca é apagada; consultas e recálculos a ignoram)
--   id_usuario    quem digitou uma leitura manual (sem chave estrangeira, para não impedir a exclusão do usuário)

ALTER TABLE dados ADD COLUMN origem VARCHAR(12) NOT NULL DEFAULT 'dispositivo';
ALTER TABLE dados ADD COLUMN id_importacao INT UNSIGNED NULL;
ALTER TABLE dados ADD COLUMN recebido_em DATETIME NULL;
ALTER TABLE dados ADD COLUMN anulada_em DATETIME NULL;
ALTER TABLE dados ADD COLUMN id_usuario INT UNSIGNED NULL;

UPDATE dados SET recebido_em = data_hora WHERE recebido_em IS NULL;

ALTER TABLE dados MODIFY COLUMN recebido_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE dados ADD KEY idx_dados_importacao (id_importacao);
ALTER TABLE dados ADD CONSTRAINT ck_dados_origem CHECK (origem IN ('dispositivo', 'importacao', 'manual'));

-- Controle de migrações (usado por bin/migrate.php).
CREATE TABLE IF NOT EXISTS migracao (
  versao VARCHAR(100) NOT NULL,
  executada_em DATETIME NOT NULL,
  PRIMARY KEY (versao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO migracao (versao, executada_em) VALUES
  ('001_schema_inicial', NOW()),
  ('002_seguranca_e_auditoria', NOW()),
  ('003_usuario_sem_permissao_e_cpf', NOW()),
  ('004_ordem_servico_responsavel_criador', NOW()),
  ('005_dados_maquina_opcional', NOW()),
  ('006_restricoes_de_dominio', NOW()),
  ('007_serial_unico_por_corporacao', NOW()),
  ('009_dados_origem_e_rastreio', NOW());
