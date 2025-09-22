<?php

use Medoo\Medoo;

// Database configuration
$db = new Medoo([
    'database_type' => 'mysql',
    'database_name' => 'prediction_platform',
    'server' => 'localhost',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4'
]);

// Test connection
try {
    $db->query("SELECT 1");
} catch (Exception $e) {
    error_log("Database connection failed: " . $e->getMessage());
}
?>