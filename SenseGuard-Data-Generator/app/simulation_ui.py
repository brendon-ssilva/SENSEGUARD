from app.activity import run_session
import tkinter as tk
from tkinter import ttk, messagebox
from queue import Queue, Empty
from threading import Thread, Event
from app.generator import list_companies, CommitUncertain
from app.readings import list_sensors, apply_readings
from app.simulation import Simulation, run_simulation

class SimulationWindow(tk.Toplevel):
    def __init__(self,parent,config):
        super().__init__(parent); self.cfg=config; self.queue=Queue(); self.busy=False; self.running=False; self.stop=Event(); self.companies={}; self.sensors=(); self.total=0; self.alerts=0
        self.title('SenseGuard • Simulação contínua 0.5'); self.geometry('900x720'); self.minsize(650,570); self.transient(parent); self.grab_set(); self.protocol('WM_DELETE_WINDOW',self.close)
        f=ttk.Frame(self,padding=16); f.pack(fill='both',expand=True); f.columnconfigure(1,weight=1); f.rowconfigure(6,weight=1)
        ttk.Label(f,text='Simulação contínua de sensores',style='Title.TLabel').grid(row=0,columnspan=3,sticky='w')
        ttk.Label(f,text=f'Banco: {config.database} • origem importacao • dados fictícios').grid(row=1,columnspan=3,sticky='w',pady=5)
        self.company=tk.StringVar(); self.seconds=tk.StringVar(value='5'); self.cycles=tk.StringVar(value='10'); self.rate=tk.StringVar(value='10')
        ttk.Label(f,text='Organização').grid(row=2,column=0,sticky='w'); self.company_box=ttk.Combobox(f,textvariable=self.company,state='readonly'); self.company_box.grid(row=2,column=1,sticky='ew'); self.company_box.bind('<<ComboboxSelected>>',lambda e:self.load())
        self.refresh=ttk.Button(f,text='Atualizar sensores',command=self.load); self.refresh.grid(row=2,column=2,padx=5)
        group=ttk.Frame(f); group.grid(row=3,columnspan=3,sticky='ew'); self.entries=[]
        for i,(label,var) in enumerate((('Intervalo (segundos)',self.seconds),('Máximo de ciclos',self.cycles),('Alertas (%)',self.rate))):
            g=ttk.Frame(group,padding=4); g.grid(row=0,column=i,sticky='ew'); group.columnconfigure(i,weight=1); ttk.Label(g,text=label).pack(anchor='w'); e=ttk.Entry(g,textvariable=var); e.pack(fill='x'); self.entries.append(e)
        ttk.Label(f,text='Sensores (Ctrl/Shift para selecionar vários)').grid(row=4,columnspan=2,sticky='w'); self.all_button=ttk.Button(f,text='Selecionar todos',command=self.select_all); self.all_button.grid(row=4,column=2)
        self.listbox=tk.Listbox(f,selectmode='extended',exportselection=False,height=7,bg='#1e2938',fg='#e5e7eb',selectbackground='#287c70'); self.listbox.grid(row=5,columnspan=2,sticky='nsew'); scroll=ttk.Scrollbar(f,command=self.listbox.yview); scroll.grid(row=5,column=2,sticky='ns'); self.listbox.configure(yscrollcommand=scroll.set); self.listbox.bind('<<ListboxSelect>>',lambda e:self.controls())
        self.text=tk.Text(f,bg='#1e2938',fg='#e5e7eb',font=('Consolas',10),state='disabled',height=10); self.text.grid(row=6,columnspan=2,sticky='nsew',pady=8); scroll=ttk.Scrollbar(f,command=self.text.yview); scroll.grid(row=6,column=2,sticky='ns'); self.text.configure(yscrollcommand=scroll.set)
        b=ttk.Frame(f); b.grid(row=7,columnspan=3,sticky='ew'); self.start_button=ttk.Button(b,text='Iniciar simulação',command=self.start); self.start_button.pack(side='left'); self.stop_button=ttk.Button(b,text='Interromper',command=self.request_stop); self.stop_button.pack(side='left',padx=8)
        self.msg=tk.StringVar(value='Carregando organizações…'); ttk.Label(f,textvariable=self.msg,wraplength=620).grid(row=8,columnspan=3,sticky='w',pady=5)
        self.after(100,self.poll); self.task('companies',lambda:list_companies(config))
    def log(self,text,clear=False):
        self.text.configure(state='normal')
        if clear: self.text.delete('1.0','end')
        self.text.insert('end',text+'\n'); self.text.see('end'); self.text.configure(state='disabled')
    def controls(self):
        disabled=self.busy or self.running; state='disabled' if disabled else 'normal'
        self.company_box.configure(state='disabled' if disabled else 'readonly')
        for w in [self.refresh,self.all_button,self.listbox,*self.entries]: w.configure(state=state)
        self.refresh.configure(state='normal' if not disabled and self.company.get() in self.companies else 'disabled')
        self.start_button.configure(state='normal' if not disabled and self.listbox.curselection() else 'disabled')
        self.stop_button.configure(state='normal' if self.running and not self.stop.is_set() else 'disabled')
    def select_all(self):
        self.listbox.selection_set(0,'end'); self.controls()
    def task(self,kind,fn):
        self.busy=True; self.controls()
        def worker():
            try: self.queue.put((kind,fn(),None))
            except Exception as exc: self.queue.put((kind,None,exc))
        Thread(target=worker,daemon=False).start()
    def load(self):
        if self.busy or self.running: return
        self.sensors=(); self.listbox.delete(0,'end'); company=self.companies.get(self.company.get())
        if company is not None: self.task('sensors',lambda:list_sensors(self.cfg,company))
    def start(self):
        if self.busy or self.running: return
        try:
            spec=Simulation(self.companies.get(self.company.get()),tuple(self.sensors[i] for i in self.listbox.curselection()),int(self.seconds.get()),int(self.cycles.get()),int(self.rate.get())); spec.validate()
        except ValueError as exc: messagebox.showerror('Parâmetros inválidos',str(exc),parent=self); return
        if not messagebox.askyesno('Confirmar simulação',f'Organização {spec.company}: até {len(spec.sensors)*spec.cycles} leituras fictícias, {spec.cycles} ciclos, intervalo de {spec.seconds}s e {spec.rate}% de alertas.\nCada ciclo confirmado permanece no banco mesmo após parar. Pause outros produtores de leituras. Continuar?',parent=self): return
        self.total=0; self.alerts=0; self.stop.clear(); self.running=True; self.log('SIMULAÇÃO INICIADA',clear=True); self.msg.set('Executando…'); self.controls()
        self.task('finished',lambda:run_session(self.cfg,spec,self.stop,lambda cycle:self.queue.put(('cycle',cycle,None)),run_simulation,apply_readings))
    def request_stop(self):
        self.stop.set(); self.msg.set('Parada solicitada. A transação atual pode terminar.'); self.controls()
    def close(self):
        if self.running: self.request_stop(); return
        if self.busy: return
        self.destroy()
    def poll(self):
        try:
            while True:
                kind,result,error=self.queue.get_nowait()
                if kind=='cycle':
                    self.total+=result.readings; self.alerts+=result.alerts
                    self.log(f'Ciclo {result.number} | {result.at} | {result.readings} leituras | {result.alerts} alertas | {result.updated} sensores atualizados')
                    if not self.stop.is_set(): self.msg.set(f'Confirmadas: {self.total} leituras • {self.alerts} alertas')
                    continue
                self.busy=False
                if kind=='finished': self.running=False
                if error:
                    msg=str(error) if isinstance(error,(ValueError,CommitUncertain)) else f'Falha ({type(error).__name__}; código {getattr(error,"errno",None) or "indisponível"}).'
                    self.log(msg); self.msg.set(f'Interrompido. {self.total} leituras confirmadas nesta sessão. Confira o banco antes de repetir.')
                elif kind=='companies':
                    self.companies={f'{i} — {n}':i for i,n in result}; self.company_box.configure(values=list(self.companies)); self.company.set(next(iter(self.companies),'')); self.load()
                elif kind=='sensors':
                    _,self.sensors=result; self.listbox.configure(state='normal')
                    for s in self.sensors: self.listbox.insert('end',f'#{s.id} | {s.name} | {s.kind} | {s.low}–{s.high} {s.unit or ""}')
                    self.msg.set('Selecione sensores e configure a simulação.')
                elif kind=='finished':
                    self.log(f'Encerrada: {result} ciclos confirmados, {self.total} leituras, {self.alerts} alertas.'); self.msg.set('Simulação encerrada. Os ciclos confirmados foram preservados.')
                self.controls()
        except Empty: pass
        self.after(100,self.poll)
