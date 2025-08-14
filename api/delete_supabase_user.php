<?php
// delete_supabase_user.php
// Securely delete a Supabase user by ID using the service role key
// Place this file in a secure server-side location (never expose your service key to the frontend)

// ini_set('display_errors', 1);
// error_reporting(E_ALL);

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get user ID from POST body
$input = json_decode(file_get_contents('php://input'), true);
$user_id = isset($input['user_id']) ? $input['user_id'] : null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing user_id']);
    exit;
}

// Your Supabase project details
$supabase_url = 'https://cfkpfdpqobghtjewpzzd.supabase.co'; // <-- CHANGE THIS
$service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNma3BmZHBxb2JnaHRqZXdwenpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDk5MjMsImV4cCI6MjA3MDcyNTkyM30.gkjQLw5_SlHoqjoLeLytqM6Rwp92-2a5cnwIpr0n1xw'; // <-- CHANGE THIS (keep secret!)

// Prepare the API request
$endpoint = $supabase_url . '/auth/v1/admin/users/' . $user_id;
$headers = [
    'apikey: ' . $service_role_key,
    'Authorization: Bearer ' . $service_role_key,
    'Content-Type: application/json'
];


// Debug: log outgoing request
// file_put_contents(__DIR__ . '/delete_debug.log', print_r([
//     'endpoint' => $endpoint,
//     'headers' => $headers,
//     'user_id' => $user_id
// ], true));

$ch = curl_init($endpoint);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Disable SSL verification for local development (not recommended for production)
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Debug: log response
file_put_contents(__DIR__ . '/delete_debug.log', print_r([
    'endpoint' => $endpoint,
    'headers' => $headers,
    'user_id' => $user_id,
    'http_code' => $http_code,
    'response' => $response,
    'error' => $error
], true), FILE_APPEND);

if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'Curl error: ' . $error]);
    exit;
}

if ($http_code >= 200 && $http_code < 300) {
    echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
} else {
    http_response_code($http_code);
    echo json_encode([
        'error' => 'Failed to delete user',
        'response' => $response,
        'debug' => [
            'endpoint' => $endpoint,
            'headers' => $headers,
            'user_id' => $user_id,
            'http_code' => $http_code
        ]
    ]);
}
