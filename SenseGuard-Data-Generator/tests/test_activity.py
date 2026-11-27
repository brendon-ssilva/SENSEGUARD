import csv
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from threading import Event
from types import SimpleNamespace
from app.activity import Journal, WARNINGS, run_accounts, run_assets, run_orders, run_readings, run_session
from app.database import Config
from app.generator import CommitUncertain

CFG=Config('127.0.0.1',3306,'senseguard_teste','private-user','private-password')

class ActivityTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(); self.addCleanup(self.temp.cleanup)
        self.j=Journal(Path(self.temp.name)/'logs')
        self.p=patch('app.activity.JOURNAL',self.j); self.p.start(); self.addCleanup(self.p.stop)
        while not WARNINGS.empty(): WARNINGS.get_nowait()
    def test_commit_and_csv(self):
        result=self.j.run('ordens',CFG,3,{'orders':2},lambda:[(8,'OS-2026-00008'),(9,'OS-2026-00009')],lambda r:{'orders':len(r),'order_ids':[x[0] for x in r]})
        self.assertEqual(len(result),2)
        rows=self.j.events(); self.assertEqual([r['state'] for r in rows],['INICIADO','CONFIRMADO']); self.assertEqual(rows[0]['operation_id'],rows[1]['operation_id']); self.assertEqual(rows[1]['order_ids'],'8,9')
        dest=Path(self.temp.name)/'export.csv'; self.assertEqual(self.j.export(dest),2)
        with dest.open(encoding='utf-8-sig',newline='') as f: self.assertEqual(len(list(csv.DictReader(f,delimiter=';'))),2)
        with self.assertRaises(FileExistsError): self.j.export(dest)
    def test_failure_no_secret(self):
        def bad(): raise RuntimeError('private-password private-user sensitive SQL')
        with self.assertRaises(RuntimeError): self.j.run('ordens',CFG,3,{'orders':2},bad,lambda r:{})
        self.assertEqual(self.j.events()[-1]['state'],'FALHA')
        text=self.j.path.read_text(); self.assertNotIn('private-',text); self.assertNotIn('sensitive SQL',text)
    def test_uncertain(self):
        def bad(): raise CommitUncertain('private-password')
        with self.assertRaises(CommitUncertain): self.j.run('ordens',CFG,3,{},bad,lambda r:{})
        self.assertEqual(self.j.events()[-1]['state'],'COMMIT_INCERTO')
    def test_cannot_log_start_blocks_action(self):
        with patch.object(self.j,'append',side_effect=OSError('disk full')):
            with self.assertRaises(ValueError): self.j.run('ordens',CFG,3,{},lambda:self.fail('must not write'),lambda r:{})
    def test_post_commit_log_failure_preserves_result(self):
        real=self.j.append
        def append(*args,**kwargs):
            if args[4]=='CONFIRMADO': raise OSError('disk full')
            return real(*args,**kwargs)
        with patch.object(self.j,'append',side_effect=append):
            self.assertEqual(self.j.run('ordens',CFG,3,{},lambda:42,lambda r:{'orders':1}),42)
        self.assertFalse(WARNINGS.empty()); self.assertEqual(len(self.j.events()),1)
    def test_all_wrappers(self):
        run_accounts(CFG,SimpleNamespace(existing=None,companies=[1],users=[1,2]),lambda:([3],[4,5]))
        run_assets(CFG,SimpleNamespace(company=3,machines=[1],sensors=[1]),lambda:([6],[7]))
        run_readings(CFG,SimpleNamespace(company=3,rows=[1],sensors=[SimpleNamespace(id=7)]),lambda:(1,0,1))
        run_orders(CFG,SimpleNamespace(company=3,orders=[SimpleNamespace(machine=6)]),lambda:[(8,'OS')])
        rows=self.j.events(); self.assertEqual(len(rows),8); self.assertEqual([r['operation'] for r in rows[::2]],['cadastros','ativos','historico','ordens'])
    def test_session_with_stop(self):
        spec=SimpleNamespace(company=3,cycles=3,sensors=[SimpleNamespace(id=7)])
        plan=SimpleNamespace(company=3,rows=[1],sensors=spec.sensors)
        def run(cfg,spec,stop,report,apply):
            apply(cfg,plan); report(SimpleNamespace(readings=1,alerts=1)); stop.set(); return 1
        seen=[]; self.assertEqual(run_session(CFG,spec,Event(),seen.append,run,lambda cfg,p:(1,1,1)),1)
        rows=self.j.events(); self.assertEqual([r['state'] for r in rows],['INICIADO','INICIADO','CONFIRMADO','INTERROMPIDO']); self.assertEqual(len({r['session_id'] for r in rows}),1); self.assertEqual(rows[2]['cycle'],1); self.assertEqual(rows[-1]['readings'],1)
    def test_persistent_across_launches(self):
        self.j.run('ordens',CFG,3,{},lambda:1,lambda r:{'orders':1})
        self.assertEqual(len(Journal(self.j.directory).events()),2)
    def test_formula_guard(self):
        self.j.directory.mkdir(); self.j.path.write_text('{"operation":"=1+1"}\n')
        dest=Path(self.temp.name)/'export.csv'; self.j.export(dest)
        with dest.open(encoding='utf-8-sig',newline='') as f: self.assertEqual(next(csv.DictReader(f,delimiter=';'))['operation'],"'=1+1")
    def test_corrupt_log_does_not_export_incomplete_data(self):
        self.j.directory.mkdir(); self.j.path.write_text('{broken')
        dest=Path(self.temp.name)/'export.csv'
        with self.assertRaises(ValueError): self.j.export(dest)
        self.assertFalse(dest.exists())
