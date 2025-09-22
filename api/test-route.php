<?php
require 'vendor/autoload.php';

$env = parse_ini_file('.env');

use Medoo\Medoo;
use AppRouter\Router;

$db = new Medoo([
    'type' => 'mysql',
    'host' => 'localhost',
    'database' => $env['DB_DATABASE'],
    'username' => $env['DB_USERNAME'],
    'password' => $env['DB_PASSWORD'],
]);

$router = new Router(function ($method, $path, $statusCode) {
    echo "Router error: $method $path -> $statusCode\n";
});

echo "Testing direct API call...\n";

// Test the route definition
$router->post('/api/users/signup', function () use ($db) {
    echo json_encode(['status' => true, 'message' => 'Direct route test works!']);
});

// Simulate POST to /api/users/signup
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['REQUEST_URI'] = '/api/users/signup';

echo "Dispatching to: " . $_SERVER['REQUEST_URI'] . "\n";
$router->dispatchGlobal();