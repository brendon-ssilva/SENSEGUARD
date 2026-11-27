"""Local operational journal. No SQL, credentials, names or raw exception text."""
import csv
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from queue import Queue
from threading import Lock
from uuid import uuid4
from app.generator import CommitUncertain

FIELDS = ('timestamp_utc','operation_id','operation','database','company_id','session_id','cycle','state','companies','users','machines','sensors','readings','alerts','updated','orders','company_ids','user_ids','machine_ids','sensor_ids','order_ids','error_code')
OPS = {'cadastros','ativos','historico','ciclo_simulacao','sessao_simulacao','ordens'}
COUNTS = {'companies','users','machines','sensors','readings','alerts','updated','orders'}
IDS = {'company_ids','user_ids','machine_ids','sensor_ids','order_ids'}
WARNINGS = Queue()

def default_directory():
    return Path(os.environ.get('LOCALAPPDATA') or Path.home()/'.local'/'share')/'SenseGuardDataGenerator'/'logs'

class Journal:
    def __init__(self, directory=None):
        self.directory = Path(directory) if directory is not None else default_directory()
        self.path = self.directory / f'activity-{uuid4().hex}.jsonl'
        self.lock = Lock()

    def append(self, operation, config, company, operation_id, state, *, session=None, cycle=None, metrics=None, error=None):
        config.validate()
        if operation not in OPS or state not in {'INICIADO','CONFIRMADO','FALHA','COMMIT_INCERTO','CONCLUIDO','INTERROMPIDO'}:
            raise ValueError('Evento inválido.')
        event = dict(timestamp_utc=datetime.now(timezone.utc).isoformat(timespec='milliseconds'), operation_id=operation_id, operation=operation, database=config.database, company_id=company, session_id=session, cycle=cycle, state=state)
        for key,value in (metrics or {}).items():
            if key in COUNTS and type(value) is int and value >= 0: event[key]=value
            elif key in IDS and isinstance(value,(list,tuple)) and all(type(i) is int and i > 0 for i in value): event[key]=','.join(map(str,value))
            else: raise ValueError('Métrica inválida.')
        if error is not None:
            errno=getattr(error,'errno',None)
            event['error_code']=errno if type(errno) is int else ('COMMIT_INCERTO' if isinstance(error,CommitUncertain) else 'FALHA_OPERACAO')
        with self.lock:
            self.directory.mkdir(parents=True,exist_ok=True)
            with self.path.open('a',encoding='utf-8',newline='\n') as f:
                f.write(json.dumps(event,ensure_ascii=False,separators=(',',':'))+'\n'); f.flush(); os.fsync(f.fileno())

    def events(self):
        rows=[]
        with self.lock:
            for path in sorted(self.directory.glob('activity-*.jsonl')):
                with path.open(encoding='utf-8') as f:
                    for line in f:
                        try: row=json.loads(line)
                        except json.JSONDecodeError as exc: raise ValueError('Log incompleto ou corrompido; confira os arquivos originais.') from exc
                        if not isinstance(row,dict): raise ValueError('Log inválido.')
                        rows.append({key:row.get(key) for key in FIELDS})
        return sorted(rows,key=lambda r: str(r['timestamp_utc']))

    def export(self, destination):
        rows=self.events()
        # Exclusive creation avoids accidental overwrite. Prefix untrusted spreadsheet formulas.
        with Path(destination).open('x',encoding='utf-8-sig',newline='') as f:
            writer=csv.DictWriter(f,fieldnames=FIELDS,delimiter=';'); writer.writeheader()
            for row in rows:
                writer.writerow({k:("'"+v if isinstance(v,str) and v.lstrip().startswith(('=','+','-','@')) else v) for k,v in row.items()})
        return len(rows)

    def start(self,*args,**kwargs):
        try: self.append(*args,**kwargs)
        except OSError as exc: raise ValueError('Não foi possível registrar o início no log local. Nenhuma gravação iniciada.') from exc

    def finish(self,*args,**kwargs):
        try: self.append(*args,**kwargs)
        except Exception:
            WARNINGS.put('Falha ao registrar o resultado no log local. Confira o banco; não repita automaticamente. O registro de início pode permanecer sem desfecho.')

    def run(self, operation, config, company, planned, action, summarize, *, session=None, cycle=None):
        op=uuid4().hex
        self.start(operation,config,company,op,'INICIADO',session=session,cycle=cycle,metrics=planned)
        try: result=action()
        except Exception as exc:
            self.finish(operation,config,company,op,'COMMIT_INCERTO' if isinstance(exc,CommitUncertain) else 'FALHA',session=session,cycle=cycle,error=exc)
            raise
        try: metrics=summarize(result)
        except Exception:
            WARNINGS.put('Operação confirmada, mas resumo local indisponível. Confira o banco antes de repetir.')
        else: self.finish(operation,config,company,op,'CONFIRMADO',session=session,cycle=cycle,metrics=metrics)
        return result

JOURNAL = Journal()

def run_accounts(config, plan, action):
    return JOURNAL.run('cadastros',config,plan.existing,{'companies':len(plan.companies),'users':len(plan.users)},action,lambda r:{'companies':len(r[0]),'users':len(r[1]),'company_ids':r[0],'user_ids':r[1]})

def run_assets(config, plan, action):
    return JOURNAL.run('ativos',config,plan.company,{'machines':len(plan.machines),'sensors':len(plan.sensors)},action,lambda r:{'machines':len(r[0]),'sensors':len(r[1]),'machine_ids':r[0],'sensor_ids':r[1]})

def run_readings(config, plan, action, *, session=None, cycle=None):
    return JOURNAL.run('ciclo_simulacao' if session else 'historico',config,plan.company,{'readings':len(plan.rows),'sensor_ids':[s.id for s in plan.sensors]},action,lambda r:{'readings':r[0],'alerts':r[1],'updated':r[2],'sensor_ids':[s.id for s in plan.sensors]},session=session,cycle=cycle)

def run_orders(config, plan, action):
    return JOURNAL.run('ordens',config,plan.company,{'orders':len(plan.orders),'machine_ids':sorted({o.machine for o in plan.orders})},action,lambda r:{'orders':len(r),'order_ids':[i for i,_ in r]})

def run_session(config,spec,stop,report,run,apply):
    session=uuid4().hex; count=0; readings=alerts=0
    JOURNAL.start('sessao_simulacao',config,spec.company,session,'INICIADO',session=session,metrics={'readings':len(spec.sensors)*spec.cycles})
    def logged_apply(cfg,plan):
        return run_readings(cfg,plan,lambda:apply(cfg,plan),session=session,cycle=count+1)
    def logged_report(c):
        nonlocal count,readings,alerts
        count+=1; readings+=c.readings; alerts+=c.alerts; report(c)
    try: result=run(config,spec,stop,logged_report,apply=logged_apply)
    except Exception as exc:
        JOURNAL.finish('sessao_simulacao',config,spec.company,session,'COMMIT_INCERTO' if isinstance(exc,CommitUncertain) else 'FALHA',session=session,metrics={'readings':readings,'alerts':alerts},error=exc)
        raise
    JOURNAL.finish('sessao_simulacao',config,spec.company,session,'CONCLUIDO' if result==spec.cycles else 'INTERROMPIDO',session=session,metrics={'readings':readings,'alerts':alerts})
    return result
