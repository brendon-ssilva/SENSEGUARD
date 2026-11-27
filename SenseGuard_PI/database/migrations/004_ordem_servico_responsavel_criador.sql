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
