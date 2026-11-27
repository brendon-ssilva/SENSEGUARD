-- Tokens com permissões e origem restrita:
--   permissoes       lista separada por vírgula: readings:write, sensors:read, imports:write, imports:read, imports:cancel
--                    (os tokens existentes continuam só com readings:write)
--   ips_permitidos   IPs ou faixas CIDR separados por vírgula; vazio = qualquer origem (camada extra, não substitui o token)
--   revogado_em      quando o token foi revogado (ativo passa a 0)

ALTER TABLE token_dispositivo ADD COLUMN permissoes VARCHAR(255) NOT NULL DEFAULT 'readings:write';
ALTER TABLE token_dispositivo ADD COLUMN ips_permitidos VARCHAR(500) NULL;
ALTER TABLE token_dispositivo ADD COLUMN revogado_em DATETIME NULL;
