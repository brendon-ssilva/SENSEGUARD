-- SenseGuard — Views exclusivamente de leitura para relatórios.
-- Importe somente depois de conferir o banco de destino e a estrutura atualizada.
-- Não modifica tabelas nem dados. A execução requer permissão CREATE VIEW.
-- IMPORTANTE: as Views não aplicam autorização por usuário. Ao consultá-las
-- pela aplicação, filtre por id_corporacao obtido da sessão autenticada.

-- Sem USE: o banco de destino deve ser selecionado explicitamente no phpMyAdmin.
-- Para testar, selecione exclusivamente senseguard_teste.
-- Antes da importacao, execute SELECT DATABASE(); e confira senseguard_teste.

-- 1. Uma linha por máquina, inclusive máquinas sem sensor vinculado.
-- O LEFT JOIN usa a chave composta para não misturar organizações.
CREATE OR REPLACE VIEW vw_sg_maquinas_sensores AS
SELECT
    m.id_corporacao,
    m.id_maquina,
    m.nome AS maquina,
    m.modelo,
    m.localizacao,
    m.departamento,
    m.status AS status_maquina,
    m.proxima_manutencao,
    COUNT(s.id_sensor) AS total_sensores,
    SUM(CASE WHEN s.status = 'online' THEN 1 ELSE 0 END) AS sensores_online,
    SUM(CASE WHEN s.status = 'alerta' THEN 1 ELSE 0 END) AS sensores_alerta,
    SUM(CASE WHEN s.status = 'offline' THEN 1 ELSE 0 END) AS sensores_offline
FROM maquina AS m
LEFT JOIN sensor AS s
    ON s.id_maquina = m.id_maquina
   AND s.id_corporacao = m.id_corporacao
GROUP BY
    m.id_corporacao, m.id_maquina, m.nome, m.modelo, m.localizacao,
    m.departamento, m.status, m.proxima_manutencao;

-- 2. Uma linha por ordem. As chaves associam a OS à máquina e ao responsável
-- da mesma organização, sem multiplicar resultados.
CREATE OR REPLACE VIEW vw_sg_ordens_detalhadas AS
SELECT
    os.id_corporacao,
    os.id_os,
    os.codigo_os,
    os.titulo,
    os.descricao,
    os.tipo,
    os.prioridade,
    os.status,
    os.horas_estimadas,
    os.data_prevista,
    os.data_abertura,
    os.data_encerramento,
    os.id_maquina,
    m.nome AS maquina,
    m.localizacao AS localizacao_maquina,
    os.id_responsavel AS id_responsavel,
    u.nome AS responsavel
FROM ordem_servico AS os
INNER JOIN maquina AS m
    ON m.id_maquina = os.id_maquina
   AND m.id_corporacao = os.id_corporacao
INNER JOIN usuario AS u
    ON u.id_usuario = os.id_responsavel
   AND u.id_corporacao = os.id_corporacao;

-- 3. Resumo por organização. SubSELECTs independentes evitam multiplicação
-- de contagens ao juntar máquinas, sensores e ordens na mesma consulta.
-- "Concluídas" considera todo o histórico, como o Dashboard atual.
CREATE OR REPLACE VIEW vw_sg_indicadores AS
SELECT
    c.id_corporacao,
    c.nome AS corporacao,
    (SELECT COUNT(*) FROM maquina AS m
     WHERE m.id_corporacao = c.id_corporacao) AS total_maquinas,
    (SELECT COUNT(*) FROM maquina AS m
     WHERE m.id_corporacao = c.id_corporacao
       AND m.status <> 'inativo') AS maquinas_ativas,
    (SELECT COUNT(*) FROM sensor AS s
     WHERE s.id_corporacao = c.id_corporacao) AS total_sensores,
    (SELECT COUNT(*) FROM sensor AS s
     WHERE s.id_corporacao = c.id_corporacao
       AND s.status = 'online') AS sensores_online,
    (SELECT COUNT(*) FROM ordem_servico AS os
     WHERE os.id_corporacao = c.id_corporacao
       AND os.status IN ('aberta', 'em_andamento')) AS os_abertas,
    (SELECT COUNT(*) FROM ordem_servico AS os
     WHERE os.id_corporacao = c.id_corporacao
       AND os.status = 'concluida') AS os_concluidas
FROM corporacao AS c;
