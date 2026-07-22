<?php

header('Content-Type: application/json');

require_once '../../config/db.php';
require_once '../../helpers/response.php';
require_once '../../helpers/auth.php';

$user = getAuthenticatedUser();

$gym_id = (int)$user['gym_id'];
$user_id = (int)$user['id'];

$result = mysqli_query(
    $conn,
    "
    UPDATE users
    SET api_token = NULL
    WHERE id = $user_id
    AND gym_id = $gym_id
    LIMIT 1
    "
);

if (!$result) {
    errorResponse('Failed to logout', 500);
}

successResponse(
    'Logout successful',
    []
);
