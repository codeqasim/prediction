<?php

use Medoo\Medoo;
use AppRouter\Router;

require_once 'vendor/autoload.php';
require_once 'functions.php';

header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');

$env = parse_ini_file('.env');

$root=(isset($_SERVER['HTTPS']) ? "https://" : "http://").$_SERVER['HTTP_HOST'];
$root.= str_replace(basename($_SERVER['SCRIPT_NAME']), '', $_SERVER['SCRIPT_NAME']);
define('root', $root);

// Environment & Constants
$GLOBALS['db'] = $db = new Medoo([
'type' => $env['DB_TYPE'] ?? 'mysql',
'host' => $env['DB_HOST'] ?? 'localhost',
'database' => $env['DB_DATABASE'],
'username' => $env['DB_USERNAME'],
'password' => $env['DB_PASSWORD'],
]);
$db=($GLOBALS['db']);

$router = new Router(function ($method, $path, $statusCode) {
    http_response_code($statusCode);
    echo 'Error ' . $statusCode;
});

$router->get('/', function () use ($router, $db) {
   echo "API SERVER ACTIVE";
});

require_once 'routes.php';

$router->dispatchGlobal();