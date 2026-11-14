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
