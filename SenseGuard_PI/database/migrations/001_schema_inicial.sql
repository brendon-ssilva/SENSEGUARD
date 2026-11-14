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
