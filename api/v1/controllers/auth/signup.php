<?php

header('Content-Type: application/json');

require_once '../../config/db.php';
require_once '../../helpers/response.php';
require_once '../../helpers/database.php';

$data = json_decode(file_get_contents('php://input'), true);

$gym_name   = trim($data['gym_name'] ?? '');
$first_name = trim($data['first_name'] ?? '');
$last_name  = trim($data['last_name'] ?? '');
$email      = trim($data['email'] ?? '');
$phone      = trim($data['phone'] ?? '');
$password   = $data['password'] ?? '';

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

if (empty($gym_name)) {
    errorResponse('Gym name is required', 422);
}

if (empty($first_name)) {
    errorResponse('First name is required', 422);
}

if (empty($last_name)) {
    errorResponse('Last name is required', 422);
}

if (empty($email)) {
    errorResponse('Email is required', 422);
}

if (empty($password)) {
    errorResponse('Password is required', 422);
}

if (strlen($password) < 6) {
    errorResponse('Password must be at least 6 characters', 422);
}

/*
|--------------------------------------------------------------------------
| Sanitize
|--------------------------------------------------------------------------
*/

$gym_name   = mysqli_real_escape_string($conn, $gym_name);
$first_name = mysqli_real_escape_string($conn, $first_name);
$last_name  = mysqli_real_escape_string($conn, $last_name);
$email      = mysqli_real_escape_string($conn, $email);
$phone      = mysqli_real_escape_string($conn, $phone);

/*
|--------------------------------------------------------------------------
| Generate Slug
|--------------------------------------------------------------------------
*/

$slug = strtolower($gym_name);
$slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
$slug = trim($slug, '-');

$checkSlug = mysqli_query(
    $conn,
    "SELECT id FROM gyms WHERE slug = '$slug'"
);

if (mysqli_num_rows($checkSlug) > 0) {
    $slug .= '-' . rand(1000, 9999);
}

/*
|--------------------------------------------------------------------------
| Start Transaction
|--------------------------------------------------------------------------
*/
initializeDatabase($conn);
ensureColumnsExist($conn);
seedDefaults($conn);


mysqli_begin_transaction($conn);

try {

    /*
    |--------------------------------------------------------------------------
    | Create Gym
    |--------------------------------------------------------------------------
    */

    $gymQuery = "
        INSERT INTO gyms (
            name,
            slug,
            email,
            phone,
            status,
            created_at
        )
        VALUES (
            '$gym_name',
            '$slug',
            '$email',
            '$phone',
            'active',
            NOW()
        )
    ";

    if (!mysqli_query($conn, $gymQuery)) {
        throw new Exception('Failed to create gym.');
    }

    $gym_id = mysqli_insert_id($conn);

    /*
    |--------------------------------------------------------------------------
    | Check Email Within Gym
    |--------------------------------------------------------------------------
    */

    $exists = mysqli_query(
        $conn,
        "
        SELECT id
        FROM users
        WHERE gym_id = $gym_id
        AND email = '$email'
        LIMIT 1
        "
    );

    if (mysqli_num_rows($exists) > 0) {
        throw new Exception('Email already exists.');
    }

    /*
    |--------------------------------------------------------------------------
    | Create Owner
    |--------------------------------------------------------------------------
    */

    $hashedPassword = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    $token = bin2hex(random_bytes(32));

    $userQuery = "
        INSERT INTO users (
            gym_id,
            first_name,
            last_name,
            email,
            phone,
            password,
            role,
            status,
            api_token,
            created_at
        )
        VALUES (
            $gym_id,
            '$first_name',
            '$last_name',
            '$email',
            '$phone',
            '$hashedPassword',
            'owner',
            'active',
            '$token',
            NOW()
        )
    ";

    if (!mysqli_query($conn, $userQuery)) {
        throw new Exception('Failed to create owner account.');
    }

    $user_id = mysqli_insert_id($conn);

    mysqli_commit($conn);

    successResponse(
        'Gym created successfully',
        [
            'token' => $token,
            'gym' => [
                'id' => $gym_id,
                'name' => $gym_name,
                'slug' => $slug
            ],
            'user' => [
                'id' => $user_id,
                'gym_id' => $gym_id,
                'first_name' => $first_name,
                'last_name' => $last_name,
                'email' => $email,
                'role' => 'owner'
            ]
        ]
    );

} catch (Exception $e) {

    mysqli_rollback($conn);

    errorResponse(
        $e->getMessage(),
        500
    );
}
