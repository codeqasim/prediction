<?php
// users.php - Simple User Management

// Configuration
$SUPABASE_URL = 'https://cfkpfdpqobghtjewpzzd.supabase.co';
$SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNma3BmZHBxb2JnaHRqZXdwenpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE0OTkyMywiZXhwIjoyMDcwNzI1OTIzfQ.gTuxzDwj7ZC-v3Sf2X-Aie7uPRHa_UT8vH12wY4LGbE';

$message = '';

// Handle DELETE
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_user'])) {
    $userId = $_POST['user_id'];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $SUPABASE_URL . '/auth/v1/admin/users/' . $userId);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $SUPABASE_SERVICE_KEY,
        'apikey: ' . $SUPABASE_SERVICE_KEY
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $message = "User deleted successfully!";
    } else {
        $message = "Failed to delete user: " . $response;
    }
}

// Get users
function getUsers() {
    global $SUPABASE_URL, $SUPABASE_SERVICE_KEY;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $SUPABASE_URL . '/auth/v1/admin/users');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $SUPABASE_SERVICE_KEY,
        'apikey: ' . $SUPABASE_SERVICE_KEY
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $data = json_decode($response, true);
        return $data['users'] ?? [];
    }
    return [];
}

$users = getUsers();
?>

<!DOCTYPE html>
<html>
<head>
    <title>User Management</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #2196F3;
            font-family: Arial, sans-serif;
            color: white;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            padding: 20px;
            color: black;
        }

        h1 {
            text-align: center;
            color: #2196F3;
            margin-bottom: 30px;
        }

        .message {
            background: #4CAF50;
            color: white;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
        }

        .stats {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 4px;
            margin-bottom: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th {
            background: #2196F3;
            color: white;
            padding: 12px;
            text-align: left;
        }

        td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
        }

        tr:hover {
            background: #f5f5f5;
        }

        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }

        .btn-blue {
            background: #2196F3;
            color: white;
        }

        .btn-red {
            background: #f44336;
            color: white;
        }

        .btn:hover {
            opacity: 0.8;
        }

        .status-active {
            background: #4CAF50;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
        }

        .status-pending {
            background: #FF9800;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
        }

        .no-data {
            text-align: center;
            padding: 40px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>User Management</h1>

        <?php if ($message): ?>
            <div class="message"><?php echo $message; ?></div>
        <?php endif; ?>

        <div class="stats">
            <strong>Total Users: <?php echo count($users); ?></strong> |
            <strong>Active: <?php echo count(array_filter($users, function($u) { return !empty($u['email_confirmed_at']); })); ?></strong> |
            <strong>Pending: <?php echo count(array_filter($users, function($u) { return empty($u['email_confirmed_at']); })); ?></strong>
        </div>

        <a href="users.php" class="btn btn-blue">Refresh</a>

        <?php if (empty($users)): ?>
            <div class="no-data">
                <h3>No Users Found</h3>
                <p>Check your Supabase configuration:</p>
                <p><strong>URL:</strong> <?php echo $SUPABASE_URL; ?></p>
                <p><strong>Service Key:</strong> <?php echo substr($SUPABASE_SERVICE_KEY, 0, 20) . '...'; ?></p>
            </div>
        <?php else: ?>
            <table>
                <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                </tr>

                <?php foreach ($users as $user): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($user['email']); ?></td>
                        <td>
                            <?php
                            $name = 'No Name';
                            if (isset($user['user_metadata'])) {
                                if (isset($user['user_metadata']['first_name'])) {
                                    $name = $user['user_metadata']['first_name'];
                                    if (isset($user['user_metadata']['last_name'])) {
                                        $name .= ' ' . $user['user_metadata']['last_name'];
                                    }
                                } elseif (isset($user['user_metadata']['full_name'])) {
                                    $name = $user['user_metadata']['full_name'];
                                }
                            }
                            echo htmlspecialchars($name);
                            ?>
                        </td>
                        <td>
                            <span class="<?php echo !empty($user['email_confirmed_at']) ? 'status-active' : 'status-pending'; ?>">
                                <?php echo !empty($user['email_confirmed_at']) ? 'Active' : 'Pending'; ?>
                            </span>
                        </td>
                        <td>
                            <?php
                            if (!empty($user['created_at'])) {
                                echo date('Y-m-d', strtotime($user['created_at']));
                            } else {
                                echo 'Unknown';
                            }
                            ?>
                        </td>
                        <td>
                            <form method="POST" style="display: inline;"
                                  onsubmit="return confirm('Delete this user?');">
                                <input type="hidden" name="user_id" value="<?php echo htmlspecialchars($user['id']); ?>">
                                <button type="submit" name="delete_user" class="btn btn-red">Delete</button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </table>
        <?php endif; ?>
    </div>
</body>
</html>