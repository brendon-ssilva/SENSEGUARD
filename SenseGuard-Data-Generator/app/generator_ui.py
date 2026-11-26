from app.activity import run_accounts
import tkinter as tk
from tkinter import ttk, messagebox
from threading import Thread
from queue import Queue, Empty
from app.generator import ROLES, make_plan, apply_plan, list_companies, validate_password, CommitUncertain

class GeneratorWindow(tk.Toplevel):
    def __init__(self, parent, config):
        super().__init__(parent)
        self.config_db = config
        self.plan = None
        self.busy = False
        self.queue = Queue()
        self.title('SenseGuard • Organizações e usuários 0.2')
        self.geometry('900x680'); self.minsize(720,580)
        self.transient(parent); self.grab_set()
        self.protocol('WM_DELETE_WINDOW',self.close_window)
        f=ttk.Frame(self,padding=18); f.pack(fill='both',expand=True); f.columnconfigure(1,weight=1); f.rowconfigure(9,weight=1)
        ttk.Label(f,text='Gerar organizações e usuários',style='Title.TLabel').grid(row=0,columnspan=3,sticky='w')
        ttk.Label(f,text=f'Alvo: {config.host}:{config.port} / {config.database} • somente dados fictícios').grid(row=1,columnspan=3,sticky='w',pady=6)
        self.target=tk.StringVar(value='Novas organizações')
        ttk.Label(f,text='Destino').grid(row=2,column=0,sticky='w')
        self.combo=ttk.Combobox(f,textvariable=self.target,state='readonly',values=['Novas organizações']); self.combo.grid(row=2,column=1,sticky='ew',pady=4)
        self.refresh=ttk.Button(f,text='Atualizar lista',command=self.load); self.refresh.grid(row=2,column=2,padx=5)
        self.count=tk.StringVar(value='1')
        ttk.Label(f,text='Novas empresas (1–20)').grid(row=3,column=0,sticky='w'); self.count_entry=ttk.Entry(f,textvariable=self.count); self.count_entry.grid(row=3,column=1,sticky='ew',pady=4)
        self.roles={r:tk.StringVar(value='1') for r in ROLES}
        self.entries=[]
        for i,r in enumerate(ROLES,4):
            ttk.Label(f,text=f'{r} por empresa (0–50)').grid(row=i,column=0,sticky='w'); e=ttk.Entry(f,textvariable=self.roles[r]); e.grid(row=i,column=1,sticky='ew',pady=4); self.entries.append(e)
        self.password=tk.StringVar()
        ttk.Label(f,text='Senha inicial de teste (12–72 bytes)').grid(row=7,column=0,sticky='w'); self.password_entry=ttk.Entry(f,textvariable=self.password,show='*'); self.password_entry.grid(row=7,column=1,sticky='ew',pady=4)
        ttk.Label(f,text='Senha compartilhada no lote; hash único por usuário. Não use senha real.').grid(row=8,columnspan=3,sticky='w',pady=4)
        self.text=tk.Text(f,wrap='word',height=12,bg='#1e2938',fg='#e5e7eb',font=('Consolas',10),state='disabled'); self.text.grid(row=9,column=0,columnspan=2,sticky='nsew',pady=8)
        scroll=ttk.Scrollbar(f,command=self.text.yview); scroll.grid(row=9,column=2,sticky='ns'); self.text.configure(yscrollcommand=scroll.set)
        b=ttk.Frame(f); b.grid(row=10,columnspan=3,sticky='ew')
        self.preview_button=ttk.Button(b,text='Pré-visualizar (sem gravar)',command=self.preview); self.preview_button.pack(side='left')
        self.apply_button=ttk.Button(b,text='Confirmar e gravar',command=self.save,state='disabled'); self.apply_button.pack(side='left',padx=8)
        self.status=tk.StringVar(value='Carregando organizações…'); ttk.Label(f,textvariable=self.status,wraplength=800).grid(row=11,columnspan=3,sticky='w',pady=8)
        self.company_map={}
        for v in [self.target,self.count,*self.roles.values()]: v.trace_add('write',self.invalidate)
        self.after(100,self.poll); self.load()

    def close_window(self):
        if self.busy: messagebox.showinfo('Aguarde','Uma operação está em andamento.',parent=self); return
        self.password.set(''); self.destroy()

    def invalidate(self,*args):
        self.plan=None; self.apply_button.configure(state='disabled')
        self.count_entry.configure(state='normal' if self.target.get()=='Novas organizações' else 'disabled')
        self.write('Parâmetros alterados. Gere uma nova prévia.')

    def write(self,s):
        self.text.configure(state='normal'); self.text.delete('1.0','end'); self.text.insert('end',s); self.text.configure(state='disabled')

    def run_task(self,kind,fn):
        self.busy=True
        for w in [self.combo,self.count_entry,*self.entries,self.password_entry,self.refresh,self.preview_button,self.apply_button]: w.configure(state='disabled')
        def task():
            try: self.queue.put((kind,fn(),None))
            except Exception as e: self.queue.put((kind,None,e))
        Thread(target=task,daemon=False).start()

    def load(self):
        self.plan=None; self.status.set('Consultando organizações…'); self.run_task('list',lambda:list_companies(self.config_db))

    def preview(self):
        try:
            existing=self.company_map.get(self.target.get())
            count=1 if existing is not None else int(self.count.get())
            plan=make_plan(existing,count,{r:int(v.get()) for r,v in self.roles.items()})
        except ValueError as e: messagebox.showerror('Parâmetros inválidos',str(e),parent=self); return
        self.plan=plan
        lines=[f'PRÉVIA — {len(plan.companies)} empresa(s), {len(plan.users)} usuário(s). Nenhum INSERT executado.','']
        if existing is not None: lines.append(f'Organização existente: {self.target.get()}')
        for i,c in enumerate(plan.companies): lines.append(f'Nova {i+1}: {c.name} | {c.cnpj} | {c.email}')
        for u in plan.users:
            target=f'ID {u.target}' if existing is not None else f'Nova {u.target+1}'
            lines.append(f'{target} | {u.role} | {u.name} | {u.email}')
        self.preview_text='\n'.join(lines[1:]); self.write('\n'.join(lines)); self.status.set('Revise a prévia antes de confirmar.'); self.apply_button.configure(state='normal')

    def save(self):
        plan=self.plan
        if plan is None or self.busy: return
        password=self.password.get()
        try:
            if plan.users: validate_password(password)
        except ValueError as e: messagebox.showerror('Senha inválida',str(e),parent=self); return
        if not messagebox.askyesno('Confirmar gravação',f'Gravar {len(plan.companies)} empresa(s) e {len(plan.users)} usuário(s) em {self.config_db.database}?',parent=self): return
        self.password.set(''); self.plan=None; self.status.set('Gerando hashes e gravando transação…')
        self.run_task('save',lambda:run_accounts(self.config_db,plan,lambda:apply_plan(self.config_db,plan,password)))

    def poll(self):
        try: kind,result,error=self.queue.get_nowait()
        except Empty: pass
        else:
            self.busy=False
            for w in [*self.entries,self.password_entry,self.refresh,self.preview_button]: w.configure(state='normal')
            self.combo.configure(state='readonly'); self.count_entry.configure(state='normal' if self.target.get()=='Novas organizações' else 'disabled')
            self.apply_button.configure(state='disabled')
            if error:
                code=getattr(error,'errno',None)
                if isinstance(error,CommitUncertain): msg=str(error)
                elif isinstance(error,ValueError): msg=str(error)
                elif isinstance(error,ModuleNotFoundError): msg='Instale as dependências do requirements.txt.'
                else: msg=f'Falha ({type(error).__name__}; código {code or "indisponível"}). Confira o banco e permissões. Não repita sem verificar.'
                self.status.set(msg); self.write(msg)
            elif kind=='list':
                self.company_map={f'{i} — {name}':i for i,name in result}; self.combo.configure(values=['Novas organizações',*self.company_map]); self.target.set('Novas organizações'); self.status.set('Lista atualizada. Configure o lote e gere a prévia.')
            else:
                companies,users=result; self.write(f'COMMIT confirmado.\nEmpresas criadas: {len(companies)} | IDs: {companies}\nUsuários criados: {len(users)} | IDs: {users}\n\nAtualize a lista para utilizar as novas empresas.\n{self.preview_text}'); self.status.set('Gravação concluída. Gere nova prévia para outro lote.')
        self.after(100,self.poll)
