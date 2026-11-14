-- SOMENTE PARA DESENVOLVIMENTO/DEMONSTRAÇÃO. Não importe em produção.
-- Cria o administrador de teste (senha: SenseGuard@123) na organização 1.
-- Em produção use: php bin/criar-admin.php --nome="..." --email="..."

INSERT INTO usuario (nome, email, senha, telefone, role, status, id_corporacao)
SELECT 'Administrador de Teste', 'admin.teste@senseguard.local',
       '$2y$12$FW0S.cQJWIYa.fixYV54T.KsNw2zLeDPX7at7IhNyZjfdl6hZMaOu',
       NULL, 'admin', 'ativo', c.id_corporacao
FROM corporacao c
WHERE c.id_corporacao = 1
  AND NOT EXISTS (SELECT 1 FROM usuario u WHERE u.email = 'admin.teste@senseguard.local');
