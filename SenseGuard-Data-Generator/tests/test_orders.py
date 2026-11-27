import unittest
from dataclasses import replace
from datetime import datetime
from app.orders import make_order_plan,apply_orders,list_targets,TYPES,PRIORITIES,STATUSES
from app.generator import CommitUncertain
from test_generator import Fake,CFG

NOW=datetime(2026,11,26,3,0)
class OrderFake(Fake):
    def __init__(self,foreign_machine=False,foreign_user=False,creator_role='admin',update_fail=False,**kw):
        super().__init__(**kw); self.foreign_machine=foreign_machine; self.foreign_user=foreign_user; self.creator_role=creator_role; self.update_fail=update_fail
    def execute(self,sql,params=()):
        super().execute(sql,params)
        if sql.startswith('UPDATE ordem_servico') and self.update_fail: raise RuntimeError('update failed')
    def fetchone(self):
        sql,p=self.commands[-1]
        if sql=='SELECT NOW()': return (NOW,)
        if 'FROM maquina WHERE' in sql and self.foreign_machine: return None
        if 'SELECT role FROM usuario' in sql:
            if self.foreign_user: return None
            return (self.creator_role if p[0]==2 else 'tecnico',)
        return super().fetchone()
    def fetchall(self):
        sql,p=self.commands[-1]
        if sql.startswith('SELECT id_maquina,nome'): return [(6,'Compressor 1'),(7,'Compressor 2')]
        if sql.startswith('SELECT id_usuario,nome,role'): return [(2,'Admin','admin'),(4,'Técnico','tecnico')]
        return super().fetchall()

def plan(): return make_order_plan(3,[6,7],2,4,4)
class OrderTests(unittest.TestCase):
    def apply(self,f,p=None): return apply_orders(CFG,p or plan(),lambda **kw:f)
    def test_mixed(self):
        p=plan(); self.assertEqual(len(p.orders),8); self.assertEqual({o.kind for o in p.orders},set(TYPES)); self.assertEqual({o.priority for o in p.orders},set(PRIORITIES)); self.assertEqual({o.status for o in p.orders},set(STATUSES)); self.assertEqual(len({o.title for o in p.orders}),8)
    def test_fixed(self):
        p=make_order_plan(3,[6],2,4,3,'preventiva','alta','aberta'); self.assertTrue(all((o.kind,o.priority,o.status)==('preventiva','alta','aberta') for o in p.orders))
    def test_invalid(self):
        for args in [(0,[6],2,4,4),(3,[],2,4,4),(3,[6,6],2,4,4),(3,[6],0,4,4),(3,[6],2,4,21),(3,list(range(1,7)),2,4,20),(3,[6],2,4,4,'unknown')]:
            with self.subTest(args=args),self.assertRaises(ValueError): make_order_plan(*args)
    def test_mapping_and_codes(self):
        f=OrderFake(); ids=self.apply(f); self.assertEqual(ids,[(i,f'OS-2026-{i:05d}') for i in range(101,109)]); self.assertTrue(f.committed and f.closed); self.assertFalse(f.rolled)
        self.assertEqual([p[-4:] for _,p in f.inserts],[(6,4,2,3)]*4+[(7,4,2,3)]*4)
        self.assertEqual([p[8] for _,p in f.inserts],[None,None,NOW,None]*2)
        updates=[p for sql,p in f.commands if sql.startswith('UPDATE ordem_servico')]; self.assertEqual(updates,[(code,i,3) for i,code in ids])
    def test_foreign_machine(self):
        f=OrderFake(foreign_machine=True)
        with self.assertRaises(ValueError): self.apply(f)
        self.assertFalse(f.inserts); self.assertTrue(f.rolled)
    def test_foreign_user(self):
        f=OrderFake(foreign_user=True)
        with self.assertRaises(ValueError): self.apply(f)
        self.assertFalse(f.inserts); self.assertTrue(f.rolled)
    def test_creator_role(self):
        f=OrderFake(creator_role='tecnico')
        with self.assertRaises(ValueError): self.apply(f)
        self.assertFalse(f.inserts); self.assertTrue(f.rolled)
    def test_insert_rollback(self):
        f=OrderFake(fail_at=3)
        with self.assertRaises(RuntimeError): self.apply(f)
        self.assertTrue(f.rolled and f.closed); self.assertFalse(f.committed)
    def test_code_rollback(self):
        f=OrderFake(update_fail=True)
        with self.assertRaises(RuntimeError): self.apply(f)
        self.assertTrue(f.rolled); self.assertFalse(f.committed)
    def test_uncertain(self):
        f=OrderFake(commit_fail=True)
        with self.assertRaises(CommitUncertain): self.apply(f)
        self.assertTrue(f.closed)
    def test_wrong_database(self):
        f=OrderFake(database='senseguard')
        with self.assertRaises(ValueError): self.apply(f)
        self.assertFalse(f.inserts)
    def test_forged(self):
        p=plan(); f=OrderFake()
        with self.assertRaises(ValueError): self.apply(f,replace(p,orders=(replace(p.orders[0],status='invalid'),)))
        self.assertFalse(f.commands)
    def test_list_targets(self):
        f=OrderFake(); m,u=list_targets(CFG,3,lambda **kw:f); self.assertEqual(len(m),2); self.assertEqual(len(u),2); self.assertTrue(f.rolled and f.closed); self.assertEqual(f.commands[0][0],'START TRANSACTION READ ONLY'); self.assertTrue(all(p==(3,) for sql,p in f.commands if 'FROM maquina' in sql or 'FROM usuario' in sql))
