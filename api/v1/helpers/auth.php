<?php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/response.php';

function getBearerToken()
{
    $headers = getallheaders();

    $authorization =
        $headers['Authorization']
        ?? $headers['authorization']
        ?? '';

    if (preg_match('/Bearer\s(\S+)/', $authorization, $matches)) {
        return $matches[1];
    }

    return null;
}

function getGymId()
{
    $headers = getallheaders();

    $gymId =
        $headers['X-Gym-Id']
        ?? $headers['x-gym-id']
        ?? '';

    return (int)$gymId;
}

function getAuthenticatedUser()
{
    global $conn;

    $token = getBearerToken();

    if (!$token) {
        errorResponse('Unauthorized', 401);
    }

    $gymId = getGymId();

    if ($gymId <= 0) {
        errorResponse('Gym ID is required', 401);
    }

    $token = mysqli_real_escape_string($conn, $token);

    $query = "
        SELECT
            id,
            gym_id,
            first_name,
            last_name,
            email,
            role,
            status,
            api_token
        FROM users
        WHERE api_token = '$token'
        AND gym_id = $gymId
        LIMIT 1
    ";

    $result = mysqli_query($conn, $query);

    if (!$result || mysqli_num_rows($result) === 0) {
        errorResponse('Unauthorized', 401);
    }

    $user = mysqli_fetch_assoc($result);

    if ($user['status'] !== 'active') {
        errorResponse('Account has been deactivated', 403);
    }

    return $user;
}
