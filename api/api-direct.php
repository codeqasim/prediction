<?php

header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'vendor/autoload.php';

use Medoo\Medoo;

$env = parse_ini_file('.env');
$db = new Medoo([
    'type' => 'mysql',
    'host' => 'localhost',
    'database' => $env['DB_DATABASE'],
    'username' => $env['DB_USERNAME'],
    'password' => $env['DB_PASSWORD'],
]);

// Handle different endpoints based on REQUEST_URI
$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST' && $uri === '/api/users/signup') {
    // Signup endpoint
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    // Validate all fields are not blank
    $required = ['email', 'password', 'username', 'first_name', 'last_name'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            echo json_encode(['status' => false, 'message' => $field . ' is required']);
            exit;
        }
    }

    // Validate email format
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => false, 'message' => 'Invalid email format']);
        exit;
    }

    // Check if email already exists
    $existingUser = $db->get('users', '*', ['email' => $input['email']]);
    if ($existingUser) {
        echo json_encode(['status' => false, 'message' => 'Email already registered']);
        exit;
    }

    // Create user data
    $userData = [
        'id' => uniqid('user_'),
        'email' => $input['email'],
        'password' => password_hash($input['password'], PASSWORD_DEFAULT),
        'username' => $input['username'],
        'first_name' => $input['first_name'],
        'last_name' => $input['last_name'],
        'status' => 1,
        'points' => 100,
    ];

    // Insert into database
    $result = $db->insert('users', $userData);

    if ($result) {
        echo json_encode([
            'status' => true,
            'message' => 'User registered successfully',
            'data' => [
                'id' => $userData['id'],
                'email' => $userData['email'],
                'username' => $userData['username'],
                'first_name' => $userData['first_name'],
                'last_name' => $userData['last_name'],
                'points' => $userData['points']
            ]
        ]);
    } else {
        echo json_encode(['status' => false, 'message' => 'Registration failed']);
    }

} elseif ($method === 'POST' && $uri === '/api/users/login') {
    // Login endpoint
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    if (empty($input['email']) || empty($input['password'])) {
        echo json_encode(['status' => false, 'message' => 'Email and password are required']);
        exit;
    }

    $user = $db->get('users', '*', ['email' => $input['email']]);

    if (!$user) {
        echo json_encode(['status' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    if (!password_verify($input['password'], $user['password'])) {
        echo json_encode(['status' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    unset($user['password']);
    echo json_encode([
        'status' => true,
        'message' => 'Login successful',
        'data' => $user
    ]);

} elseif ($method === 'GET' && $uri === '/') {
    echo json_encode(['status' => true, 'message' => 'API SERVER ACTIVE']);

} else {
    http_response_code(404);
    echo json_encode(['status' => false, 'message' => 'Endpoint not found', 'uri' => $uri, 'method' => $method]);
}