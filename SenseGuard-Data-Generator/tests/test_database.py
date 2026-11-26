import unittest
from app.database import Config, REQUIRED, MIGRATIONS, VIEWS, COUNT_TABLES, inspect_metadata, diagnose, connect_test_database, diagnostic_error

class MetadataTests(unittest.TestCase):
    def setUp(self):
        self.tables={k:('BASE TABLE','InnoDB') for k in REQUIRED}
        self.tables.update({k:('VIEW',None) for k in VIEWS})
        self.cols={k:set(v.split()) for k,v in REQUIRED.items()}
        self.migrations=set(MIGRATIONS)
    def test_complete(self):
        self.assertEqual(inspect_metadata(self.tables,self.cols,self.migrations),[])
    def test_missing_column(self):
        self.cols['dados'].remove('origem')
        self.assertIn('dados: colunas ausentes: origem',inspect_metadata(self.tables,self.cols,self.migrations))
    def test_missing_migration(self):
        self.migrations.remove('010_token_permissoes_e_ips')
        self.assertTrue(inspect_metadata(self.tables,self.cols,self.migrations))
    def test_wrong_engine_and_view(self):
        self.tables['dados']=('BASE TABLE','MyISAM'); del self.tables['vw_sg_indicadores']
        self.assertEqual(len(inspect_metadata(self.tables,self.cols,self.migrations)),2)
    def test_reject_production(self):
        with self.assertRaises(ValueError): Config('localhost',3306,'senseguard','root','').validate()
    def test_reject_remote(self):
        with self.assertRaises(ValueError): Config('192.0.2.1',3306,'senseguard_teste','root','').validate()
    def test_password_hidden(self):
        self.assertNotIn('secret-test',repr(Config('localhost',3306,'senseguard_teste','root','secret-test')))
    def test_pure_connector_all_paths(self):
        from app.generator import open_connection
        config=Config('localhost',3306,'senseguard_teste','root','secret-test')
        calls=[]
        def fake(**kw):
            calls.append(kw)
            return object()
        connect_test_database(config,fake)
        open_connection(config,fake)
        self.assertEqual(len(calls),2)
        self.assertTrue(all(c['use_pure'] is True and c['autocommit'] is False for c in calls))
        self.assertTrue(all(c['database']=='senseguard_teste' for c in calls))
    def test_diagnostic_error_safe_stack(self):
        try:
            raise RuntimeError('private-password secret-test')
        except RuntimeError as exc:
            result=diagnostic_error(exc)
        self.assertIn('RuntimeError',result)
        self.assertIn('test_diagnostic_error_safe_stack',result)
        self.assertNotIn('private-password',result)
        self.assertNotIn('secret-test',result)
    def test_diagnostic_known_code(self):
        err=RuntimeError('secret-test')
        err.errno=1045
        self.assertIn('Acesso negado',diagnostic_error(err))
        self.assertNotIn('secret-test',diagnostic_error(err))
    def test_read_only_protocol(self):
        outer=self
        class Fake:
            def __init__(self): self.commands=[]; self.closed=False; self.rolled=False
            def cursor(self): return self
            def execute(self,sql): self.commands.append(sql)
            def fetchone(self): return ('senseguard_teste','10.11') if self.commands[-1]=='SELECT DATABASE(), VERSION()' else (2,)
            def fetchall(self):
                sql=self.commands[-1]
                if 'INFORMATION_SCHEMA.TABLES' in sql: return [(k,*v) for k,v in outer.tables.items()]
                if 'INFORMATION_SCHEMA.COLUMNS' in sql: return [(k,c) for k,v in outer.cols.items() for c in v]
                return [(m,) for m in outer.migrations]
            def close(self): self.closed=True
            def rollback(self): self.rolled=True
        fake=Fake()
        result=diagnose(Config('localhost',3306,'senseguard_teste','root',''),lambda **kw:fake)
        self.assertEqual(result.issues,[])
        self.assertEqual(result.counts,{k:2 for k in COUNT_TABLES})
        self.assertTrue(fake.closed and fake.rolled)
        self.assertEqual(fake.commands[0],'START TRANSACTION READ ONLY')
        self.assertTrue(all(s.startswith('SELECT ') for s in fake.commands[1:]))

if __name__=='__main__': unittest.main()
