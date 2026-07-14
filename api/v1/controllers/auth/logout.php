<?php

header('Content-Type: application/json');

require_once '../../config/db.php';
require_once '../../helpers/response.php';
require_once '../../helpers/auth.php';

$user = getAuthenticatedUser();

mysqli_query(
    $conn,
    "UPDATE users
     SET api_token = NULL
     WHERE id = {$user['id']}"
);

successResponse(
    'Logout successful',
    []
);
