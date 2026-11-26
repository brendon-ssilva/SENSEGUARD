"""Planos de máquinas/sensores fictícios e persistência atômica."""
from dataclasses import dataclass
from datetime import date, timedelta
from secrets import token_hex
from app.generator import open_connection, check_target, check_structure, CommitUncertain

# Exemplos sintéticos, não limites técnicos de equipamentos reais.
PROFILES = {
    'temperatura': ('TMP', '°C', 20, 85),
    'vibracao': ('VIB', 'mm/s', 0, 7),
    'pressao': ('PRS', 'bar', 2, 10),
    'corrente': ('AMP', 'A', 0, 30),
    'umidade': ('UMD', '%', 20, 80),
    'rpm': ('RPM', 'rpm', 500, 1800),
}
MACHINE_TYPES = ('Compressor', 'Motor elétrico', 'Bomba centrífuga', 'Ventilador industrial', 'Transportador', 'Redutor')

@dataclass(frozen=True)
class Machine:
    name: str
    serial: str
    model: str
    location: str
    installed: date
    maintenance: date
    next_maintenance: date

@dataclass(frozen=True)
class Sensor:
    name: str
    kind: str
    target: int  # índice da máquina nova ou ID da existente

@dataclass(frozen=True)
class AssetPlan:
    company: int
    existing: int | None
    machines: tuple[Machine, ...]
    sensors: tuple[Sensor, ...]


def valid_id(n):
    return type(n) is int and 1 <= n <= 4294967295


def make_asset_plan(company, existing, machine_count, machine_type, counts, today=None):
    if not valid_id(company) or (existing is not None and not valid_id(existing)):
        raise ValueError('Selecione uma organização e um destino válidos.')
    if machine_type not in MACHINE_TYPES: raise ValueError('Tipo de máquina inválido.')
    if type(machine_count) is not int or not 1 <= machine_count <= 20:
        raise ValueError('Quantidade de máquinas: 1 a 20.')
    if set(counts) != set(PROFILES) or any(type(v) is not int or not 0 <= v <= 10 for v in counts.values()):
        raise ValueError('Quantidade por tipo de sensor: 0 a 10.')
    targets = [existing] if existing is not None else list(range(machine_count))
    if len(targets)*sum(counts.values()) > 120: raise ValueError('Limite de 120 sensores por lote.')
    if existing is not None and not sum(counts.values()): raise ValueError('Selecione ao menos um sensor.')
    today = today or date.today()
    batch = token_hex(8)
    machines = tuple(Machine(f'SG Teste {machine_type} {batch}-{i+1}',f'SG-{batch}-{i+1:02d}',f'SIM-{machine_type}',f'Galpão Teste {i+1}',today-timedelta(days=365),today-timedelta(days=30),today+timedelta(days=60)) for i in targets) if existing is None else ()
    sensors=[]
    for target in targets:
        for kind, count in counts.items():
            for _ in range(count):
                sensors.append(Sensor(f'{PROFILES[kind][0]}-SG-{batch}-{len(sensors)+1:03d}',kind,target))
    return AssetPlan(company,existing,machines,tuple(sensors))


def list_machines(config, company, connect=None):
    if not valid_id(company): raise ValueError('Organização inválida.')
    conn=open_connection(config,connect)
    try:
        cur=conn.cursor()
        try:
            cur.execute('START TRANSACTION READ ONLY'); check_target(cur,config)
            cur.execute('SELECT id_maquina, nome FROM maquina WHERE id_corporacao = %s ORDER BY id_maquina',(company,))
            return cur.fetchall()
        finally: cur.close()
    finally:
        try: conn.rollback()
        finally: conn.close()


def validate_plan(plan):
    if not valid_id(plan.company) or (plan.existing is not None and not valid_id(plan.existing)):
        raise ValueError('Destino inválido.')
    if not plan.machines and not plan.sensors: raise ValueError('Plano vazio.')
    if len(plan.machines)>20 or len(plan.sensors)>120: raise ValueError('Limite de lote excedido.')
    if plan.existing is None:
        if not plan.machines or any(type(s.target) is not int or not 0 <= s.target < len(plan.machines) for s in plan.sensors): raise ValueError('Vínculo inválido.')
    elif plan.machines or any(s.target != plan.existing for s in plan.sensors): raise ValueError('Vínculo inválido.')
    if any(s.kind not in PROFILES or not 1 <= len(s.name)<=50 for s in plan.sensors): raise ValueError('Sensor inválido.')
    if len({m.serial for m in plan.machines})!=len(plan.machines) or len({s.name for s in plan.sensors})!=len(plan.sensors): raise ValueError('Nomes ou séries repetidos no lote.')


def apply_assets(config, plan, connect=None):
    validate_plan(plan)
    conn=open_connection(config,connect)
    cur=None; committed=False
    try:
        cur=conn.cursor(); cur.execute('START TRANSACTION'); check_target(cur,config); check_structure(cur)
        cur.execute('SELECT id_corporacao FROM corporacao WHERE id_corporacao = %s FOR UPDATE',(plan.company,))
        if cur.fetchone() is None: raise ValueError('Organização não existe mais.')
        if plan.existing is not None:
            cur.execute('SELECT id_maquina FROM maquina WHERE id_maquina = %s AND id_corporacao = %s FOR UPDATE',(plan.existing,plan.company))
            if cur.fetchone() is None: raise ValueError('Máquina não pertence à organização ou foi removida.')
        machine_ids=[]; sensor_ids=[]
        for m in plan.machines:
            cur.execute('INSERT INTO maquina (nome,num_serial,modelo,fabricante,localizacao,departamento,status,data_instalacao,ultima_manutencao,proxima_manutencao,id_corporacao) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',(m.name,m.serial,m.model,'Fabricante fictício',m.location,'Manutenção','operando',m.installed,m.maintenance,m.next_maintenance,plan.company))
            machine_ids.append(cur.lastrowid)
        for s in plan.sensors:
            _,unit,lo,hi=PROFILES[s.kind]
            machine=plan.existing if plan.existing is not None else machine_ids[s.target]
            cur.execute('INSERT INTO sensor (nome,tipo,unidade,min_limite,max_limite,valor_atual,status,ultima_leitura,id_maquina,id_corporacao) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',(s.name,s.kind,unit,lo,hi,0,'offline',None,machine,plan.company))
            sensor_ids.append(cur.lastrowid)
        try: conn.commit()
        except Exception as exc: raise CommitUncertain('Confirmação do COMMIT indisponível. Confira o banco antes de repetir.') from exc
        committed=True
        return machine_ids,sensor_ids
    finally:
        if not committed:
            try: conn.rollback()
            except Exception: pass
        try:
            if cur is not None: cur.close()
        except Exception: pass
        try: conn.close()
        except Exception: pass
