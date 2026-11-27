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
