
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

function getAuthenticatedUser()
{
    global $conn;

    $token = getBearerToken();

    if (!$token) {
        errorResponse('Unauthorized', 401);
    }

    $token = mysqli_real_escape_string($conn, $token);

    $query = "
        SELECT
            id,
            first_name,
            last_name,
            email,
            role,
            status,
            api_token
        FROM users
        WHERE api_token = '$token'
        LIMIT 1
    ";

    $result = mysqli_query($conn, $query);

    if (!$result || mysqli_num_rows($result) === 0) {
        errorResponse('Unauthorized', 401);
    }

    return mysqli_fetch_assoc($result);
}
