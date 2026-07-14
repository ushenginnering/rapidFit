<?php

header('Content-Type: application/json');

require_once '../../config/db.php';
require_once '../../helpers/response.php';

$data = json_decode(file_get_contents('php://input'), true);

$gym_id = (int)($data['gym_id'] ?? 0);
$email  = trim($data['email'] ?? '');

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

if ($gym_id <= 0) {
    errorResponse('Gym ID is required', 422);
}

if (empty($email)) {
    errorResponse('Email is required', 422);
}

$email = mysqli_real_escape_string($conn, $email);

/*
|--------------------------------------------------------------------------
| Find User
|--------------------------------------------------------------------------
*/

$result = mysqli_query(
    $conn,
    "
    SELECT id, first_name, email
    FROM users
    WHERE gym_id = $gym_id
    AND email = '$email'
    LIMIT 1
    "
);

if (!$result) {
    errorResponse('Database error', 500);
}

if (mysqli_num_rows($result) === 0) {
    errorResponse('No account found with this email for this gym', 404);
}

$user = mysqli_fetch_assoc($result);

/*
|--------------------------------------------------------------------------
| Generate Reset Token
|--------------------------------------------------------------------------
*/

$token = bin2hex(random_bytes(32));

$expires = date(
    'Y-m-d H:i:s',
    strtotime('+1 hour')
);

$token = mysqli_real_escape_string($conn, $token);

$update = mysqli_query(
    $conn,
    "
    UPDATE users
    SET
        reset_token = '$token',
        reset_token_expires = '$expires'
    WHERE id = {$user['id']}
    "
);

if (!$update) {
    errorResponse('Failed to generate reset token', 500);
}

/*
|--------------------------------------------------------------------------
| Send Email
|--------------------------------------------------------------------------
|
| Example:
| https://yourdomain.com/reset-password?token=$token&gym_id=$gym_id
|
*/

// sendResetEmail($user['email'], $token, $gym_id);

successResponse(
    'Password reset link has been sent to your email.',
    []
);
