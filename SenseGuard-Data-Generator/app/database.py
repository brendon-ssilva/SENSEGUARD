"""Diagnóstico somente leitura do banco de homologação."""
from dataclasses import dataclass, field
from pathlib import PurePath
from traceback import extract_tb

REQUIRED = {
    'corporacao': 'id_corporacao nome cnpj email data_criacao',
    'usuario': 'id_usuario nome email senha telefone role status data_criacao id_corporacao',
    'maquina': 'id_maquina nome num_serial modelo fabricante localizacao departamento status data_instalacao ultima_manutencao proxima_manutencao id_corporacao',
    'sensor': 'id_sensor nome tipo unidade localizacao min_limite max_limite valor_atual status ultima_leitura id_maquina id_corporacao',
    'dados': 'id_medida tipo_medida valor data_hora id_maquina id_sensor id_corporacao origem id_importacao recebido_em anulada_em id_usuario',
    'ordem_servico': 'id_os codigo_os titulo descricao tipo prioridade status horas_estimadas data_prevista data_abertura data_encerramento id_maquina id_responsavel id_criador id_corporacao',
    'migracao': 'versao executada_em',
    'token_dispositivo': 'id_token id_corporacao nome token_hash ativo criado_em ultimo_uso permissoes ips_permitidos revogado_em',
}
MIGRATIONS = {
    '001_schema_inicial', '002_seguranca_e_auditoria',
    '003_usuario_sem_permissao_e_cpf', '004_ordem_servico_responsavel_criador',
    '005_dados_maquina_opcional', '006_restricoes_de_dominio',
    '007_serial_unico_por_corporacao', '008_views_relatorios',
    '009_dados_origem_e_rastreio', '010_token_permissoes_e_ips',
}
VIEWS = {'vw_sg_indicadores', 'vw_sg_maquinas_sensores', 'vw_sg_ordens_detalhadas'}
COUNT_TABLES = ('corporacao', 'usuario', 'maquina', 'sensor', 'dados', 'ordem_servico')
ALLOWED_DATABASES = {'senseguard_teste', 'senseguard_homologacao'}

@dataclass(frozen=True)
class Config:
    host: str
    port: int
    database: str
    user: str
    password: str = field(repr=False)

    def validate(self):
        if self.host not in {'localhost', '127.0.0.1', '::1'}:
            raise ValueError('Nesta etapa, somente conexões locais são permitidas.')
        if self.database not in ALLOWED_DATABASES:
            raise ValueError('Selecione senseguard_teste ou senseguard_homologacao.')
        if not 1 <= self.port <= 65535:
            raise ValueError('Porta inválida (1 a 65535).')
        if not self.user.strip():
            raise ValueError('Informe o usuário do banco.')

@dataclass
class Diagnostic:
    database: str
    version: str
    issues: list[str]
    migrations: int
    views: int
    counts: dict[str, int]


def inspect_metadata(tables, columns, migrations):
    """Valida presença, tipo de objeto e engine; não é auditoria completa de constraints."""
    issues = []
    for table, required in REQUIRED.items():
        obj = tables.get(table)
        if obj is None:
            issues.append(f'Tabela ausente: {table}')
            continue
        if obj[0] != 'BASE TABLE' or (obj[1] or '').lower() != 'innodb':
            issues.append(f'Objeto incompatível (esperado InnoDB): {table}')
        missing = set(required.split()) - columns.get(table, set())
        if missing:
            issues.append(f'{table}: colunas ausentes: {", ".join(sorted(missing))}')
    for name in sorted(MIGRATIONS - migrations):
        issues.append(f'Migração ausente: {name}')
    for name in sorted(VIEWS):
        if tables.get(name, (None, None))[0] != 'VIEW':
            issues.append(f'View ausente ou incompatível: {name}')
    return issues


def connect_test_database(config, connect=None):
    """Use the pure Python connector consistently, including frozen Windows builds."""
    config.validate()
    if connect is None:
        from mysql.connector import connect
    return connect(host=config.host, port=config.port, database=config.database,
                   user=config.user, password=config.password, connection_timeout=5,
                   autocommit=False, charset='utf8mb4', use_pure=True)


def diagnostic_error(exc):
    """Expose stack locations only, not exception text, SQL or local variables."""
    code = getattr(exc, 'errno', None)
    details = {1045: 'Acesso negado. Confira usuário e senha.',
               1049: 'Banco não encontrado.',
               2003: 'Servidor indisponível. Confira MySQL no XAMPP e a porta.'}
    if isinstance(code, int) and code in details:
        return details[code]
    frames = extract_tb(exc.__traceback__)[-6:]
    locations = '\n'.join(f'{PurePath(f.filename).name}:{f.lineno} — {f.name}' for f in frames)
    safe_code = code if isinstance(code, int) else 'não disponível'
    return (f'Falha no diagnóstico ({type(exc).__name__}; código {safe_code}).'
            '\nPontos de falha (sem credenciais):\n' + locations)


def diagnose(config, connect=None):
    conn = connect_test_database(config, connect)
    cursor = None
    try:
        cursor = conn.cursor()
        cursor.execute('START TRANSACTION READ ONLY')
        cursor.execute('SELECT DATABASE(), VERSION()')
        database, version = cursor.fetchone()
        if database != config.database or database not in ALLOWED_DATABASES:
            raise ValueError('O banco efetivo não corresponde ao banco de teste selecionado.')
        cursor.execute('SELECT TABLE_NAME, TABLE_TYPE, ENGINE FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()')
        tables = {name: (kind, engine) for name, kind, engine in cursor.fetchall()}
        cursor.execute('SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE()')
        columns = {}
        for name, col in cursor.fetchall():
            columns.setdefault(name, set()).add(col)
        migrations = set()
        if tables.get('migracao', (None, None))[0] == 'BASE TABLE' and 'versao' in columns.get('migracao', set()):
            cursor.execute('SELECT versao FROM migracao')
            migrations = {row[0] for row in cursor.fetchall()}
        issues = inspect_metadata(tables, columns, migrations)
        counts = {}
        if not issues:
            for table in COUNT_TABLES:  # identificadores fixos, nunca fornecidos pelo usuário
                cursor.execute(f'SELECT COUNT(*) FROM `{table}`')
                counts[table] = int(cursor.fetchone()[0])
        return Diagnostic(database, version, issues, len(MIGRATIONS & migrations),
                          sum(tables.get(v, (None, None))[0] == 'VIEW' for v in VIEWS), counts)
    finally:
        try:
            if cursor is not None:
                cursor.close()
        finally:
            try:
                conn.rollback()
            finally:
                conn.close()
