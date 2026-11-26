import unittest
from app.database import Config, REQUIRED, MIGRATIONS, VIEWS
from app.generator import make_plan, apply_plan, list_companies, validate_password, hash_password, CommitUncertain

CFG=Config('127.0.0.1',3306,'senseguard_teste','test','')
COUNTS={'admin':1,'supervisor':1,'tecnico':2}
PASSWORD='Teste-local-2026!'

class Fake:
    def __init__(self, fail_at=None, database='senseguard_teste', missing=False, commit_fail=False):
        self.commands=[]; self.inserts=[]; self.lastrowid=100; self.fail_at=fail_at; self.database=database; self.missing=missing; self.commit_fail=commit_fail; self.committed=False; self.rolled=False; self.closed=False
    def cursor(self): return self
    def execute(self,sql,params=()):
        self.commands.append((sql,params))
        if sql.startswith('INSERT'):
            if self.fail_at==len(self.inserts)+1: raise RuntimeError('simulated failure')
            self.inserts.append((sql,params)); self.lastrowid+=1
    def fetchone(self):
        sql=self.commands[-1][0]
        if sql=='SELECT DATABASE()': return (self.database,)
        if sql=='SELECT @@SESSION.foreign_key_checks': return (1,)
        if 'FOR UPDATE' in sql: return None if self.missing else (self.commands[-1][1][0],)
        raise AssertionError(sql)
    def fetchall(self):
        sql=self.commands[-1][0]
        if 'INFORMATION_SCHEMA.TABLES' in sql: return [(k,'BASE TABLE','InnoDB') for k in REQUIRED]+[(v,'VIEW',None) for v in VIEWS]
        if 'INFORMATION_SCHEMA.COLUMNS' in sql: return [(k,c) for k,cols in REQUIRED.items() for c in cols.split()]
        if sql=='SELECT versao FROM migracao': return [(x,) for x in MIGRATIONS]
        if sql.startswith('SELECT id_corporacao, nome'): return [(1,'Empresa Teste')]
        raise AssertionError(sql)
    def commit(self):
        if self.commit_fail: raise RuntimeError('commit acknowledgement lost')
        self.committed=True
    def rollback(self): self.rolled=True
    def close(self): self.closed=True

class GeneratorTests(unittest.TestCase):
    def apply(self,fake,plan): return apply_plan(CFG,plan,PASSWORD,connect=lambda **kw:fake,hasher=lambda p:'mock-hash')
    def test_plan_new(self):
        p=make_plan(None,2,COUNTS)
        self.assertEqual((len(p.companies),len(p.users)),(2,8))
        self.assertEqual({u.target for u in p.users},{0,1})
        self.assertEqual(len({u.email for u in p.users}),8)
        self.assertEqual(len({c.cnpj for c in p.companies}),2)
    def test_existing(self):
        p=make_plan(2,1,COUNTS)
        self.assertEqual(p.companies,()); self.assertTrue(all(u.target==2 for u in p.users))
    def test_limits(self):
        for args in [(None,21,COUNTS),(None,20,COUNTS|{'tecnico':10}),(0,1,COUNTS),(1,1,dict.fromkeys(COUNTS,0)),(None,1,COUNTS|{'admin':-1})]:
            with self.subTest(args=args),self.assertRaises(ValueError): make_plan(*args)
    def test_password(self):
        for p in ('short','é'*37,'a'*12+'\0'):
            with self.assertRaises(ValueError): validate_password(p)
        validate_password(PASSWORD)
    def test_commit_and_mapping(self):
        f=Fake(); ids,users=self.apply(f,make_plan(None,2,COUNTS))
        self.assertEqual(ids,[101,102]); self.assertEqual(len(users),8)
        self.assertEqual([p[-1] for _,p in f.inserts[2:]],[101]*4+[102]*4)
        self.assertTrue(f.committed and f.closed); self.assertFalse(f.rolled)
        self.assertTrue(all('%s' in sql for sql,_ in f.inserts))
        self.assertNotIn(PASSWORD,repr(f.inserts))
    def test_existing_mapping(self):
        f=Fake(); ids,users=self.apply(f,make_plan(2,1,COUNTS))
        self.assertEqual(ids,[]); self.assertEqual(len(users),4); self.assertTrue(all(p[-1]==2 for _,p in f.inserts))
    def test_rollback(self):
        f=Fake(fail_at=3)
        with self.assertRaises(RuntimeError): self.apply(f,make_plan(None,1,COUNTS))
        self.assertTrue(f.rolled and f.closed); self.assertFalse(f.committed)
    def test_wrong_database(self):
        f=Fake(database='senseguard')
        with self.assertRaises(ValueError): self.apply(f,make_plan(None,1,COUNTS))
        self.assertEqual(f.inserts,[]); self.assertTrue(f.rolled)
    def test_missing_company(self):
        f=Fake(missing=True)
        with self.assertRaises(ValueError): self.apply(f,make_plan(2,1,COUNTS))
        self.assertEqual(f.inserts,[]); self.assertTrue(f.rolled)
    def test_uncertain_commit(self):
        f=Fake(commit_fail=True)
        with self.assertRaises(CommitUncertain): self.apply(f,make_plan(None,1,COUNTS))
        self.assertTrue(f.closed)
    def test_list_read_only(self):
        f=Fake(); self.assertEqual(list_companies(CFG,lambda **kw:f),[(1,'Empresa Teste')]); self.assertEqual(f.commands[0][0],'START TRANSACTION READ ONLY'); self.assertTrue(f.rolled)
    def test_bcrypt(self):
        import bcrypt
        h=hash_password(PASSWORD)
        self.assertTrue(bcrypt.checkpw(PASSWORD.encode(),h.encode())); self.assertFalse(bcrypt.checkpw(b'wrong',h.encode()))
        self.assertNotEqual(h,hash_password(PASSWORD))

if __name__=='__main__': unittest.main()
