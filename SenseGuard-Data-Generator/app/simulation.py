"""Simulação finita, com um commit por ciclo e parada cooperativa."""
from dataclasses import dataclass
from random import Random
from app.assets import valid_id
from app.readings import list_sensors, make_reading_plan, apply_readings, validate_sensor

@dataclass(frozen=True)
class Simulation:
    company: int
    sensors: tuple
    seconds: int
    cycles: int
    rate: int

    def validate(self):
        if not valid_id(self.company) or not 1 <= len(self.sensors) <= 100 or len({s.id for s in self.sensors}) != len(self.sensors):
            raise ValueError('Selecione de 1 a 100 sensores distintos.')
        for sensor in self.sensors:
            validate_sensor(sensor)
        for value, low, high, label in ((self.seconds,2,300,'Intervalo em segundos'),(self.cycles,1,300,'Ciclos'),(self.rate,0,100,'Alertas (%)')):
            if type(value) is not int or not low <= value <= high:
                raise ValueError(f'{label}: {low} a {high}.')
        if len(self.sensors)*self.cycles > 5000:
            raise ValueError('Máximo de 5000 leituras por sessão.')

@dataclass(frozen=True)
class Cycle:
    number: int
    at: object
    readings: int
    alerts: int
    updated: int


def cycle_rate(size, index, rate):
    """Distribui arredondamento ao longo da sessão, não por ciclo isolado."""
    goal = (size*index*rate+50)//100 - (size*(index-1)*rate+50)//100
    return next(p for p in range(101) if (size*p+50)//100 == goal)


def run_simulation(config, spec, stop, report, *, load=list_sensors, apply=apply_readings, rng=None):
    config.validate(); spec.validate()
    rng = rng or Random()
    previous = None
    completed = 0
    for i in range(1,spec.cycles+1):
        if stop.is_set(): break
        now, fresh = load(config,spec.company)
        by_id = {s.id:s for s in fresh}
        if any(by_id.get(s.id)!=s for s in spec.sensors):
            raise ValueError('Sensor removido ou alterado. Atualize a seleção antes de reiniciar.')
        if previous is not None and now <= previous:
            raise ValueError('Relógio do banco não avançou. Simulação interrompida sem novo ciclo.')
        plan = make_reading_plan(spec.company,spec.sensors,1,1,cycle_rate(len(spec.sensors),i,spec.rate),now,rng)
        if stop.is_set(): break
        n,alerts,updated = apply(config,plan)
        completed += 1; previous = now
        report(Cycle(i,now,n,alerts,updated))
        if i < spec.cycles and stop.wait(spec.seconds): break
    return completed
