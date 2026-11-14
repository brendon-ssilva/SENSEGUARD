<?php

declare(strict_types=1);

namespace SenseGuard\Domain;

/**
 * Declaração única dos campos de cada entidade: chave da API => coluna do banco,
 * tipo e regras de validação. Alimenta tanto a validação de entrada quanto a
 * montagem da resposta (ver Validation\Fields).
 *
 * Tipos: text | date | datetime | number | enum.
 */
final class Specs
{
    public const MACHINE = [
        'name' => ['col' => 'nome', 'type' => 'text', 'required' => true, 'max' => 100, 'label' => 'nome da máquina'],
        'serialNumber' => ['col' => 'num_serial', 'type' => 'text', 'max' => 50, 'label' => 'número de série'],
        'model' => ['col' => 'modelo', 'type' => 'text', 'max' => 100, 'label' => 'modelo'],
        'manufacturer' => ['col' => 'fabricante', 'type' => 'text', 'max' => 100, 'label' => 'fabricante'],
        'location' => ['col' => 'localizacao', 'type' => 'text', 'max' => 100, 'label' => 'localização'],
        'department' => ['col' => 'departamento', 'type' => 'text', 'max' => 100, 'label' => 'departamento'],
        'status' => ['col' => 'status', 'type' => 'enum', 'enum' => MachineStatus::class, 'default' => 'operando', 'label' => 'status da máquina'],
        'installDate' => ['col' => 'data_instalacao', 'type' => 'date', 'label' => 'instalação'],
        'lastMaintenance' => ['col' => 'ultima_manutencao', 'type' => 'date', 'label' => 'última manutenção'],
        'nextMaintenance' => ['col' => 'proxima_manutencao', 'type' => 'date', 'label' => 'próxima manutenção'],
    ];

    public const SENSOR = [
        'name' => ['col' => 'nome', 'type' => 'text', 'required' => true, 'max' => 50, 'label' => 'nome do sensor'],
        'type' => ['col' => 'tipo', 'type' => 'enum', 'enum' => SensorType::class, 'label' => 'tipo de sensor'],
        'unit' => ['col' => 'unidade', 'type' => 'text', 'max' => 20, 'label' => 'unidade'],
        'location' => ['col' => 'localizacao', 'type' => 'text', 'max' => 100, 'label' => 'localização'],
        'minThreshold' => ['col' => 'min_limite', 'type' => 'number', 'min' => -1000000000, 'max' => 1000000000, 'default' => 0, 'label' => 'limite mínimo'],
        'maxThreshold' => ['col' => 'max_limite', 'type' => 'number', 'min' => -1000000000, 'max' => 1000000000, 'default' => 100, 'label' => 'limite máximo'],
        'currentValue' => ['col' => 'valor_atual', 'type' => 'number', 'min' => -1000000000, 'max' => 1000000000, 'default' => 0, 'label' => 'leitura atual'],
        'status' => ['col' => 'status', 'type' => 'enum', 'enum' => SensorStatus::class, 'default' => 'online', 'label' => 'status do sensor'],
        'lastReadingAt' => ['col' => 'ultima_leitura', 'type' => 'datetime', 'label' => 'última leitura'],
    ];

    public const ORDER = [
        'title' => ['col' => 'titulo', 'type' => 'text', 'required' => true, 'max' => 150, 'label' => 'título da ordem'],
        'description' => ['col' => 'descricao', 'type' => 'text', 'max' => 15000, 'label' => 'descrição'],
        'type' => ['col' => 'tipo', 'type' => 'enum', 'enum' => OrderType::class, 'default' => 'preventiva', 'label' => 'tipo de manutenção'],
        'priority' => ['col' => 'prioridade', 'type' => 'enum', 'enum' => OrderPriority::class, 'default' => 'baixa', 'label' => 'prioridade'],
        'status' => ['col' => 'status', 'type' => 'enum', 'enum' => OrderStatus::class, 'default' => 'aberta', 'label' => 'status da ordem'],
        'estimatedHours' => ['col' => 'horas_estimadas', 'type' => 'number', 'min' => 0, 'max' => 100000, 'default' => 2, 'label' => 'horas estimadas'],
        'scheduledFor' => ['col' => 'data_prevista', 'type' => 'date', 'label' => 'data prevista'],
    ];

    public const USER = [
        'name' => ['col' => 'nome', 'type' => 'text', 'required' => true, 'max' => 100, 'label' => 'nome'],
        'email' => ['col' => 'email', 'type' => 'text', 'required' => true, 'max' => 100, 'label' => 'e-mail'],
        'phone' => ['col' => 'telefone', 'type' => 'text', 'max' => 20, 'label' => 'telefone'],
        'role' => ['col' => 'role', 'type' => 'enum', 'enum' => UserRole::class, 'default' => 'tecnico', 'label' => 'perfil do usuário'],
        'status' => ['col' => 'status', 'type' => 'enum', 'enum' => UserStatus::class, 'default' => 'ativo', 'label' => 'status do usuário'],
    ];
}
