from app.activity import run_readings
import tkinter as tk
from tkinter import ttk, messagebox
from queue import Queue, Empty
from threading import Thread
from app.generator import list_companies, CommitUncertain
from app.readings import list_sensors, make_reading_plan, apply_readings, status

class ReadingsWindow(tk.Toplevel):
    def __init__(self,parent,config):
        super().__init__(parent); self.cfg=config; self.plan=None; self.busy=False; self.queue=Queue(); self.companies={}; self.sensors=(); self.end=None
        self.title('SenseGuard • Leituras históricas 0.4'); self.geometry('900x750'); self.minsize(680,610); self.transient(parent); self.grab_set(); self.protocol('WM_DELETE_WINDOW',self.close)
        f=ttk.Frame(self,padding=16); f.pack(fill='both',expand=True); f.columnconfigure(1,weight=1); f.rowconfigure(7,weight=1)
        ttk.Label(f,text='Gerar leituras históricas',style='Title.TLabel').grid(row=0,columnspan=3,sticky='w')
        ttk.Label(f,text=f'Banco: {config.database} • origem importacao • dados fictícios').grid(row=1,columnspan=3,sticky='w',pady=5)
        self.company=tk.StringVar(); self.count=tk.StringVar(value='24'); self.interval=tk.StringVar(value='60'); self.rate=tk.StringVar(value='10')
        ttk.Label(f,text='Organização').grid(row=2,column=0,sticky='w'); self.company_box=ttk.Combobox(f,textvariable=self.company,state='readonly'); self.company_box.grid(row=2,column=1,sticky='ew',pady=3); self.company_box.bind('<<ComboboxSelected>>',lambda e:self.load_sensors())
        self.refresh=ttk.Button(f,text='Atualizar sensores e horário',command=self.load_sensors); self.refresh.grid(row=2,column=2,padx=5)
        group=ttk.Frame(f); group.grid(row=3,columnspan=3,sticky='ew'); self.entries=[]
        for i,(label,var) in enumerate((('Leituras por sensor',self.count),('Intervalo (minutos)',self.interval),('Alertas (%)',self.rate))):
            g=ttk.Frame(group,padding=4); g.grid(row=0,column=i,sticky='ew'); group.columnconfigure(i,weight=1); ttk.Label(g,text=label).pack(anchor='w'); e=ttk.Entry(g,textvariable=var,width=10); e.pack(fill='x'); self.entries.append(e)
        ttk.Label(f,text='Selecione os sensores (Ctrl/Shift para múltiplos)').grid(row=4,columnspan=2,sticky='w',pady=4)
        self.all_button=ttk.Button(f,text='Selecionar todos',command=self.select_all); self.all_button.grid(row=4,column=2,sticky='e')
        self.listbox=tk.Listbox(f,selectmode='extended',exportselection=False,height=7,bg='#1e2938',fg='#e5e7eb',selectbackground='#287c70'); self.listbox.grid(row=5,columnspan=2,sticky='nsew'); scroll=ttk.Scrollbar(f,command=self.listbox.yview); scroll.grid(row=5,column=2,sticky='ns'); self.listbox.configure(yscrollcommand=scroll.set); self.listbox.bind('<<ListboxSelect>>',self.invalidate)
        self.clock=tk.StringVar(value='Horário final: aguardando conexão'); ttk.Label(f,textvariable=self.clock).grid(row=6,columnspan=3,sticky='w',pady=5)
        self.text=tk.Text(f,wrap='none',bg='#1e2938',fg='#e5e7eb',font=('Consolas',10),state='disabled',height=9); self.text.grid(row=7,columnspan=2,sticky='nsew'); s=ttk.Scrollbar(f,command=self.text.yview); s.grid(row=7,column=2,sticky='ns'); self.text.configure(yscrollcommand=s.set)
        b=ttk.Frame(f); b.grid(row=8,columnspan=3,sticky='ew',pady=8); self.preview_button=ttk.Button(b,text='Pré-visualizar (sem gravar)',command=self.preview); self.preview_button.pack(side='left'); self.save_button=ttk.Button(b,text='Confirmar e gravar',command=self.save); self.save_button.pack(side='left',padx=8)
        self.msg=tk.StringVar(); ttk.Label(f,textvariable=self.msg,wraplength=650).grid(row=9,columnspan=3,sticky='w')
        for v in (self.count,self.interval,self.rate): v.trace_add('write',self.invalidate)
        self.after(100,self.poll); self.task('companies',lambda:list_companies(self.cfg))

    def close(self):
        if self.busy: messagebox.showinfo('Operação em andamento','Aguarde a conclusão da operação.',parent=self); return
        self.destroy()
    def write(self,text):
        self.text.configure(state='normal'); self.text.delete('1.0','end'); self.text.insert('end',text); self.text.configure(state='disabled')
    def invalidate(self,*args):
        self.plan=None; self.write('Selecione os sensores e gere uma nova prévia.'); self.controls()
    def controls(self):
        state='disabled' if self.busy else 'normal'; self.company_box.configure(state='disabled' if self.busy else 'readonly')
        for w in [self.refresh,self.all_button,self.listbox,*self.entries]: w.configure(state=state)
        self.refresh.configure(state='normal' if not self.busy and self.company.get() in self.companies else 'disabled')
        self.preview_button.configure(state='normal' if not self.busy and self.end is not None and self.listbox.curselection() else 'disabled')
        self.save_button.configure(state='normal' if not self.busy and self.plan is not None else 'disabled')
    def select_all(self):
        self.listbox.selection_set(0,'end'); self.invalidate()
    def task(self,kind,fn):
        self.busy=True; self.controls()
        def run():
            try: self.queue.put((kind,fn(),None))
            except Exception as exc: self.queue.put((kind,None,exc))
        Thread(target=run,daemon=False).start()
    def load_sensors(self):
        if self.busy: return
        self.end=None; self.sensors=(); self.plan=None; self.listbox.delete(0,'end'); self.clock.set('Horário final: consultando banco…'); self.invalidate()
        company=self.companies.get(self.company.get())
        if company is not None: self.task('sensors',lambda:list_sensors(self.cfg,company))
    def preview(self):
        try:
            p=make_reading_plan(self.companies.get(self.company.get()),[self.sensors[i] for i in self.listbox.curselection()],int(self.count.get()),int(self.interval.get()),int(self.rate.get()),self.end)
        except ValueError as exc: messagebox.showerror('Parâmetros inválidos',str(exc),parent=self); return
        self.plan=p; by_id={s.id:s for s in p.sensors}; alerts=sum(status(r.value,by_id[r.sensor].low,by_id[r.sensor].high)=='alerta' for r in p.rows)
        lines=[f'PRÉVIA: {len(p.rows)} leituras | {alerts} fora dos limites | organização {p.company}',f'Período: {min(r.at for r in p.rows)} a {max(r.at for r in p.rows)}','Nenhuma gravação até a confirmação.','']
        for r in p.rows:
            s=by_id[r.sensor]; lines.append(f'{r.at} | #{r.sensor} {s.kind} | {r.value} {s.unit or ""} | {status(r.value,s.low,s.high)}')
        self.write('\n'.join(lines)); self.msg.set('Revise os valores e o período antes de gravar.'); self.controls()
    def save(self):
        p=self.plan
        if self.busy or p is None: return
        if not messagebox.askyesno('Confirmar gravação',f'Gravar {len(p.rows)} leituras fictícias para a organização {p.company} em {self.cfg.database}?\nPausar outros produtores de leituras durante o teste.',parent=self): return
        self.plan=None; self.msg.set('Gravando transação…'); self.task('save',lambda:run_readings(self.cfg,p,lambda:apply_readings(self.cfg,p)))
    def poll(self):
        try: kind,result,error=self.queue.get_nowait()
        except Empty: pass
        else:
            self.busy=False
            if error:
                msg=str(error) if isinstance(error,(ValueError,CommitUncertain)) else f'Falha ({type(error).__name__}; código {getattr(error,"errno",None) or "indisponível"}). Confira o banco antes de repetir.'
                self.write(msg); self.msg.set(msg)
                if kind=='sensors': self.end=None; self.clock.set('Horário final indisponível.')
            elif kind=='companies':
                self.companies={f'{i} — {n}':i for i,n in result}; self.company_box.configure(values=list(self.companies)); self.company.set(next(iter(self.companies),'')); self.load_sensors()
            elif kind=='sensors':
                self.end,self.sensors=result
                self.listbox.configure(state="normal")
                for s in self.sensors: self.listbox.insert('end',f'#{s.id} | {s.name} | {s.kind} | {s.low}–{s.high} {s.unit or ""}')
                self.clock.set(f'Horário final do lote (banco): {self.end}'); self.msg.set('Selecione sensores e gere a prévia. Atualize para mudar o horário final.')
            else:
                n,alerts,updated=result; self.write(f'COMMIT confirmado.\nLeituras gravadas: {n}\nFora dos limites: {alerts}\nSensores com leitura atual atualizada: {updated}'); self.msg.set('Concluído. Atualize sensores e horário antes de um novo lote.'); self.end=None; self.clock.set('Atualize sensores e horário para novo lote.')
            self.controls()
        self.after(100,self.poll)
