import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from datetime import datetime
from app.activity import JOURNAL

class ActivityWindow(tk.Toplevel):
    def __init__(self,parent):
        super().__init__(parent); self.title('SenseGuard • Histórico de operações'); self.geometry('1050x540'); self.minsize(650,350); self.transient(parent); self.grab_set()
        f=ttk.Frame(self,padding=16); f.pack(fill='both',expand=True)
        ttk.Label(f,text='Histórico de operações',style='Title.TLabel').pack(anchor='w')
        ttk.Label(f,text=str(JOURNAL.directory),wraplength=950).pack(anchor='w',pady=5)
        ttk.Label(f,text='Horários UTC • INICIADO sem desfecho exige conferência do banco.').pack(anchor='w')
        bar=ttk.Frame(f); bar.pack(fill='x',pady=8)
        ttk.Button(bar,text='Atualizar',command=self.refresh).pack(side='left')
        ttk.Button(bar,text='Exportar CSV',command=self.export).pack(side='left',padx=8)
        self.status=ttk.Label(f,text=''); self.status.pack(anchor='w')
        body=ttk.Frame(f); body.pack(fill='both',expand=True); body.rowconfigure(0,weight=1); body.columnconfigure(0,weight=1)
        self.tree=ttk.Treeview(body,columns=('at','operation','database','org','state','metrics'),show='headings')
        for col,title,width in [('at','Data/hora UTC',205),('operation','Operação',130),('database','Banco',155),('org','Org.',55),('state','Estado',145),('metrics','Quantidades',230)]:
            self.tree.heading(col,text=title); self.tree.column(col,width=width,stretch=col=='metrics')
        self.tree.grid(row=0,column=0,sticky='nsew')
        y=ttk.Scrollbar(body,orient='vertical',command=self.tree.yview); y.grid(row=0,column=1,sticky='ns'); self.tree.configure(yscrollcommand=y.set)
        x=ttk.Scrollbar(body,orient='horizontal',command=self.tree.xview); x.grid(row=1,column=0,sticky='ew'); self.tree.configure(xscrollcommand=x.set)
        self.refresh()
    def refresh(self):
        try: rows=JOURNAL.events()
        except (OSError,ValueError): self.status.configure(text='Não foi possível ler todos os logs. Confira os arquivos locais.'); return
        self.tree.delete(*self.tree.get_children())
        for r in reversed(rows[-2000:]):
            metrics=' | '.join(f'{label}: {r[k]}' for k,label in [('companies','Empresas'),('users','Usuários'),('machines','Máquinas'),('sensors','Sensores'),('readings','Leituras'),('alerts','Alertas'),('orders','OS')] if r[k] is not None)
            self.tree.insert('', 'end',values=(r['timestamp_utc'],r['operation'],r['database'],r['company_id'] or '—',r['state'],metrics))
        self.status.configure(text=f'{len(rows)} evento(s). Mostrando até os últimos 2.000. CSV inclui todos.')
    def export(self):
        path=filedialog.asksaveasfilename(parent=self,defaultextension='.csv',filetypes=[('CSV','*.csv')],initialfile=f'SenseGuard-atividade-{datetime.now():%Y%m%d-%H%M%S}.csv')
        if not path: return
        try: n=JOURNAL.export(path)
        except FileExistsError: messagebox.showerror('Arquivo existente','Escolha um novo nome. Nenhum arquivo foi sobrescrito.',parent=self)
        except (OSError,ValueError): messagebox.showerror('Falha','Não foi possível exportar todos os eventos. Confira o destino e os logs.',parent=self)
        else: messagebox.showinfo('Exportação concluída',f'{n} eventos exportados.',parent=self)
