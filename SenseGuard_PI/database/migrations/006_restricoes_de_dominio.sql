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
