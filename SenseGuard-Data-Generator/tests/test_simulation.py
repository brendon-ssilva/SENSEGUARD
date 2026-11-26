import unittest
from dataclasses import replace
from datetime import timedelta
from random import Random
from threading import Event
from app.simulation import Simulation, run_simulation, cycle_rate
from app.readings import status
from app.generator import CommitUncertain
from test_readings import S,V,NOW
from test_generator import CFG

class Stop(Event):
    def wait(self, timeout=None): return self.is_set()

class SimulationTests(unittest.TestCase):
    def setUp(self):
        self.spec=Simulation(3,(S,V),2,10,10); self.stop=Stop(); self.events=[]; self.plans=[]; self.clock=0
    def load(self,cfg,company):
        self.assertEqual(company,3); self.clock+=1
        return NOW+timedelta(seconds=2*self.clock),(S,V)
    def apply(self,cfg,p):
        self.plans.append(p); by_id={s.id:s for s in p.sensors}
        return len(p.rows),sum(status(r.value,by_id[r.sensor].low,by_id[r.sensor].high)=='alerta' for r in p.rows),len(p.sensors)
    def run_session(self,**kwargs):
        return run_simulation(CFG,self.spec,self.stop,self.events.append,rng=Random(5),**({'load':self.load,'apply':self.apply}|kwargs))
    def test_full_session(self):
        self.assertEqual(self.run_session(),10); self.assertEqual(sum(e.readings for e in self.events),20); self.assertEqual(sum(e.alerts for e in self.events),2); self.assertEqual(len({r.at for p in self.plans for r in p.rows}),10)
    def test_exact_rounding(self):
        for size in (1,2,6,99,100):
            for rate in (0,1,10,33,99,100):
                self.assertEqual(sum((size*cycle_rate(size,i,rate)+50)//100 for i in range(1,12)),(size*11*rate+50)//100)
    def test_invalid_options(self):
        for change in ({'company':0},{'sensors':()},{'sensors':(S,S)},{'seconds':1},{'cycles':301},{'rate':101},{'sensors':tuple(replace(S,id=i) for i in range(1,101)),'cycles':51}):
            with self.subTest(change=change),self.assertRaises(ValueError): replace(self.spec,**change).validate()
    def test_already_stopped(self):
        self.stop.set(); self.assertEqual(self.run_session(),0); self.assertFalse(self.plans)
    def test_stop_after_cycle(self):
        def apply(cfg,p):
            result=self.apply(cfg,p); self.stop.set(); return result
        self.assertEqual(self.run_session(apply=apply),1); self.assertEqual(len(self.events),1)
    def test_stop_before_write(self):
        def load(cfg,company):
            result=self.load(cfg,company); self.stop.set(); return result
        self.assertEqual(self.run_session(load=load),0); self.assertFalse(self.plans)
    def test_changed_sensor(self):
        self.assertRaises(ValueError,self.run_session,load=lambda c,i:(NOW,(replace(S,high=S.high+1),V))); self.assertFalse(self.plans)
    def test_foreign_sensor(self):
        self.assertRaises(ValueError,self.run_session,load=lambda c,i:(NOW,(V,))); self.assertFalse(self.plans)
    def test_clock_not_advanced(self):
        self.assertRaises(ValueError,self.run_session,load=lambda c,i:(NOW,(S,V))); self.assertEqual(len(self.plans),1)
    def test_error_stops_without_retry(self):
        def apply(cfg,p):
            if self.plans: raise CommitUncertain('incerto')
            return self.apply(cfg,p)
        self.assertRaises(CommitUncertain,self.run_session,apply=apply); self.assertEqual(len(self.events),1)
    def test_invalid_target(self):
        self.assertRaises(ValueError,run_simulation,replace(CFG,database='senseguard'),self.spec,self.stop,self.events.append,load=self.load,apply=self.apply); self.assertFalse(self.plans)
