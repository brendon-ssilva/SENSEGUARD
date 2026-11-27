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
