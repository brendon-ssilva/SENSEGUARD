import tkinter as tk
from tkinter import ttk, messagebox
from queue import Queue, Empty
from threading import Thread
from app.database import Config, diagnose, diagnostic_error
from app.generator_ui import GeneratorWindow
from app.assets_ui import AssetsWindow
from app.readings_ui import ReadingsWindow
from app.simulation_ui import SimulationWindow
from app.orders_ui import OrdersWindow
from app.activity_ui import ActivityWindow
from app.activity import WARNINGS

LABELS = {'corporacao':'Organizações','usuario':'Usuários','maquina':'Máquinas','sensor':'Sensores','dados':'Leituras','ordem_servico':'Ordens de serviço'}

class Window(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title('SenseGuard Data Generator | Versão 0.7.1')
        self.geometry('860x810')
        self.minsize(660, 480)
        self.configure(bg='#101722')
        self.queue = Queue()
        self.validated_config = None
        self.vars = {k: tk.StringVar(value=v) for k,v in {'host':'127.0.0.1','port':'3306','database':'senseguard_teste','user':'root','password':''}.items()}
        style = ttk.Style(self)
        style.theme_use('clam')
        style.configure('TFrame', background='#101722')
        style.configure('TLabel', background='#101722', foreground='#e5e7eb', font=('Segoe UI',10))
        style.configure('Title.TLabel', foreground='#39d6af', font=('Segoe UI',22,'bold'))
        style.configure('TButton', padding=8, font=('Segoe UI',10,'bold'))
        style.configure('TEntry', padding=5)
        self.columnconfigure(0, weight=1)
        self.rowconfigure(0, weight=1)
        frame = ttk.Frame(self, padding=22)
        frame.grid(sticky='nsew'); frame.columnconfigure(1, weight=1); frame.rowconfigure(8,weight=1)
        ttk.Label(frame,text='SenseGuard Data Generator',style='Title.TLabel').grid(row=0,column=0,columnspan=2,sticky='w')
        ttk.Label(frame,text='Etapa 7 • Cadastros, simulação, ordens e histórico local').grid(row=1,column=0,columnspan=2,sticky='w',pady=(0,15))
        for i,(key,label) in enumerate([('host','Servidor'),('port','Porta'),('database','Banco de teste'),('user','Usuário'),('password','Senha')],2):
            ttk.Label(frame,text=label).grid(row=i,column=0,sticky='w',pady=4,padx=(0,18))
            if key=='database':
                widget=ttk.Combobox(frame,textvariable=self.vars[key],values=('senseguard_teste','senseguard_homologacao'),state='readonly')
            else:
                widget=ttk.Entry(frame,textvariable=self.vars[key],show='*' if key=='password' else '')
            widget.grid(row=i,column=1,sticky='ew',pady=4)
        self.button=ttk.Button(frame,text='Testar conexão e validar banco',command=self.start)
        self.button.grid(row=7,column=0,columnspan=2,sticky='ew',pady=12)
        self.generator_button=ttk.Button(frame,text='Gerar organizações e usuários',command=self.open_generator,state='disabled')
        self.generator_button.grid(row=9,column=0,columnspan=2,sticky='ew',pady=(8,0))
        self.assets_button=ttk.Button(frame,text='Gerar máquinas e sensores',command=self.open_assets,state='disabled')
        self.assets_button.grid(row=10,column=0,columnspan=2,sticky='ew',pady=(8,0))
        self.readings_button=ttk.Button(frame,text='Gerar leituras históricas',command=self.open_readings,state='disabled')
        self.readings_button.grid(row=11,column=0,columnspan=2,sticky='ew',pady=(8,0))
        self.simulation_button=ttk.Button(frame,text='Simular sensores continuamente',command=self.open_simulation,state='disabled')
        self.simulation_button.grid(row=12,column=0,columnspan=2,sticky='ew',pady=(8,0))
        self.orders_button=ttk.Button(frame,text='Gerar ordens de serviço',command=self.open_orders,state='disabled')
        self.orders_button.grid(row=13,column=0,columnspan=2,sticky='ew',pady=(8,0))
        ttk.Button(frame,text='Histórico de operações e exportação CSV',command=lambda:ActivityWindow(self)).grid(row=14,column=0,columnspan=2,sticky='ew',pady=(8,0))
        self.output=tk.Text(frame,bg='#1e2938',fg='#e5e7eb',insertbackground='white',font=('Consolas',10),wrap='word',relief='flat',padx=12,pady=10,state='disabled')
        self.output.grid(row=8,column=0,columnspan=2,sticky='nsew')
        self.write('Informe as credenciais do MariaDB. Nenhuma senha será gravada.\nO diagnóstico não cria, altera nem exclui registros.')
        self.after(100,self.poll)
        self.protocol('WM_DELETE_WINDOW',self.close)
        for key in ('host','port','database','user','password'):
            self.vars[key].trace_add('write',self.invalidate_connection)

    def close(self):
        if any(isinstance(w,tk.Toplevel) and w.winfo_exists() for w in self.winfo_children()):
            messagebox.showinfo('Janela em uso','Feche primeiro o módulo aberto.',parent=self); return
        self.destroy()

    def invalidate_connection(self,*args):
        self.validated_config=None
        self.generator_button.configure(state='disabled')
        self.assets_button.configure(state='disabled')
        self.readings_button.configure(state='disabled')
        self.simulation_button.configure(state='disabled')
        self.orders_button.configure(state='disabled')

    def write(self,text):
        self.output.configure(state='normal'); self.output.delete('1.0','end'); self.output.insert('end',text); self.output.configure(state='disabled')

    def open_generator(self):
        if self.validated_config is not None:
            GeneratorWindow(self,self.validated_config)

    def open_assets(self):
        if self.validated_config is not None:
            AssetsWindow(self,self.validated_config)

    def open_readings(self):
        if self.validated_config is not None:
            ReadingsWindow(self,self.validated_config)

    def open_simulation(self):
        if self.validated_config is not None:
            SimulationWindow(self,self.validated_config)

    def open_orders(self):
        if self.validated_config is not None:
            OrdersWindow(self,self.validated_config)

    def start(self):
        try:
            cfg=Config(self.vars['host'].get().strip(),int(self.vars['port'].get()),self.vars['database'].get(),self.vars['user'].get().strip(),self.vars['password'].get())
            cfg.validate()
        except ValueError as exc:
            messagebox.showerror('Configuração inválida',str(exc)); return
        self.validated_config=None
        self.generator_button.configure(state='disabled')
        self.assets_button.configure(state='disabled')
        self.readings_button.configure(state='disabled')
        self.simulation_button.configure(state='disabled')
        self.orders_button.configure(state='disabled')
        self.button.configure(state='disabled')
        self.vars['password'].set('')
        self.write('Verificando conexão e estrutura…')
        def worker():
            try:
                self.queue.put(('ok',(cfg,diagnose(cfg))))
            except ModuleNotFoundError:
                self.queue.put(('error','Dependência ausente. Execute a instalação conforme o README.'))
            except Exception as exc:
                self.queue.put(('error',diagnostic_error(exc)))
        Thread(target=worker,daemon=True).start()

    def poll(self):
        try: warning=WARNINGS.get_nowait()
        except Empty: pass
        else: messagebox.showwarning('Log local incompleto',warning,parent=self)
        try:
            kind,result=self.queue.get_nowait()
        except Empty:
            pass
        else:
            self.button.configure(state='normal')
            if kind=='error': self.write(result)
            else:
                cfg,result=result
                lines=[f'Banco: {result.database}',f'Servidor: {result.version}',f'Migrations: {result.migrations}/10',f'Views: {result.views}/3','']
                if result.issues:
                    lines+=['ESTRUTURA INCOMPATÍVEL — não gerar dados.']+result.issues
                else:
                    if (self.vars['host'].get().strip(),self.vars['port'].get(),self.vars['database'].get(),self.vars['user'].get().strip(),self.vars['password'].get()) == (cfg.host,str(cfg.port),cfg.database,cfg.user,''):
                        self.validated_config=cfg
                        self.generator_button.configure(state='normal')
                        self.assets_button.configure(state='normal')
                        self.readings_button.configure(state='normal')
                        self.simulation_button.configure(state='normal')
                        self.orders_button.configure(state='normal')
                    lines+=['ESTRUTURA BÁSICA COMPATÍVEL']+[f'{LABELS[k]}: {v}' for k,v in result.counts.items()]
                self.write('\n'.join(lines))
        self.after(100,self.poll)

if __name__=='__main__':
    Window().mainloop()
