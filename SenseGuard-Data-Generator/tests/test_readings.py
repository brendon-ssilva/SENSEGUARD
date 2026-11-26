import unittest
from datetime import datetime,timedelta
from decimal import Decimal as D
from dataclasses import replace
from random import Random
from app.readings import SensorInfo, Reading, make_reading_plan, apply_readings, list_sensors, status
from app.generator import CommitUncertain
from test_generator import Fake, CFG

NOW=datetime(2026,11,26,2,0)
S=SensorInfo(3,'TMP','temperatura','°C',D('20'),D('85'),6)
V=SensorInfo(4,'VIB','vibracao','mm/s',D('0'),D('7'),6)

def plan(sensors=(S,V),count=24,interval=60,rate=10,end=NOW):
    return make_reading_plan(3,sensors,count,interval,rate,end,Random(5))

class ReadFake(Fake):
    def __init__(self,previous=None,foreign=False,changed=False,existing=(),**kwargs):
        super().__init__(**kwargs); self.previous=previous; self.foreign=foreign; self.changed=changed; self.existing=existing
    def fetchone(self):
        sql,params=self.commands[-1]
        if sql=='SELECT NOW()': return (NOW,)
        if sql.startswith('SELECT id_sensor') and 'FOR UPDATE' in sql:
            if self.foreign: return None
            s={3:S,4:V}[params[0]]
            return (s.id,s.name,s.kind,s.unit,s.low,s.high+1 if self.changed else s.high,s.machine,self.previous)
        return super().fetchone()
    def fetchall(self):
        sql,params=self.commands[-1]
        if sql.startswith('SELECT data_hora FROM dados'): return [(x,) for x in self.existing]
        if sql.startswith('SELECT id_sensor,nome'): return [(s.id,s.name,s.kind,s.unit,s.low,s.high,s.machine) for s in (S,V)]
        return super().fetchall()

class ReadingTests(unittest.TestCase):
    def apply(self,f,p): return apply_readings(CFG,p,lambda **kw:f)
    def test_plan_count_and_period(self):
        p=plan(); self.assertEqual(len(p.rows),48); self.assertEqual(min(r.at for r in p.rows),NOW-timedelta(hours=23)); self.assertEqual(max(r.at for r in p.rows),NOW); self.assertEqual(len(set((r.sensor,r.at) for r in p.rows)),48)
    def test_alert_count(self):
        p=plan(); sensors={s.id:s for s in p.sensors}; self.assertEqual(sum(status(r.value,sensors[r.sensor].low,sensors[r.sensor].high)=='alerta' for r in p.rows),5)
    def test_bounds(self):
        self.assertEqual(status(D(20),S.low,S.high),'online'); self.assertEqual(status(D(85),S.low,S.high),'online'); self.assertEqual(status(D('85.0001'),S.low,S.high),'alerta')
        for rate in (0,100):
            p=plan((S,),rate=rate); self.assertTrue(all(status(r.value,S.low,S.high)==('alerta' if rate else 'online') for r in p.rows))
    def test_limits(self):
        for kwargs in ({'sensors':()},{'sensors':(S,S)},{'count':1001},{'interval':0},{'rate':101},{'count':1000,'interval':1440},{'sensors':(replace(S,low=D('90')),)}, {'sensors':tuple(replace(S,id=i) for i in range(1,7)),'count':1000,'interval':1}):
            with self.subTest(kwargs=kwargs),self.assertRaises(ValueError): plan(**kwargs)
    def test_zero_width(self):
        s=replace(S,high=S.low); p=plan((s,),rate=50); self.assertEqual(sum(status(r.value,s.low,s.high)=='alerta' for r in p.rows),12)
    def test_commit(self):
        f=ReadFake(); p=plan(); self.assertEqual(self.apply(f,p),(48,5,2)); self.assertTrue(f.committed and f.closed); self.assertFalse(f.rolled)
        self.assertTrue(all(x[1][5:]==(3,'importacao',None,None) for x in f.inserts)); self.assertEqual({x[1][3] for x in f.inserts},{6}); self.assertEqual(len([x for x in f.commands if x[0].startswith('UPDATE sensor')]),2)
    def test_older_history_preserves_current(self):
        f=ReadFake(previous=NOW); self.assertEqual(self.apply(f,plan(end=NOW-timedelta(seconds=1))),(48,5,0)); self.assertFalse(any(x[0].startswith('UPDATE sensor') for x in f.commands))
    def test_wrong_database(self):
        f=ReadFake(database='senseguard'); self.assertRaises(ValueError,self.apply,f,plan()); self.assertFalse(f.inserts); self.assertTrue(f.rolled)
    def test_foreign_or_changed(self):
        for f in (ReadFake(foreign=True),ReadFake(changed=True),ReadFake(missing=True)):
            self.assertRaises(ValueError,self.apply,f,plan()); self.assertFalse(f.inserts); self.assertTrue(f.rolled)
    def test_future(self):
        f=ReadFake(); self.assertRaises(ValueError,self.apply,f,plan(end=NOW+timedelta(seconds=1))); self.assertFalse(f.inserts); self.assertTrue(f.rolled)
    def test_duplicate_in_database(self):
        f=ReadFake(existing=(NOW,)); self.assertRaises(ValueError,self.apply,f,plan()); self.assertFalse(f.inserts); self.assertTrue(f.rolled)
    def test_duplicate_in_plan(self):
        p=plan(); f=ReadFake(); self.assertRaises(ValueError,self.apply,f,replace(p,rows=p.rows+(p.rows[0],))); self.assertFalse(f.commands)
    def test_rollback(self):
        f=ReadFake(fail_at=25); self.assertRaises(RuntimeError,self.apply,f,plan()); self.assertFalse(f.committed); self.assertTrue(f.rolled and f.closed)
    def test_commit_uncertain(self):
        f=ReadFake(commit_fail=True); self.assertRaises(CommitUncertain,self.apply,f,plan()); self.assertTrue(f.closed)
    def test_list_scoped(self):
        f=ReadFake(); self.assertEqual(list_sensors(CFG,3,lambda **kw:f),(NOW,(S,V))); self.assertEqual(f.commands[0][0],'START TRANSACTION READ ONLY'); self.assertEqual(f.commands[-1][1],(3,)); self.assertTrue(f.rolled and f.closed)
