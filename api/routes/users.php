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
        // 'id' => uniqid('user_'),
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

// GET /users/profile - Get User Profile (called as /api/users/profile from frontend)
$router->get('/users/profile', function () use ($db) {
    // Get the Authorization header
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        echo json_encode(['status' => false, 'message' => 'Authorization token required']);
        return;
    }
    
    // Extract user ID from token (simplified - in real app would validate JWT)
    $userId = str_replace('Bearer ', '', $authHeader);
    
    if (!$userId) {
        echo json_encode(['status' => false, 'message' => 'Invalid token']);
        return;
    }
    
    // Get user profile
    $user = $db->get('users', [
        'id', 'email', 'first_name', 'last_name', 'phone', 'bio', 
        'avatar_url', 'points', 'created_at', 'updated_at'
    ], ['id' => $userId]);
    
    if (!$user) {
        echo json_encode(['status' => false, 'message' => 'User not found']);
        return;
    }
    
    // Get user stats (predictions count, etc.)
    $totalPredictions = $db->count('predictions', ['user_id' => $userId]);
    $correctPredictions = $db->count('predictions', [
        'user_id' => $userId,
        'status' => 'correct'
    ]);
    
    $accuracy = $totalPredictions > 0 ? round(($correctPredictions / $totalPredictions) * 100, 1) : 0;
    
    $user['stats'] = [
        'total_predictions' => $totalPredictions,
        'correct_predictions' => $correctPredictions,
        'accuracy' => $accuracy,
        'points' => $user['points']
    ];
    
    echo json_encode([
        'status' => true,
        'message' => 'Profile retrieved successfully',
        'data' => $user
    ]);
});

// PUT /users/profile - Update User Profile (called as /api/users/profile from frontend)
$router->put('/users/profile', function () use ($db) {
    // Get the Authorization header
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        echo json_encode(['status' => false, 'message' => 'Authorization token required']);
        return;
    }
    
    // Extract user ID from token
    $userId = str_replace('Bearer ', '', $authHeader);
    
    if (!$userId) {
        echo json_encode(['status' => false, 'message' => 'Invalid token']);
        return;
    }
    
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode(['status' => false, 'message' => 'Invalid input data']);
        return;
    }
    
    // Prepare update data - only allow specific fields to be updated
    $updateData = [];
    $allowedFields = ['first_name', 'last_name', 'phone', 'bio'];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $updateData[$field] = $input[$field];
        }
    }
    
    // Validate required fields
    if (isset($input['first_name']) && empty($input['first_name'])) {
        echo json_encode(['status' => false, 'message' => 'First name is required']);
        return;
    }
    
    if (isset($input['last_name']) && empty($input['last_name'])) {
        echo json_encode(['status' => false, 'message' => 'Last name is required']);
        return;
    }
    
    // Validate phone format if provided
    if (isset($input['phone']) && !empty($input['phone'])) {
        if (!preg_match('/^[\+]?[1-9][\d]{0,15}$/', $input['phone'])) {
            echo json_encode(['status' => false, 'message' => 'Invalid phone number format']);
            return;
        }
    }
    
    if (empty($updateData)) {
        echo json_encode(['status' => false, 'message' => 'No valid fields to update']);
        return;
    }
    
    $updateData['updated_at'] = date('Y-m-d H:i:s');
    
    // Update user profile
    $result = $db->update('users', $updateData, ['id' => $userId]);
    
    if ($result !== false) {
        // Get updated user data
        $user = $db->get('users', [
            'id', 'email', 'first_name', 'last_name', 'phone', 'bio', 
            'avatar_url', 'points', 'created_at', 'updated_at'
        ], ['id' => $userId]);
        
        echo json_encode([
            'status' => true,
            'message' => 'Profile updated successfully',
            'data' => $user
        ]);
    } else {
        echo json_encode(['status' => false, 'message' => 'Failed to update profile']);
    }
});

// POST /users/avatar - Upload User Avatar (called as /api/users/avatar from frontend)
$router->post('/users/avatar', function () use ($db) {
    // Get the Authorization header
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        echo json_encode(['status' => false, 'message' => 'Authorization token required']);
        return;
    }
    
    // Extract user ID from token
    $userId = str_replace('Bearer ', '', $authHeader);
    
    if (!$userId) {
        echo json_encode(['status' => false, 'message' => 'Invalid token']);
        return;
    }
    
    // Check if file was uploaded
    if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['status' => false, 'message' => 'No file uploaded or upload error']);
        return;
    }
    
    $file = $_FILES['avatar'];
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode(['status' => false, 'message' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed']);
        return;
    }
    
    // Validate file size (5MB max)
    $maxSize = 5 * 1024 * 1024; // 5MB
    if ($file['size'] > $maxSize) {
        echo json_encode(['status' => false, 'message' => 'File too large. Maximum size is 5MB']);
        return;
    }
    
    // Create uploads directory if it doesn't exist
    $uploadDir = dirname(__DIR__) . '/uploads/avatars/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'avatar_' . $userId . '_' . time() . '.' . strtolower($extension);
    $filepath = $uploadDir . $filename;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        echo json_encode(['status' => false, 'message' => 'Failed to save uploaded file']);
        return;
    }
    
    // Update user's avatar_url in database
    $avatarUrl = '/uploads/avatars/' . $filename;
    $result = $db->update('users', [
        'avatar_url' => $avatarUrl,
        'updated_at' => date('Y-m-d H:i:s')
    ], ['id' => $userId]);
    
    if ($result !== false) {
        echo json_encode([
            'status' => true,
            'message' => 'Avatar uploaded successfully',
            'data' => [
                'avatar_url' => $avatarUrl
            ]
        ]);
    } else {
        // Clean up uploaded file if database update failed
        unlink($filepath);
        echo json_encode(['status' => false, 'message' => 'Failed to update avatar in database']);
    }
});
