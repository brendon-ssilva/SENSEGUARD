"""Cadastros fictícios; somente INSERT, em uma transação InnoDB."""
from dataclasses import dataclass
from secrets import token_hex, randbelow
from app.database import ALLOWED_DATABASES, inspect_metadata, connect_test_database

ROLES = ('admin', 'supervisor', 'tecnico')

@dataclass(frozen=True)
class Company:
    name: str
    cnpj: str
    email: str

@dataclass(frozen=True)
class User:
    name: str
    email: str
    role: str
    target: int  # índice da nova empresa ou ID da existente, conforme Plan

@dataclass(frozen=True)
class Plan:
    existing: int | None
    companies: tuple[Company, ...]
    users: tuple[User, ...]


def fake_cnpj():
    # Dígitos verificadores deliberadamente inválidos: não representar empresa real.
    base = '00' + f'{randbelow(10**10):010d}'
    def digit(s, weights):
        r = sum(int(n)*w for n,w in zip(s,weights)) % 11
        return 0 if r < 2 else 11-r
    first = digit(base, [5,4,3,2,9,8,7,6,5,4,3,2])
    second = digit(base+str(first), [6,5,4,3,2,9,8,7,6,5,4,3,2])
    return f'{base[:2]}.{base[2:5]}.{base[5:8]}/{base[8:]}-{first}{(second+1)%10}'


def make_plan(existing, company_count, counts):
    if existing is not None and (type(existing) is not int or not 1 <= existing <= 4294967295):
        raise ValueError('Selecione uma organização válida.')
    if type(company_count) is not int or not 1 <= company_count <= 20:
        raise ValueError('Quantidade de empresas: 1 a 20.')
    if set(counts) != set(ROLES) or any(type(n) is not int or not 0 <= n <= 50 for n in counts.values()):
        raise ValueError('Quantidade por perfil: 0 a 50.')
    targets = [existing] if existing is not None else list(range(company_count))
    if len(targets)*sum(counts.values()) > 100:
        raise ValueError('Limite de 100 usuários por operação.')
    if existing is not None and sum(counts.values()) == 0:
        raise ValueError('Informe pelo menos um usuário.')
    batch = token_hex(8)
    companies = []
    used = set()
    if existing is None:
        for i in targets:
            cnpj = fake_cnpj()
            while cnpj in used:
                cnpj = fake_cnpj()
            used.add(cnpj)
            companies.append(Company(f'SG Teste {batch} - {i+1}',cnpj,f'empresa-{batch}-{i+1}@example.test'))
    users = []
    for target in targets:
        for role in ROLES:
            for i in range(counts[role]):
                n = len(users)+1
                users.append(User(f'SG Teste {role} {batch}-{n}',f'{role}-{batch}-{n}@example.test',role,target))
    return Plan(existing,tuple(companies),tuple(users))


def validate_password(password):
    if not isinstance(password,str) or '\0' in password or not 12 <= len(password.encode('utf-8')) <= 72:
        raise ValueError('Senha de teste: 12 a 72 bytes, sem caractere nulo.')


def hash_password(password):
    validate_password(password)
    import bcrypt
    return bcrypt.hashpw(password.encode('utf-8'),bcrypt.gensalt(rounds=12)).decode('ascii')


def open_connection(config, connect):
    return connect_test_database(config, connect)


def check_target(cur, config):
    cur.execute('SELECT DATABASE()')
    name = cur.fetchone()[0]
    if name != config.database or name not in ALLOWED_DATABASES:
        raise ValueError('Banco efetivo diferente do banco de teste autorizado.')


def list_companies(config, connect=None):
    conn = open_connection(config,connect)
    try:
        cur = conn.cursor()
        try:
            cur.execute('START TRANSACTION READ ONLY')
            check_target(cur,config)
            cur.execute('SELECT id_corporacao, nome FROM corporacao ORDER BY id_corporacao')
            return cur.fetchall()
        finally:
            cur.close()
    finally:
        try: conn.rollback()
        finally: conn.close()


def check_structure(cur):
    cur.execute('SELECT TABLE_NAME, TABLE_TYPE, ENGINE FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()')
    tables = {n:(t,e) for n,t,e in cur.fetchall()}
    cur.execute('SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE()')
    columns = {}
    for table,col in cur.fetchall(): columns.setdefault(table,set()).add(col)
    migrations = set()
    if tables.get('migracao',(None,None))[0] == 'BASE TABLE' and 'versao' in columns.get('migracao',set()):
        cur.execute('SELECT versao FROM migracao')
        migrations = {r[0] for r in cur.fetchall()}
    issues = inspect_metadata(tables,columns,migrations)
    if issues: raise ValueError('Estrutura incompatível. Execute novamente o diagnóstico.')
    cur.execute('SELECT @@SESSION.foreign_key_checks')
    if cur.fetchone()[0] != 1: raise ValueError('As chaves estrangeiras devem estar habilitadas.')


class CommitUncertain(RuntimeError):
    pass


def apply_plan(config, plan, password, connect=None, hasher=hash_password):
    config.validate()
    if not plan.companies and not plan.users: raise ValueError('Plano vazio.')
    if len(plan.companies)>20 or len(plan.users)>100: raise ValueError('Plano excede o limite.')
    if plan.existing is None:
        if not plan.companies or any(not 0 <= u.target < len(plan.companies) for u in plan.users): raise ValueError('Destino inválido.')
    elif plan.companies or any(u.target != plan.existing for u in plan.users): raise ValueError('Destino inválido.')
    if any(u.role not in ROLES for u in plan.users): raise ValueError('Perfil inválido.')
    # Hash independente por usuário, antes da transação para reduzir bloqueios.
    if plan.users: validate_password(password)
    hashes = [hasher(password) for _ in plan.users]
    conn = open_connection(config,connect)
    committed = False
    cur = None
    try:
        cur = conn.cursor()
        cur.execute('START TRANSACTION')
        check_target(cur,config)
        check_structure(cur)
        ids = []
        if plan.existing is not None:
            cur.execute('SELECT id_corporacao FROM corporacao WHERE id_corporacao = %s FOR UPDATE',(plan.existing,))
            if cur.fetchone() is None: raise ValueError('Organização não existe mais. Atualize a lista.')
        for c in plan.companies:
            cur.execute('INSERT INTO corporacao (nome, cnpj, email) VALUES (%s, %s, %s)',(c.name,c.cnpj,c.email))
            ids.append(cur.lastrowid)
        user_ids = []
        for u,h in zip(plan.users,hashes):
            corp = plan.existing if plan.existing is not None else ids[u.target]
            cur.execute('INSERT INTO usuario (nome, email, senha, role, status, id_corporacao) VALUES (%s, %s, %s, %s, %s, %s)',(u.name,u.email,h,u.role,'ativo',corp))
            user_ids.append(cur.lastrowid)
        try: conn.commit()
        except Exception as exc: raise CommitUncertain('Confirmação do COMMIT indisponível. Confira o banco antes de repetir.') from exc
        committed = True
        return ids,user_ids
    finally:
        if not committed:
            try: conn.rollback()
            except Exception: pass
        try:
            if cur is not None: cur.close()
        except Exception: pass
        try: conn.close()
        except Exception: pass
