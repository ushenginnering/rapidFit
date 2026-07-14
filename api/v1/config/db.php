
<?php

require_once __DIR__ . '/../helpers/env.php';

loadEnv(__DIR__ . '/../.env');

$dbHost = env('DB_HOST');
$dbPort = env('DB_PORT', 3306);
$dbName = env('DB_DATABASE');
$dbUser = env('DB_USERNAME');
$dbPass = env('DB_PASSWORD');

$conn = mysqli_connect(
    $dbHost,
    $dbUser,
    $dbPass,
    $dbName,
    $dbPort
);

if (!$conn) {

    http_response_code(500);

    die(json_encode([
        'success' => false,
        'message' => 'Database connection failed.'
    ]));
}

mysqli_set_charset($conn, 'utf8mb4');
