-- Leituras de sensores sem máquina vinculada também precisam ser registradas: id_maquina passa a aceitar NULL.

ALTER TABLE dados DROP FOREIGN KEY fk_dados_maquina_corporacao;
ALTER TABLE dados MODIFY COLUMN id_maquina INT UNSIGNED NULL;
ALTER TABLE dados ADD CONSTRAINT fk_dados_maquina_corporacao FOREIGN KEY (id_maquina, id_corporacao)
  REFERENCES maquina (id_maquina, id_corporacao) ON UPDATE RESTRICT ON DELETE RESTRICT;
