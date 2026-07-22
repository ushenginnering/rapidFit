<?php

header('Content-Type: application/json');

require_once '../../config/db.php';
require_once '../../helpers/response.php';

$data = json_decode(file_get_contents('php://input'), true);

$token = trim($data['token'] ?? '');
$password = trim($data['password'] ?? '');

if (empty($token)) {
    errorResponse('Reset token is required', 422);
}

if (empty($password)) {
    errorResponse('Password is required', 422);
}

$token = mysqli_real_escape_string($conn, $token);

$query = "
    SELECT id
    FROM users
    WHERE
        reset_token = '$token'
        AND reset_token_expires > NOW()
    LIMIT 1
";

$result = mysqli_query($conn, $query);

if (mysqli_num_rows($result) === 0) {
    errorResponse('Invalid or expired reset token', 400);
}

$user = mysqli_fetch_assoc($result);

$newPassword = password_hash(
    $password,
    PASSWORD_DEFAULT
);

mysqli_query(
    $conn,
    "UPDATE users
     SET
        password = '$newPassword',
        reset_token = NULL,
        reset_token_expires = NULL
     WHERE id = {$user['id']}"
);

successResponse(
    'Password reset successful',
    []
);
