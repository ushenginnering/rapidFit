
<?php

header('Content-Type: application/json');

require_once '../../config/db.php';
require_once '../../helpers/response.php';
require_once '../../helpers/auth.php';

$user = getAuthenticatedUser();

unset($user['api_token']);

successResponse(
    'User retrieved successfully',
    $user
);
