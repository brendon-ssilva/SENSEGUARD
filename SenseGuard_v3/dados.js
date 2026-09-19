{
  "users": [
    {
      "id": 1,
      "name": "Carlos Silva",
      "email": "carlos@maintpro.com",
      "role": "Técnico Sénior",
      "avatar_color": "#58a6ff"
    },
    {
      "id": 2,
      "name": "Ana Costa",
      "email": "ana@maintpro.com",
      "role": "Engenheira de Manutenção",
      "avatar_color": "#a371f7"
    }
  ],
  "machines": [
    {
      "id": 1,
      "code": "M-01",
      "name": "Torno CNC Haas ST-20",
      "location": "Setor A - Usinagem",
      "status": "operacional",
      "last_maintenance": "2026-08-15",
      "next_maintenance": "2026-10-15"
    },
    {
      "id": 2,
      "code": "M-02",
      "name": "Prensa Hidráulica 200T",
      "location": "Setor B - Estampagem",
      "status": "alerta",
      "last_maintenance": "2026-07-10",
      "next_maintenance": "2026-09-20"
    }
  ],
  "sensors": [
    {
      "id": 1,
      "machine_id": 1,
      "code": "TEMP-01",
      "type": "Temperatura",
      "unit": "°C",
      "value": 45.5,
      "min_value": 10.0,
      "max_value": 80.0,
      "status": "normal"
    },
    {
      "id": 2,
      "machine_id": 1,
      "code": "VIB-01",
      "type": "Vibração",
      "unit": "mm/s",
      "value": 2.1,
      "min_value": 0.0,
      "max_value": 5.0,
      "status": "normal"
    },
    {
      "id": 3,
      "machine_id": 2,
      "code": "PRES-01",
      "type": "Pressão",
      "unit": "Bar",
      "value": 185.0,
      "min_value": 50.0,
      "max_value": 200.0,
      "status": "alerta"
    }
  ],
  "orders": [
    {
      "id": 1,
      "code": "OS-101",
      "title": "Troca de óleo e calibração",
      "machine_id": 2,
      "assigned_to": 1,
      "priority": "alta",
      "status": "em_andamento",
      "description": "Verificar vazamento no pistão principal."
    }
  ]
}