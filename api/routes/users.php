<?php

use Medoo\Medoo;

// ============================================
// USER AUTHENTICATION ENDPOINTS
// ============================================

// POST /api/users/signup - User Registration
$router->post('/users/signup', function () use ($db) {
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    // Validate all fields are not blank
    $required = ['email', 'password', 'username', 'first_name', 'last_name'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            echo json_encode(['status' => 0, 'message' => $field . ' is required']);
            return;
        }
    }

    // Validate email format
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 0, 'message' => 'Invalid email format']);
        return;
    }

    // Create user data
    $userData = [
        'id' => uniqid('user_'),
        'email' => $input['email'],
        'password' => password_hash($input['password'], PASSWORD_DEFAULT),
        'username' => $input['username'],
        'first_name' => $input['first_name'],
        'last_name' => $input['last_name'],
        'status' => 0,
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
                'last_name' => $userData['last_name']
            ]
        ]);
    } else {
        echo json_encode(['status' => false, 'message' => 'Registration failed']);
    }
});
