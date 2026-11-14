-- O número de série passa a ser único dentro de cada organização (antes era único no sistema inteiro).

ALTER TABLE maquina DROP INDEX uq_maquina_serial;
ALTER TABLE maquina ADD UNIQUE KEY uq_maquina_corporacao_serial (id_corporacao, num_serial);
