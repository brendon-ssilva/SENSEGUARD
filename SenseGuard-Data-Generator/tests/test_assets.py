import unittest
from dataclasses import replace
from datetime import date
from app.assets import PROFILES, MACHINE_TYPES, make_asset_plan, apply_assets, list_machines, Sensor
from app.generator import CommitUncertain
from test_generator import Fake, CFG

COUNTS={k:int(k in ('temperatura','vibracao','corrente')) for k in PROFILES}

def plan(existing=None, company=3, counts=None):
    return make_asset_plan(company,existing,2,MACHINE_TYPES[0],COUNTS if counts is None else counts,date(2026,11,26))

class AssetFake(Fake):
    def __init__(self, foreign_machine=False, **kwargs):
        super().__init__(**kwargs); self.foreign_machine=foreign_machine
    def fetchone(self):
        if 'FROM maquina WHERE' in self.commands[-1][0] and self.foreign_machine: return None
        return super().fetchone()
    def fetchall(self):
        if self.commands[-1][0].startswith('SELECT id_maquina, nome'): return [(5,'Motor')]
        return super().fetchall()

class AssetTests(unittest.TestCase):
    def apply(self,f,p): return apply_assets(CFG,p,lambda **kw:f)
    def test_plan(self):
        p=plan(); self.assertEqual((len(p.machines),len(p.sensors)),(2,6)); self.assertEqual({s.target for s in p.sensors},{0,1}); self.assertEqual(len({s.name for s in p.sensors}),6); self.assertEqual(len({m.serial for m in p.machines}),2)
        self.assertTrue(all(m.installed<m.maintenance<m.next_maintenance for m in p.machines))
    def test_all_types(self):
        p=plan(counts=dict.fromkeys(PROFILES,1)); self.assertEqual({s.kind for s in p.sensors},set(PROFILES)); self.assertEqual(len(p.sensors),12)
    def test_limits(self):
        for args in [(0,None,2,MACHINE_TYPES[0],COUNTS),(3,None,21,MACHINE_TYPES[0],COUNTS),(3,None,20,MACHINE_TYPES[0],dict.fromkeys(PROFILES,10)),(3,None,2,'inválido',COUNTS),(3,None,2,MACHINE_TYPES[0],COUNTS|{'rpm':-1}),(3,5,1,MACHINE_TYPES[0],dict.fromkeys(PROFILES,0))]:
            with self.subTest(args=args), self.assertRaises(ValueError): make_asset_plan(*args)
    def test_machine_only(self):
        f=AssetFake(); m,s=self.apply(f,plan(counts=dict.fromkeys(PROFILES,0))); self.assertEqual((m,s),([101,102],[])); self.assertTrue(f.committed)
    def test_mapping(self):
        f=AssetFake(); m,s=self.apply(f,plan()); self.assertEqual(m,[101,102]); self.assertEqual(len(s),6); self.assertTrue(f.committed and f.closed); self.assertFalse(f.rolled)
        self.assertEqual([params[-2:] for _,params in f.inserts[2:]],[(101,3)]*3+[(102,3)]*3)
        for sql,p in f.inserts[2:]: self.assertEqual(p[5:8],(0,'offline',None)); self.assertEqual(p[3:5],PROFILES[p[1]][2:]); self.assertIn('%s',sql)
    def test_existing(self):
        f=AssetFake(); m,s=self.apply(f,plan(5)); self.assertEqual(m,[]); self.assertEqual(len(s),3); self.assertTrue(all(p[-2:]==(5,3) for _,p in f.inserts)); self.assertIn(('SELECT id_maquina FROM maquina WHERE id_maquina = %s AND id_corporacao = %s FOR UPDATE',(5,3)),f.commands)
    def test_foreign_machine(self):
        f=AssetFake(foreign_machine=True)
        with self.assertRaises(ValueError): self.apply(f,plan(5))
        self.assertEqual(f.inserts,[]); self.assertTrue(f.rolled)
    def test_missing_company(self):
        f=AssetFake(missing=True)
        with self.assertRaises(ValueError): self.apply(f,plan())
        self.assertFalse(f.inserts); self.assertTrue(f.rolled)
    def test_wrong_database(self):
        f=AssetFake(database='senseguard')
        with self.assertRaises(ValueError): self.apply(f,plan())
        self.assertFalse(f.inserts); self.assertTrue(f.rolled)
    def test_rollback(self):
        f=AssetFake(fail_at=4)
        with self.assertRaises(RuntimeError): self.apply(f,plan())
        self.assertFalse(f.committed); self.assertTrue(f.rolled and f.closed)
    def test_uncertain_commit(self):
        f=AssetFake(commit_fail=True)
        with self.assertRaises(CommitUncertain): self.apply(f,plan())
        self.assertTrue(f.closed)
    def test_forged_plan(self):
        p=plan(); f=AssetFake()
        with self.assertRaises(ValueError): self.apply(f,replace(p,sensors=(Sensor('test','temperatura',999),)))
        self.assertFalse(f.commands)
    def test_list_scoped_read_only(self):
        f=AssetFake(); self.assertEqual(list_machines(CFG,3,lambda **kw:f),[(5,'Motor')]); self.assertEqual(f.commands[0][0],'START TRANSACTION READ ONLY'); self.assertEqual(f.commands[-1][1],(3,)); self.assertTrue(f.rolled and f.closed)

if __name__=='__main__': unittest.main()
