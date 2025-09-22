<?php

use Medoo\Medoo;

// ============================================
// USER AUTHENTICATION ENDPOINTS
// ============================================

// POST /users/signup - User Registration (called as /api/users/signup from frontend)
$router->post('/users/signup', function () use ($db) {
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    // Validate all fields are not blank
    $required = ['email', 'password', 'first_name', 'last_name'];
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

    // Check if email already exists
    $existingUser = $db->get('users', '*', ['email' => $input['email']]);
    if ($existingUser) {
        echo json_encode(['status' => false, 'message' => 'Email already registered']);
        return;
    }

    // Create user data
    $userData = [
        'id' => uniqid('user_'),
        'email' => $input['email'],
        'password' => password_hash($input['password'], PASSWORD_DEFAULT),
        'first_name' => $input['first_name'],
        'last_name' => $input['last_name'],
        'status' => 0, // Active user
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
                'first_name' => $userData['first_name'],
                'last_name' => $userData['last_name'],
                'points' => $userData['points']
            ]
        ]);
    } else {
        echo json_encode(['status' => false, 'message' => 'Registration failed']);
    }
});

// POST /users/login - User Login (called as /api/users/login from frontend)
$router->post('/users/login', function () use ($db) {
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    // Validate required fields
    if (empty($input['email']) || empty($input['password'])) {
        echo json_encode(['status' => false, 'message' => 'Email and password are required']);
        return;
    }

    // Find user by email
    $user = $db->get('users', '*', ['email' => $input['email']]);

    if (!$user) {
        echo json_encode(['status' => false, 'message' => 'Invalid email or password']);
        return;
    }

    // Verify password
    if (!password_verify($input['password'], $user['password'])) {
        echo json_encode(['status' => false, 'message' => 'Invalid email or password']);
        return;
    }

    // Remove password from response
    unset($user['password']);

    echo json_encode([
        'status' => true,
        'message' => 'Login successful',
        'data' => $user
    ]);
});
