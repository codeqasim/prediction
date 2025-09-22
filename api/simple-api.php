<?php
header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    echo json_encode([
        'status' => true,
        'message' => 'Simple API working',
        'received' => $input,
        'method' => $_SERVER['REQUEST_METHOD'],
        'uri' => $_SERVER['REQUEST_URI']
    ]);
} else {
    echo json_encode([
        'status' => false,
        'message' => 'Only POST allowed',
        'method' => $_SERVER['REQUEST_METHOD'],
        'uri' => $_SERVER['REQUEST_URI']
    ]);
}