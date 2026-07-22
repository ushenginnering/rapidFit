<?php

header('Content-Type: application/json');

require_once '../../config/db.php';
require_once '../../helpers/response.php';
require_once '../../helpers/auth.php';

$user = getAuthenticatedUser();

unset($user['api_token']);
unset($user['password']);
unset($user['reset_token']);
unset($user['reset_token_expires']);

successResponse(
    'User retrieved successfully',
    $user
);
