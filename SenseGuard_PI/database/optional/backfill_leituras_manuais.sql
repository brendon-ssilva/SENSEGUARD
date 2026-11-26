-- OPCIONAL (não é executado pelo migrate.php). Rode UMA vez, depois da migração 008 e com backup.
--
-- Valores digitados no painel antes da versão 3.1 não deixaram histórico em "dados". Este script cria uma
-- leitura de origem "manual" para cada sensor cujo valor atual (com data de leitura) não tem leitura
-- correspondente, para que o desfazer de uma importação futura sempre tenha um valor anterior para onde voltar.
-- Não há como saber quem digitou: id_usuario fica vazio.

INSERT INTO dados (tipo_medida, valor, data_hora, id_maquina, id_sensor, id_corporacao, origem, recebido_em)
SELECT s.tipo, s.valor_atual, s.ultima_leitura, s.id_maquina, s.id_sensor, s.id_corporacao, 'manual', NOW()
FROM sensor s
WHERE s.ultima_leitura IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM dados d
    WHERE d.id_sensor = s.id_sensor AND d.data_hora = s.ultima_leitura AND d.valor = s.valor_atual
  );
