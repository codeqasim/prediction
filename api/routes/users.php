<?php

use Medoo\Medoo;

// ============================================
// USER AUTHENTICATION ENDPOINTS
// ============================================

// POST /api/users/register - User Registration
$router->post('/users/register', function () use ($db) {
    checkRequestMethod('POST');
    
    $data = getRequestBody();
    
    // Validate required fields
    validateRequiredFields($data, ['email', 'password', 'first_name', 'last_name']);
    
    // Validate email format
    validateEmail($data['email']);
    
    // Validate password strength
    validatePassword($data['password']);
    
    // Check if email already exists
    if (!isEmailAvailable($db, $data['email'])) {
        sendError('Email already registered', 409);
    }
    
    // Generate username if not provided
    if (empty($data['username'])) {
        $baseUsername = strtolower($data['first_name'] . $data['last_name']);
        $username = $baseUsername;
        $counter = 1;
        
        while (!isUsernameAvailable($db, $username)) {
            $username = $baseUsername . $counter;
            $counter++;
        }
        
        $data['username'] = $username;
    } else {
        // Check if username is available
        if (!isUsernameAvailable($db, $data['username'])) {
            sendError('Username already taken', 409);
        }
    }
    
    // Create user data
    $userData = [
        'email' => $data['email'],
        'password' => $data['password'], // Will be hashed in createUser function
        'username' => $data['username'],
        'first_name' => $data['first_name'],
        'last_name' => $data['last_name'],
        'bio' => $data['bio'] ?? '',
        'status' => 0, // Pending email verification
        'points' => 100 // Starting points
    ];
    
    // Create user
    $user = createUser($db, $userData);
    
    if ($user) {
        // Generate email verification token
        $verificationToken = generateEmailVerificationToken();
        
        // Update user with verification token
        updateUser($db, $user['id'], ['reset_token' => $verificationToken]);
        
        // Send email verification (mock for now)
        sendEmailVerification($user['email'], $verificationToken);
        
        // Return sanitized user data
        sendJsonResponse([
            'user' => sanitizeUserData($user),
            'message' => 'Registration successful! Please check your email to verify your account.'
        ], 201);
    } else {
        sendError('Failed to create user account', 500);
    }
});

// POST /api/users/login - User Login
$router->post('/users/login', function () use ($db) {
    checkRequestMethod('POST');
    
    $data = getRequestBody();
    
    // Validate required fields
    validateRequiredFields($data, ['email', 'password']);
    
    // Get user by email
    $user = getUserByEmail($db, $data['email']);
    
    if (!$user) {
        sendError('Invalid email or password', 401);
    }
    
    // Verify password
    if (!verifyPassword($data['password'], $user['password'])) {
        sendError('Invalid email or password', 401);
    }
    
    // Check if account is active
    if (!$user['is_active']) {
        sendError('Account is deactivated', 403);
    }
    
    // Check if account is banned
    if ($user['is_banned']) {
        sendError('Account is banned: ' . ($user['ban_reason'] ?? 'No reason provided'), 403);
    }
    
    // Update last sign in (removed from schema, but keeping logic for future)
    // updateUser($db, $user['id'], ['last_sign_in_at' => date('Y-m-d H:i:s')]);
    
    sendJsonResponse([
        'user' => sanitizeUserData($user),
        'message' => 'Login successful'
    ]);
});

// POST /api/users/verify-email - Email Verification
$router->post('/users/verify-email', function () use ($db) {
    checkRequestMethod('POST');
    
    $data = getRequestBody();
    
    validateRequiredFields($data, ['token']);
    
    // Find user with this verification token
    $user = $db->get('users', '*', ['reset_token' => $data['token']]);
    
    if (!$user) {
        sendError('Invalid verification token', 400);
    }
    
    // Update user status to verified
    $updated = updateUser($db, $user['id'], [
        'status' => 1,
        'reset_token' => null
    ]);
    
    if ($updated) {
        sendJsonResponse([
            'user' => sanitizeUserData($updated),
            'message' => 'Email verified successfully'
        ]);
    } else {
        sendError('Failed to verify email', 500);
    }
});

// POST /api/users/forgot-password - Forgot Password
$router->post('/users/forgot-password', function () use ($db) {
    checkRequestMethod('POST');
    
    $data = getRequestBody();
    
    validateRequiredFields($data, ['email']);
    validateEmail($data['email']);
    
    $user = getUserByEmail($db, $data['email']);
    
    if (!$user) {
        // Don't reveal if email exists or not
        sendJsonResponse(['message' => 'If the email exists, a reset link has been sent']);
        return;
    }
    
    // Generate reset token
    $resetToken = generateSecureToken();
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    // Update user with reset token
    updateUser($db, $user['id'], [
        'reset_token' => $resetToken,
        'reset_token_expires' => $expiresAt
    ]);
    
    // Send password reset email
    sendPasswordResetEmail($user['email'], $resetToken);
    
    sendJsonResponse(['message' => 'If the email exists, a reset link has been sent']);
});

// POST /api/users/reset-password - Reset Password
$router->post('/users/reset-password', function () use ($db) {
    checkRequestMethod('POST');
    
    $data = getRequestBody();
    
    validateRequiredFields($data, ['token', 'password']);
    validatePassword($data['password']);
    
    // Find user with valid reset token
    $user = $db->get('users', '*', [
        'reset_token' => $data['token'],
        'reset_token_expires[>=]' => date('Y-m-d H:i:s')
    ]);
    
    if (!$user) {
        sendError('Invalid or expired reset token', 400);
    }
    
    // Update password and clear reset token
    $updated = updateUser($db, $user['id'], [
        'password' => hashPassword($data['password']),
        'reset_token' => null,
        'reset_token_expires' => null
    ]);
    
    if ($updated) {
        sendJsonResponse(['message' => 'Password reset successfully']);
    } else {
        sendError('Failed to reset password', 500);
    }
});

// ============================================
// USER PROFILE ENDPOINTS
// ============================================

// GET /api/users/profile/:id - Get User Profile
$router->get('/users/profile/([a-f0-9-]+)', function ($userId) use ($db) {
    $user = getUserById($db, $userId);
    
    if (!$user) {
        sendError('User not found', 404);
    }
    
    // Get user profile with stats
    $profile = $db->get('user_profiles', '*', ['id' => $userId]);
    
    if ($profile) {
        sendJsonResponse($profile);
    } else {
        sendError('Profile not found', 404);
    }
});

// PUT /api/users/profile/:id - Update User Profile
$router->put('/users/profile/([a-f0-9-]+)', function ($userId) use ($db) {
    checkRequestMethod('PUT');
    
    $data = getRequestBody();
    
    // Check if user exists
    $user = getUserById($db, $userId);
    if (!$user) {
        sendError('User not found', 404);
    }
    
    // Prepare update data (only allow certain fields to be updated)
    $allowedFields = ['first_name', 'last_name', 'bio', 'avatar_url'];
    $updateData = [];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updateData[$field] = $data[$field];
        }
    }
    
    // Handle username update with availability check
    if (isset($data['username']) && $data['username'] !== $user['username']) {
        if (!isUsernameAvailable($db, $data['username'], $userId)) {
            sendError('Username already taken', 409);
        }
        $updateData['username'] = $data['username'];
    }
    
    // Handle email update with availability check
    if (isset($data['email']) && $data['email'] !== $user['email']) {
        validateEmail($data['email']);
        if (!isEmailAvailable($db, $data['email'], $userId)) {
            sendError('Email already registered', 409);
        }
        $updateData['email'] = $data['email'];
        $updateData['status'] = 0; // Reset verification status
    }
    
    if (empty($updateData)) {
        sendError('No valid fields to update', 400);
    }
    
    $updated = updateUser($db, $userId, $updateData);
    
    if ($updated) {
        sendJsonResponse([
            'user' => sanitizeUserData($updated),
            'message' => 'Profile updated successfully'
        ]);
    } else {
        sendError('Failed to update profile', 500);
    }
});

// GET /api/users/public/:username - Get Public Profile
$router->get('/users/public/([a-zA-Z0-9_]+)', function ($username) use ($db) {
    $profile = getUserPublicProfile($db, $username);
    
    if (!$profile) {
        sendError('User not found', 404);
    }
    
    // Get user achievements
    $userId = $db->get('users', 'id', ['username' => $username]);
    $achievements = getUserAchievements($db, $userId);
    
    sendJsonResponse([
        'profile' => $profile,
        'achievements' => $achievements
    ]);
});

// ============================================
// USER MANAGEMENT ENDPOINTS
// ============================================

// GET /api/users - List Users (Admin or pagination for public)
$router->get('/users', function () use ($db) {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 50) : 20;
    $offset = ($page - 1) * $limit;
    
    $users = $db->select('user_profiles', '*', [
        'LIMIT' => [$offset, $limit],
        'ORDER' => ['created_at' => 'DESC']
    ]);
    
    $total = $db->count('users', ['is_active' => true]);
    
    sendJsonResponse([
        'users' => $users,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ]);
});

// GET /api/users/search - Search Users
$router->get('/users/search', function () use ($db) {
    $query = $_GET['q'] ?? '';
    
    if (strlen($query) < 2) {
        sendError('Search query must be at least 2 characters', 400);
    }
    
    $users = $db->select('user_profiles', [
        'username',
        'first_name',
        'last_name',
        'full_name',
        'avatar_url',
        'points',
        'total_predictions',
        'accuracy_percentage'
    ], [
        'OR' => [
            'username[~]' => $query,
            'first_name[~]' => $query,
            'last_name[~]' => $query
        ],
        'LIMIT' => 20
    ]);
    
    sendJsonResponse($users);
});

// POST /api/users/change-password - Change Password (for authenticated user)
$router->post('/users/change-password', function () use ($db) {
    checkRequestMethod('POST');
    
    $data = getRequestBody();
    
    validateRequiredFields($data, ['userId', 'currentPassword', 'newPassword']);
    validatePassword($data['newPassword']);
    
    $user = getUserById($db, $data['userId']);
    
    if (!$user) {
        sendError('User not found', 404);
    }
    
    // Verify current password
    if (!verifyPassword($data['currentPassword'], $user['password'])) {
        sendError('Current password is incorrect', 401);
    }
    
    // Update password
    $updated = updateUser($db, $user['id'], [
        'password' => hashPassword($data['newPassword'])
    ]);
    
    if ($updated) {
        sendJsonResponse(['message' => 'Password changed successfully']);
    } else {
        sendError('Failed to change password', 500);
    }
});

// GET /api/users/stats - Get User Statistics
$router->get('/users/stats/([a-f0-9-]+)', function ($userId) use ($db) {
    $stats = $db->get('user_stats', '*', ['user_id' => $userId]);
    
    if (!$stats) {
        sendError('User stats not found', 404);
    }
    
    sendJsonResponse($stats);
});

// GET /api/users/achievements - Get User Achievements
$router->get('/users/achievements/([a-f0-9-]+)', function ($userId) use ($db) {
    $achievements = getUserAchievements($db, $userId);
    
    sendJsonResponse($achievements);
});

// ============================================
// UTILITY ENDPOINTS
// ============================================

// GET /api/users/check-username - Check Username Availability
$router->get('/users/check-username', function () use ($db) {
    $username = $_GET['username'] ?? '';
    
    if (empty($username)) {
        sendError('Username parameter is required', 400);
    }
    
    $available = isUsernameAvailable($db, $username);
    
    sendJsonResponse([
        'username' => $username,
        'available' => $available
    ]);
});

// GET /api/users/check-email - Check Email Availability
$router->get('/users/check-email', function () use ($db) {
    $email = $_GET['email'] ?? '';
    
    if (empty($email)) {
        sendError('Email parameter is required', 400);
    }
    
    validateEmail($email);
    
    $available = isEmailAvailable($db, $email);
    
    sendJsonResponse([
        'email' => $email,
        'available' => $available
    ]);
});
