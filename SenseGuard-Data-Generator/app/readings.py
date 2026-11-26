"""Histórico sintético, separado da ingestão HTTP. Nenhuma mudança de schema."""
from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from random import Random
from app.assets import PROFILES, valid_id
from app.generator import open_connection, check_target, check_structure, CommitUncertain

STEP = Decimal('0.0001')  # precisão do valor atual do sensor
MAX_VALUE = Decimal('1000000000')
MAX_BATCH = 5000

@dataclass(frozen=True)
class SensorInfo:
    id: int
    name: str
    kind: str
    unit: str | None
    low: Decimal
    high: Decimal
    machine: int | None

@dataclass(frozen=True)
class Reading:
    sensor: int
    at: datetime
    value: Decimal

@dataclass(frozen=True)
class ReadingPlan:
    company: int
    sensors: tuple[SensorInfo, ...]
    rows: tuple[Reading, ...]


def status(value, low, high):
    return 'alerta' if value < low or value > high else 'online'


def sensor_info(row):
    i, name, kind, unit, lo, hi, machine = row[:7]
    return SensorInfo(int(i), name, kind, unit, Decimal(str(lo)), Decimal(str(hi)), machine)


def validate_sensor(s):
    if not valid_id(s.id) or s.kind not in PROFILES or (s.machine is not None and not valid_id(s.machine)):
        raise ValueError('Sensor ou vínculo inválido.')
    if not all(isinstance(v, Decimal) and v.is_finite() and abs(v)<=MAX_VALUE and v==v.quantize(STEP) for v in (s.low,s.high)) or s.low > s.high:
        raise ValueError(f'Limites incompatíveis para o sensor {s.id}.')


def list_sensors(config, company, connect=None):
    if not valid_id(company): raise ValueError('Selecione uma organização válida.')
    conn=open_connection(config,connect)
    try:
        cur=conn.cursor()
        try:
            cur.execute('START TRANSACTION READ ONLY'); check_target(cur,config)
            cur.execute('SELECT NOW()'); now=cur.fetchone()[0]
            cur.execute('SELECT id_sensor,nome,tipo,unidade,min_limite,max_limite,id_maquina FROM sensor WHERE id_corporacao = %s ORDER BY id_sensor',(company,))
            return now, tuple(sensor_info(r) for r in cur.fetchall())
        finally: cur.close()
    finally:
        try: conn.rollback()
        finally: conn.close()


def make_reading_plan(company, sensors, count, interval, alert_percent, end, rng=None):
    sensors=tuple(sorted(sensors,key=lambda s:s.id))
    if not valid_id(company) or not sensors or len({s.id for s in sensors})!=len(sensors): raise ValueError('Selecione uma organização e sensores distintos.')
    if type(count) is not int or not 1<=count<=1000: raise ValueError('Leituras por sensor: 1 a 1000.')
    if type(interval) is not int or not 1<=interval<=1440: raise ValueError('Intervalo em minutos: 1 a 1440.')
    if type(alert_percent) is not int or not 0<=alert_percent<=100: raise ValueError('Percentual de alertas: 0 a 100.')
    total=len(sensors)*count
    if total>MAX_BATCH or (count-1)*interval>90*1440: raise ValueError('Máximo de 5000 leituras por lote e 90 dias de histórico.')
    if not isinstance(end,datetime) or end.tzinfo is not None: raise ValueError('Data final inválida (horário local do banco).')
    end=end.replace(microsecond=0)
    rng=rng or Random()
    alerts=set(rng.sample(range(total), (total*alert_percent+50)//100))
    rows=[]
    for s in sensors:
        validate_sensor(s)
        span=s.high-s.low
        for i in range(count):
            if len(rows) in alerts:
                delta=max(STEP,(span*Decimal('0.1')).quantize(STEP,rounding=ROUND_HALF_UP))
                candidates=[v for v in (s.high+delta,s.low-delta) if -MAX_VALUE<=v<=MAX_VALUE]
                # Preferir não produzir valores negativos quando o limite mínimo for não negativo.
                positive=[v for v in candidates if v>=0]
                if s.low>=0 and positive: candidates=positive
                if not candidates: raise ValueError(f'Sem valor de alerta representável para sensor {s.id}.')
                value=rng.choice(candidates)
            else:
                fraction=Decimal(rng.randint(1500,8500))/10000
                value=(s.low+span*fraction).quantize(STEP,rounding=ROUND_HALF_UP)
            rows.append(Reading(s.id,end-timedelta(minutes=(count-1-i)*interval),value))
    plan=ReadingPlan(company,sensors,tuple(rows)); validate_plan(plan); return plan


def validate_plan(plan):
    if not valid_id(plan.company) or not plan.sensors or not 1<=len(plan.rows)<=MAX_BATCH: raise ValueError('Plano inválido.')
    by_id={s.id:s for s in plan.sensors}
    if len(by_id)!=len(plan.sensors): raise ValueError('Sensores repetidos.')
    for s in plan.sensors: validate_sensor(s)
    keys=set(); per_sensor={}
    for row in plan.rows:
        if row.sensor not in by_id or not isinstance(row.at,datetime) or row.at.tzinfo is not None or row.at.microsecond or not isinstance(row.value,Decimal) or not row.value.is_finite() or abs(row.value)>MAX_VALUE or row.value!=row.value.quantize(STEP): raise ValueError('Leitura inválida.')
        key=(row.sensor,row.at)
        if key in keys: raise ValueError('Horários repetidos no lote.')
        keys.add(key); per_sensor[row.sensor]=per_sensor.get(row.sensor,0)+1
    if set(per_sensor)!=set(by_id) or max(per_sensor.values())>1000 or max(r.at for r in plan.rows)-min(r.at for r in plan.rows)>timedelta(days=90): raise ValueError('Quantidade ou período inválido.')


def apply_readings(config, plan, connect=None):
    validate_plan(plan)
    conn=open_connection(config,connect); cur=None; committed=False
    try:
        cur=conn.cursor(); cur.execute('START TRANSACTION'); check_target(cur,config); check_structure(cur)
        cur.execute('SELECT NOW()'); now=cur.fetchone()[0]
        if any(r.at>now for r in plan.rows): raise ValueError('O lote contém datas futuras no relógio do banco.')
        cur.execute('SELECT id_corporacao FROM corporacao WHERE id_corporacao = %s FOR UPDATE',(plan.company,))
        if cur.fetchone() is None: raise ValueError('Organização não existe mais.')
        grouped={s.id:[] for s in plan.sensors}
        for row in plan.rows: grouped[row.sensor].append(row)
        updated=0; alerts=0
        for s in sorted(plan.sensors,key=lambda s:s.id):
            cur.execute('SELECT id_sensor,nome,tipo,unidade,min_limite,max_limite,id_maquina,ultima_leitura FROM sensor WHERE id_sensor = %s AND id_corporacao = %s FOR UPDATE',(s.id,plan.company))
            current=cur.fetchone()
            if current is None or sensor_info(current)!=s: raise ValueError('Sensor alterado ou removido. Atualize a lista e gere outra prévia.')
            rows=sorted(grouped[s.id],key=lambda r:r.at)
            cur.execute('SELECT data_hora FROM dados WHERE id_sensor = %s AND id_corporacao = %s AND data_hora BETWEEN %s AND %s',(s.id,plan.company,rows[0].at,rows[-1].at))
            existing={r[0] for r in cur.fetchall()}
            if any(r.at in existing for r in rows): raise ValueError(f'Já existe leitura no horário planejado para sensor {s.id}. Nenhum dado novo gravado neste lote.')
            for r in rows:
                cur.execute('INSERT INTO dados (tipo_medida,valor,data_hora,id_maquina,id_sensor,id_corporacao,origem,id_usuario,id_importacao) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)',(s.kind,r.value,r.at,s.machine,s.id,plan.company,'importacao',None,None))
                alerts+=status(r.value,s.low,s.high)=='alerta'
            last=rows[-1]; previous=current[7]
            if previous is None or last.at>=previous:
                cur.execute('UPDATE sensor SET valor_atual = %s, status = %s, ultima_leitura = %s WHERE id_sensor = %s AND id_corporacao = %s',(last.value,status(last.value,s.low,s.high),last.at,s.id,plan.company)); updated+=1
        try: conn.commit()
        except Exception as exc: raise CommitUncertain('Confirmação do COMMIT indisponível. Confira o banco antes de repetir.') from exc
        committed=True
        return len(plan.rows),alerts,updated
    finally:
        if not committed:
            try: conn.rollback()
            except Exception: pass
        try:
            if cur is not None: cur.close()
        except Exception: pass
        try: conn.close()
        except Exception: pass
