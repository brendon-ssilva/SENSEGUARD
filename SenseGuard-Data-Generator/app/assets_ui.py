from app.activity import run_assets
import tkinter as tk
from tkinter import ttk, messagebox
from queue import Queue, Empty
from threading import Thread
from app.generator import list_companies, CommitUncertain
from app.assets import PROFILES, MACHINE_TYPES, make_asset_plan, list_machines, apply_assets

NEW='Novas máquinas'

class AssetsWindow(tk.Toplevel):
    def __init__(self,parent,config):
        super().__init__(parent)
        self.cfg=config; self.plan=None; self.busy=False; self.queue=Queue(); self.companies={}; self.machines={}
        self.title('SenseGuard • Máquinas e sensores 0.3'); self.geometry('920x700'); self.minsize(720,610)
        self.transient(parent); self.grab_set(); self.protocol('WM_DELETE_WINDOW',self.close)
        f=ttk.Frame(self,padding=16); f.pack(fill='both',expand=True); f.columnconfigure(1,weight=1); f.rowconfigure(8,weight=1)
        ttk.Label(f,text='Gerar máquinas e sensores',style='Title.TLabel').grid(row=0,columnspan=3,sticky='w')
        ttk.Label(f,text=f'Banco: {config.database} • dados fictícios • sensores inicialmente offline').grid(row=1,columnspan=3,sticky='w',pady=5)
        self.company=tk.StringVar(); self.destination=tk.StringVar(value=NEW); self.kind=tk.StringVar(value=MACHINE_TYPES[0]); self.amount=tk.StringVar(value='2')
        ttk.Label(f,text='Organização').grid(row=2,column=0,sticky='w'); self.company_box=ttk.Combobox(f,textvariable=self.company,state='readonly'); self.company_box.grid(row=2,column=1,sticky='ew',pady=3); self.company_box.bind('<<ComboboxSelected>>',lambda e:self.load_machines())
        self.refresh=ttk.Button(f,text='Atualizar empresas',command=self.load); self.refresh.grid(row=2,column=2,padx=5)
        ttk.Label(f,text='Destino').grid(row=3,column=0,sticky='w'); self.dest_box=ttk.Combobox(f,textvariable=self.destination,state='readonly',values=[NEW]); self.dest_box.grid(row=3,column=1,sticky='ew',pady=3)
        ttk.Label(f,text='Tipo de máquina').grid(row=4,column=0,sticky='w'); self.kind_box=ttk.Combobox(f,textvariable=self.kind,state='readonly',values=MACHINE_TYPES); self.kind_box.grid(row=4,column=1,sticky='ew',pady=3)
        ttk.Label(f,text='Novas máquinas (1–20)').grid(row=5,column=0,sticky='w'); self.amount_box=ttk.Entry(f,textvariable=self.amount); self.amount_box.grid(row=5,column=1,sticky='ew',pady=3)
        ttk.Label(f,text='Sensores por máquina (0–10 por tipo; máximo 120 no lote)').grid(row=6,columnspan=3,sticky='w',pady=5)
        group=ttk.Frame(f); group.grid(row=7,columnspan=3,sticky='ew'); self.counts={}; self.entries=[]
        for i,(kind,(_,unit,lo,hi)) in enumerate(PROFILES.items()):
            v=tk.StringVar(value='1' if kind in ('temperatura','vibracao','corrente') else '0'); self.counts[kind]=v
            block=ttk.Frame(group,padding=4); block.grid(row=i//3,column=i%3,sticky='ew'); group.columnconfigure(i%3,weight=1)
            ttk.Label(block,text=f'{kind} ({unit}) {lo}–{hi}').pack(anchor='w'); entry=ttk.Entry(block,textvariable=v,width=7); entry.pack(fill='x'); self.entries.append(entry)
        self.text=tk.Text(f,wrap='word',bg='#1e2938',fg='#e5e7eb',font=('Consolas',10),state='disabled',height=10); self.text.grid(row=8,columnspan=2,sticky='nsew',pady=8)
        scroll=ttk.Scrollbar(f,command=self.text.yview); scroll.grid(row=8,column=2,sticky='ns'); self.text.configure(yscrollcommand=scroll.set)
        b=ttk.Frame(f); b.grid(row=9,columnspan=3,sticky='ew'); self.preview_button=ttk.Button(b,text='Pré-visualizar (sem gravar)',command=self.preview); self.preview_button.pack(side='left'); self.save_button=ttk.Button(b,text='Confirmar e gravar',command=self.save,state='disabled'); self.save_button.pack(side='left',padx=8)
        self.status=tk.StringVar(); ttk.Label(f,textvariable=self.status,wraplength=760).grid(row=10,columnspan=3,sticky='w',pady=5)
        for v in (self.company,self.destination,self.kind,self.amount,*self.counts.values()): v.trace_add('write',self.invalidate)
        self.after(100,self.poll); self.load()

    def close(self):
        if self.busy: messagebox.showinfo('Operação em andamento','Aguarde a conclusão da operação.',parent=self); return
        self.destroy()

    def write(self,msg):
        self.text.configure(state='normal'); self.text.delete('1.0','end'); self.text.insert('end',msg); self.text.configure(state='disabled')

    def invalidate(self,*args):
        self.plan=None; self.save_button.configure(state='disabled'); self.write('Configure o lote e gere uma nova prévia.'); self.controls()

    def controls(self):
        state='disabled' if self.busy else 'normal'
        for w in [self.refresh,*self.entries]: w.configure(state=state)
        for w in (self.company_box,self.dest_box): w.configure(state='disabled' if self.busy else 'readonly')
        new=self.destination.get()==NEW
        self.kind_box.configure(state='readonly' if not self.busy and new else 'disabled'); self.amount_box.configure(state='normal' if not self.busy and new else 'disabled')
        self.preview_button.configure(state='normal' if not self.busy and self.company.get() in self.companies else 'disabled')
        self.save_button.configure(state='normal' if not self.busy and self.plan is not None else 'disabled')

    def task(self,kind,fn):
        self.busy=True; self.controls()
        def run():
            try: self.queue.put((kind,fn(),None))
            except Exception as exc: self.queue.put((kind,None,exc))
        Thread(target=run,daemon=False).start()

    def load(self):
        self.plan=None; self.status.set('Consultando organizações…'); self.task('companies',lambda:list_companies(self.cfg))

    def load_machines(self):
        self.plan=None; self.machines={}; self.destination.set(NEW); self.dest_box.configure(values=[NEW]); company=self.companies.get(self.company.get())
        if company is not None: self.status.set('Consultando máquinas…'); self.task('machines',lambda:list_machines(self.cfg,company))

    def preview(self):
        try:
            company=self.companies.get(self.company.get()); existing=self.machines.get(self.destination.get()); count=1 if existing is not None else int(self.amount.get())
            if self.destination.get()!=NEW and existing is None: raise ValueError('Destino inválido.')
            p=make_asset_plan(company,existing,count,self.kind.get(),{k:int(v.get()) for k,v in self.counts.items()})
        except ValueError as e: messagebox.showerror('Parâmetros inválidos',str(e),parent=self); return
        self.plan=p; lines=[f'PRÉVIA: organização {p.company} | {len(p.machines)} máquina(s) | {len(p.sensors)} sensor(es). Nenhuma gravação.']
        for i,m in enumerate(p.machines): lines.append(f'Máquina nova {i+1}: {m.name} | {m.serial} | operando | instalação {m.installed} | próxima manutenção {m.next_maintenance}')
        for s in p.sensors:
            _,unit,lo,hi=PROFILES[s.kind]; target=f'ID {s.target}' if p.existing is not None else f'nova {s.target+1}'
            lines.append(f'{target} | {s.name} | {s.kind} | {lo}–{hi} {unit} | offline')
        self.preview_text='\n'.join(lines); self.write(self.preview_text); self.status.set('Revise a prévia. Limites ilustrativos, não especificações técnicas.'); self.controls()

    def save(self):
        p=self.plan
        if p is None or self.busy: return
        if not messagebox.askyesno('Confirmar gravação',f'Gravar {len(p.machines)} máquina(s) e {len(p.sensors)} sensor(es) na organização {p.company}, banco {self.cfg.database}?',parent=self): return
        self.plan=None; self.status.set('Gravando transação…'); self.task('save',lambda:run_assets(self.cfg,p,lambda:apply_assets(self.cfg,p)))

    def poll(self):
        try: kind,result,error=self.queue.get_nowait()
        except Empty: pass
        else:
            self.busy=False
            if error:
                if kind in ('companies','machines'):
                    if kind=='companies': self.companies={}; self.company_box.configure(values=[]); self.company.set('')
                    self.machines={}; self.dest_box.configure(values=[NEW]); self.destination.set(NEW)
                msg=str(error) if isinstance(error,(ValueError,CommitUncertain)) else f'Falha ({type(error).__name__}; código {getattr(error,"errno",None) or "indisponível"}). Confira o banco antes de repetir.'
                self.write(msg); self.status.set(msg)
            elif kind=='companies':
                self.companies={f'{i} — {name}':i for i,name in result}; self.company_box.configure(values=list(self.companies)); self.company.set(next(iter(self.companies),'')); self.load_machines()
            elif kind=='machines':
                self.machines={f'{i} — {name}':i for i,name in result}; self.dest_box.configure(values=[NEW,*self.machines]); self.destination.set(NEW); self.status.set('Escolha o destino e gere a prévia.')
            else:
                m,s=result; self.write(f'COMMIT confirmado.\nMáquinas criadas: {len(m)} | IDs: {m}\nSensores criados: {len(s)} | IDs: {s}\n\n{self.preview_text}'); self.status.set('Concluído. Atualize as empresas para recarregar as máquinas.')
            self.controls()
        self.after(100,self.poll)
