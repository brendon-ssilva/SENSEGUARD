"""Ordens sintéticas, com prévia imutável e gravação atômica."""
from dataclasses import dataclass
from datetime import datetime, timedelta
from secrets import token_hex
from app.assets import valid_id
from app.generator import open_connection, check_target, check_structure, CommitUncertain

TYPES=('preventiva','preditiva','corretiva')
PRIORITIES=('baixa','media','alta','critica')
STATUSES=('aberta','em_andamento','concluida','cancelada')
MIXED='variado'
TASKS={'preventiva':'Inspeção periódica e lubrificação', 'preditiva':'Análise de vibração e tendência', 'corretiva':'Diagnóstico e reparo simulado'}

@dataclass(frozen=True)
class Order:
    machine: int
    title: str
    description: str
    kind: str
    priority: str
    status: str
    hours: int
    days: int

@dataclass(frozen=True)
class OrderPlan:
    company: int
    creator: int
    responsible: int
    orders: tuple[Order,...]


def make_order_plan(company, machines, creator, responsible, per_machine, kind=MIXED, priority=MIXED, status=MIXED):
    if not all(valid_id(x) for x in (company,creator,responsible)): raise ValueError('Organização, criador e responsável são obrigatórios.')
    machines=tuple(machines)
    if not machines or not all(valid_id(x) for x in machines) or len(set(machines))!=len(machines): raise ValueError('Selecione máquinas distintas e válidas.')
    if type(per_machine) is not int or not 1<=per_machine<=20 or len(machines)*per_machine>100: raise ValueError('Limite: 1 a 20 OS por máquina e 100 por lote.')
    if kind not in (*TYPES,MIXED) or priority not in (*PRIORITIES,MIXED) or status not in (*STATUSES,MIXED): raise ValueError('Tipo, prioridade ou status inválido.')
    batch=token_hex(8); orders=[]
    for machine in machines:
        for _ in range(per_machine):
            i=len(orders); t=TYPES[i%3] if kind==MIXED else kind; p=PRIORITIES[i%4] if priority==MIXED else priority; s=STATUSES[i%4] if status==MIXED else status
            orders.append(Order(machine,f'SG Teste {t} {batch}-{i+1:03d}',f'DADOS FICTÍCIOS — {TASKS[t]}. Lote {batch}.',t,p,s,(2,4,6,8)[i%4],0 if s=='concluida' else 1+i%7))
    plan=OrderPlan(company,creator,responsible,tuple(orders)); validate_plan(plan); return plan


def validate_plan(plan):
    if not all(valid_id(x) for x in (plan.company,plan.creator,plan.responsible)): raise ValueError('Destino inválido.')
    if not 1<=len(plan.orders)<=100: raise ValueError('Lote vazio ou acima de 100 OS.')
    for o in plan.orders:
        if not valid_id(o.machine) or o.kind not in TYPES or o.priority not in PRIORITIES or o.status not in STATUSES: raise ValueError('Ordem inválida.')
        if not 1<=len(o.title)<=150 or not 1<=len(o.description)<=15000 or type(o.hours) is not int or not 0<=o.hours<=100000 or type(o.days) is not int or not 0<=o.days<=90: raise ValueError('Campos da ordem inválidos.')
    if len({o.title for o in plan.orders})!=len(plan.orders): raise ValueError('Ordens repetidas no lote.')


def list_targets(config,company,connect=None):
    if not valid_id(company): raise ValueError('Organização inválida.')
    conn=open_connection(config,connect)
    try:
        cur=conn.cursor()
        try:
            cur.execute('START TRANSACTION READ ONLY'); check_target(cur,config)
            cur.execute('SELECT id_maquina,nome FROM maquina WHERE id_corporacao=%s ORDER BY id_maquina',(company,)); machines=cur.fetchall()
            cur.execute("SELECT id_usuario,nome,role FROM usuario WHERE id_corporacao=%s AND status='ativo' AND role IN ('admin','supervisor','tecnico') ORDER BY id_usuario",(company,)); users=cur.fetchall()
            return machines,users
        finally: cur.close()
    finally:
        try: conn.rollback()
        finally: conn.close()


def apply_orders(config,plan,connect=None):
    validate_plan(plan); conn=open_connection(config,connect); cur=None; committed=False
    try:
        cur=conn.cursor(); cur.execute('START TRANSACTION'); check_target(cur,config); check_structure(cur)
        cur.execute('SELECT id_corporacao FROM corporacao WHERE id_corporacao=%s FOR UPDATE',(plan.company,))
        if cur.fetchone() is None: raise ValueError('Organização não existe mais.')
        for mid in sorted({o.machine for o in plan.orders}):
            cur.execute('SELECT id_maquina FROM maquina WHERE id_maquina=%s AND id_corporacao=%s FOR UPDATE',(mid,plan.company))
            if cur.fetchone() is None: raise ValueError('Máquina removida ou de outra organização.')
        for uid in sorted({plan.creator,plan.responsible}):
            cur.execute("SELECT role FROM usuario WHERE id_usuario=%s AND id_corporacao=%s AND status='ativo' FOR UPDATE",(uid,plan.company)); row=cur.fetchone()
            if row is None or row[0] not in ('admin','supervisor','tecnico') or (uid==plan.creator and row[0] not in ('admin','supervisor')): raise ValueError('Usuário inativo, inexistente, de outra organização ou criador sem perfil adequado.')
        cur.execute('SELECT NOW()'); now=cur.fetchone()[0]
        if not isinstance(now,datetime): raise ValueError('Data do servidor inválida.')
        result=[]
        for o in plan.orders:
            cur.execute('INSERT INTO ordem_servico (titulo,descricao,tipo,prioridade,status,horas_estimadas,data_prevista,data_abertura,data_encerramento,id_maquina,id_responsavel,id_criador,id_corporacao) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',(o.title,o.description,o.kind,o.priority,o.status,o.hours,now.date()+timedelta(days=o.days),now,now if o.status=='concluida' else None,o.machine,plan.responsible,plan.creator,plan.company))
            oid=cur.lastrowid; code=f'OS-{now.year}-{oid:05d}'
            cur.execute('UPDATE ordem_servico SET codigo_os=%s WHERE id_os=%s AND id_corporacao=%s',(code,oid,plan.company)); result.append((oid,code))
        try: conn.commit()
        except Exception as exc: raise CommitUncertain('Confirmação do COMMIT indisponível. Confira o banco antes de repetir.') from exc
        committed=True; return result
    finally:
        if not committed:
            try: conn.rollback()
            except Exception: pass
        try:
            if cur is not None: cur.close()
        except Exception: pass
        try: conn.close()
        except Exception: pass
