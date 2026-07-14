<?php

header('Content-Type: application/json');

require_once '../../config/db.php';
require_once '../../helpers/response.php';

$data = json_decode(file_get_contents('php://input'), true);

$email = trim($data['email'] ?? '');

if (empty($email)) {
    errorResponse('Email is required', 422);
}

$email = mysqli_real_escape_string($conn, $email);

$result = mysqli_query(
    $conn,
    "SELECT id
     FROM users
     WHERE email = '$email'
     LIMIT 1"
);

if (mysqli_num_rows($result) === 0) {
    errorResponse('No account found with this email', 404);
}

$user = mysqli_fetch_assoc($result);

$token = bin2hex(random_bytes(32));

$expires = date(
    'Y-m-d H:i:s',
    strtotime('+1 hour')
);

mysqli_query(
    $conn,
    "UPDATE users
     SET
        reset_token = '$token',
        reset_token_expires = '$expires'
     WHERE id = {$user['id']}"
);

/*
|--------------------------------------------------------------------------
| Send Email Here
|--------------------------------------------------------------------------
|
| https://yourdomain.com/reset-password?token=$token
|
*/

successResponse(
    'Password reset link has been sent to your email.',
    []
);
