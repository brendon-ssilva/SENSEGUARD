from app.activity import run_orders
"""Interface para geração explícita de ordens de serviço."""
import tkinter as tk
from tkinter import ttk,messagebox
from threading import Thread
from queue import Queue,Empty
from app.generator import list_companies,CommitUncertain
from app.orders import TYPES,PRIORITIES,STATUSES,MIXED,make_order_plan,list_targets,apply_orders

ALL='Todas as máquinas listadas'

class OrdersWindow(tk.Toplevel):
    def __init__(self,parent,config):
        super().__init__(parent); self.cfg=config; self.busy=False; self.plan=None; self.queue=Queue(); self.companies={}; self.machines={}; self.users={}; self.creators={}
        self.title('SenseGuard • Ordens de serviço 0.6'); self.geometry('940x690'); self.minsize(740,600); self.transient(parent); self.grab_set(); self.protocol('WM_DELETE_WINDOW',self.close)
        f=ttk.Frame(self,padding=16); f.pack(fill='both',expand=True); f.columnconfigure(1,weight=1); f.rowconfigure(10,weight=1)
        ttk.Label(f,text='Gerar ordens de serviço',style='Title.TLabel').grid(row=0,columnspan=2,sticky='w')
        ttk.Label(f,text=f'Banco: {config.database} • Somente dados fictícios').grid(row=1,columnspan=2,sticky='w',pady=5)
        self.vars={k:tk.StringVar(value=v) for k,v in [('company',''),('machine',ALL),('creator',''),('responsible',''),('amount','4'),('kind',MIXED),('priority',MIXED),('status',MIXED)]}
        self.widgets={}
        for i,(k,label,values) in enumerate([('company','Organização',()),('machine','Máquinas',(ALL,)),('creator','Criador (admin/supervisor)',()),('responsible','Responsável ativo',()),('amount','OS por máquina (1–20)',None),('kind','Tipo',(MIXED,*TYPES)),('priority','Prioridade',(MIXED,*PRIORITIES)),('status','Status',(MIXED,*STATUSES))],2):
            ttk.Label(f,text=label).grid(row=i,column=0,sticky='w',pady=3,padx=(0,12))
            w=ttk.Entry(f,textvariable=self.vars[k]) if values is None else ttk.Combobox(f,textvariable=self.vars[k],values=values,state='readonly')
            w.grid(row=i,column=1,sticky='ew',pady=3); self.widgets[k]=w
        self.widgets['company'].bind('<<ComboboxSelected>>',lambda e:self.load_targets())
        self.text=tk.Text(f,wrap='word',bg='#1e2938',fg='#e5e7eb',font=('Consolas',10),state='disabled',height=10); self.text.grid(row=10,columnspan=2,sticky='nsew',pady=8)
        sb=ttk.Scrollbar(f,command=self.text.yview); sb.grid(row=10,column=2,sticky='ns'); self.text.configure(yscrollcommand=sb.set)
        b=ttk.Frame(f); b.grid(row=11,columnspan=2,sticky='ew'); self.refresh=ttk.Button(b,text='Atualizar empresas',command=self.load); self.refresh.pack(side='left'); self.preview_btn=ttk.Button(b,text='Pré-visualizar (sem gravar)',command=self.preview); self.preview_btn.pack(side='left',padx=5); self.save_btn=ttk.Button(b,text='Confirmar e gravar',command=self.save,state='disabled'); self.save_btn.pack(side='left')
        self.status=tk.StringVar(); ttk.Label(f,textvariable=self.status,wraplength=750).grid(row=12,columnspan=2,sticky='w',pady=5)
        for v in self.vars.values(): v.trace_add('write',self.invalidate)
        self.after(100,self.poll); self.load()
    def close(self):
        if self.busy: messagebox.showinfo('Operação em andamento','Aguarde a conclusão.',parent=self); return
        self.destroy()
    def write(self,msg):
        self.text.configure(state='normal'); self.text.delete('1.0','end'); self.text.insert('end',msg); self.text.configure(state='disabled')
    def invalidate(self,*args):
        self.plan=None; self.write('Configure o lote e gere a prévia.'); self.controls()
    def controls(self):
        for k,w in self.widgets.items(): w.configure(state='disabled' if self.busy else ('normal' if k=='amount' else 'readonly'))
        self.refresh.configure(state='disabled' if self.busy else 'normal')
        ready=not self.busy and self.vars['company'].get() in self.companies and bool(self.machines and self.creators and self.users)
        self.preview_btn.configure(state='normal' if ready else 'disabled'); self.save_btn.configure(state='normal' if ready and self.plan is not None else 'disabled')
    def task(self,kind,fn):
        self.busy=True; self.controls()
        def run():
            try: self.queue.put((kind,fn(),None))
            except Exception as e: self.queue.put((kind,None,e))
        Thread(target=run,daemon=False).start()
    def load(self):
        self.plan=None; self.status.set('Consultando organizações…'); self.task('companies',lambda:list_companies(self.cfg))
    def clear_targets(self):
        self.machines={}; self.users={}; self.creators={}; self.plan=None
        for k in ('machine','creator','responsible'):
            self.widgets[k].configure(values=[]); self.vars[k].set('')
    def load_targets(self):
        self.clear_targets(); company=self.companies.get(self.vars['company'].get())
        if company is not None: self.status.set('Consultando máquinas e usuários…'); self.task('targets',lambda:list_targets(self.cfg,company))
    def preview(self):
        v={k:x.get() for k,x in self.vars.items()}
        try:
            mids=tuple(self.machines.values()) if v['machine']==ALL else (self.machines.get(v['machine']),)
            p=make_order_plan(self.companies.get(v['company']),mids,self.creators.get(v['creator']),self.users.get(v['responsible']),int(v['amount']),v['kind'],v['priority'],v['status'])
        except ValueError as e: messagebox.showerror('Parâmetros inválidos',str(e),parent=self); return
        self.plan=p; self.preview_text='\n'.join([f'PRÉVIA — {len(p.orders)} OS | organização {p.company} | criador {p.creator} | responsável {p.responsible}. Nenhuma gravação.','Código e datas definidos na gravação pelo relógio do banco.']+[f'Máquina {o.machine} | {o.title} | {o.priority} | {o.status} | {o.hours}h | prevista em +{o.days} dia(s)' for o in p.orders]); self.write(self.preview_text); self.status.set('Revise as ordens antes de confirmar.'); self.controls()
    def save(self):
        p=self.plan
        if p is None or self.busy: return
        if not messagebox.askyesno('Confirmar gravação',f'Gravar {len(p.orders)} OS fictícias na organização {p.company}, banco {self.cfg.database}?',parent=self): return
        self.plan=None; self.status.set('Gravando transação…'); self.task('save',lambda:run_orders(self.cfg,p,lambda:apply_orders(self.cfg,p)))
    def poll(self):
        try: kind,result,error=self.queue.get_nowait()
        except Empty: pass
        else:
            self.busy=False
            if error:
                if kind in ('companies','targets'):
                    self.clear_targets()
                    if kind=='companies': self.companies={}; self.widgets['company'].configure(values=[]); self.vars['company'].set('')
                msg=str(error) if isinstance(error,(ValueError,CommitUncertain)) else f'Falha ({type(error).__name__}; código {getattr(error,"errno",None) or "indisponível"}). Confira o banco antes de repetir.'
                self.write(msg); self.status.set(msg)
            elif kind=='companies':
                self.companies={f'{i} — {name}':i for i,name in result}; self.widgets['company'].configure(values=list(self.companies)); self.vars['company'].set(next(iter(self.companies),'')); self.load_targets()
            elif kind=='targets':
                machines,users=result; self.machines={f'{i} — {name}':i for i,name in machines}; self.users={f'{i} — {name} ({role})':i for i,name,role in users}; self.creators={f'{i} — {name} ({role})':i for i,name,role in users if role in ('admin','supervisor')}
                for k,items in [('machine',[ALL,*self.machines]),('creator',list(self.creators)),('responsible',list(self.users))]: self.widgets[k].configure(values=items); self.vars[k].set(next(iter(items),''))
                self.status.set('Selecione os vínculos e gere a prévia.' if self.machines and self.creators and self.users else 'A organização precisa de máquina, criador ativo e responsável ativo.')
            else:
                self.write('COMMIT confirmado.\n'+ '\n'.join(f'{code} | ID {i}' for i,code in result)+'\n\n'+self.preview_text); self.status.set(f'{len(result)} ordens criadas.')
            self.controls()
        self.after(100,self.poll)
