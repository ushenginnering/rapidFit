
<?php

header('Content-Type: application/json');

require_once '../../config/db.php';
require_once '../../helpers/response.php';

/*
|--------------------------------------------------------------------------
| Read Request Body
|--------------------------------------------------------------------------
*/

$data = json_decode(file_get_contents('php://input'), true);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

if (empty($email)) {
    errorResponse('Email is required', 422);
}

if (empty($password)) {
    errorResponse('Password is required', 422);
}

/*
|--------------------------------------------------------------------------
| Find User
|--------------------------------------------------------------------------
*/

$email = mysqli_real_escape_string($conn, $email);

$query = "
    SELECT
        id,
        first_name,
        last_name,
        email,
        password,
        role,
        status
    FROM users
    WHERE email = '$email'
    LIMIT 1
";

$result = mysqli_query($conn, $query);

if (!$result) {
    errorResponse('Database error', 500);
}

if (mysqli_num_rows($result) == 0) {
    errorResponse('Invalid email or password', 401);
}

$user = mysqli_fetch_assoc($result);

/*
|--------------------------------------------------------------------------
| Check Status
|--------------------------------------------------------------------------
*/

if ($user['status'] !== 'active') {
    errorResponse('Account has been deactivated', 403);
}

/*
|--------------------------------------------------------------------------
| Verify Password
|--------------------------------------------------------------------------
*/

if (!password_verify($password, $user['password'])) {
    errorResponse('Invalid email or password', 401);
}

/*
|--------------------------------------------------------------------------
| Generate Token
|--------------------------------------------------------------------------
|
| Replace this with JWT later if needed.
|
*/

$token = bin2hex(random_bytes(32));

mysqli_query(
    $conn,
    "UPDATE users
     SET api_token = '$token'
     WHERE id = {$user['id']}"
);

/*
|--------------------------------------------------------------------------
| Remove Password
|--------------------------------------------------------------------------
*/

unset($user['password']);

/*
|--------------------------------------------------------------------------
| Response
|--------------------------------------------------------------------------
*/

successResponse(
    'Login successful',
    [
        'token' => $token,
        'user' => $user
    ]
);
