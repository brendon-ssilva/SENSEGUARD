<?php
// api.php - API REST utilizando data.json como armazenamento
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataFile = __DIR__ . '/data.json';

// Função para ler o ficheiro JSON
function readData($file) {
    if (!file_exists($file)) {
        return ['users' => [], 'machines' => [], 'sensors' => [], 'orders' => []];
    }
    $json = file_get_contents($file);
    return json_decode($json, true) ?? ['users' => [], 'machines' => [], 'sensors' => [], 'orders' => []];
}

// Função para salvar o ficheiro JSON
function saveData($file, $data) {
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$method = $_SERVER['REQUEST_METHOD'];
$entity = $_GET['entity'] ?? '';
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

// Ler o corpo da requisição
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? $_POST;

$data = readData($dataFile);

// Rota principal para carregar tudo
if ($entity === 'all' && $method === 'GET') {
    echo json_encode($data);
    exit();
}

// Validar se a entidade existe
if (!in_array($entity, ['machines', 'sensors', 'orders', 'users'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Entidade inválida']);
    exit();
}

switch ($method) {
    case 'GET':
        if ($id) {
            $item = array_filter($data[$entity], fn($row) => $row['id'] === $id);
            if (!empty($item)) {
                echo json_encode(array_values($item)[0]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Registo não encontrado']);
            }
        } else {
            echo json_encode($data[$entity]);
        }
        break;

    case 'POST': // CREATE
        // Gerar um novo ID único
        $maxId = 0;
        foreach ($data[$entity] as $row) {
            if ($row['id'] > $maxId) $maxId = $row['id'];
        }
        $newItem = $input;
        $newItem['id'] = $maxId + 1;

        $data[$entity][] = $newItem;
        saveData($dataFile, $data);

        http_response_code(201);
        echo json_encode($newItem);
        break;

    case 'PUT': // UPDATE
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID é necessário para atualizar']);
            exit();
        }

        $foundIndex = -1;
        foreach ($data[$entity] as $index => $row) {
            if ($row['id'] === $id) {
                $foundIndex = $index;
                break;
            }
        }

        if ($foundIndex !== -1) {
            // Atualizar os dados mantendo o mesmo ID
            $updatedItem = array_merge($data[$entity][$foundIndex], $input);
            $updatedItem['id'] = $id; // Garantir id inalterado
            $data[$entity][$foundIndex] = $updatedItem;
            
            saveData($dataFile, $data);
            echo json_encode($updatedItem);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Registo não encontrado']);
        }
        break;

    case 'DELETE': // DELETE
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID é necessário para eliminar']);
            exit();
        }

        $initialCount = count($data[$entity]);
        $data[$entity] = array_values(array_filter($data[$entity], fn($row) => $row['id'] !== $id));

        if (count($data[$entity]) < $initialCount) {
            saveData($dataFile, $data);
            echo json_encode(['success' => true, 'id' => $id]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Registo não encontrado']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido']);
        break;
}