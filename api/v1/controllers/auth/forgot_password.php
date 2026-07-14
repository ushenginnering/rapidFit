<?php

header('Content-Type: application/json');

require_once '../../config/db.php';
require_once '../../helpers/response.php';
require_once '../../helpers/sendOtpMail.php';

$data = json_decode(file_get_contents('php://input'), true);

$gym_id = (int)($data['gym_id'] ?? 0);
$email  = trim($data['email'] ?? '');

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

if ($gym_id <= 0) {
    errorResponse('Gym ID is required', 422);
}

if (empty($email)) {
    errorResponse('Email is required', 422);
}

$email = mysqli_real_escape_string($conn, $email);

/*
|--------------------------------------------------------------------------
| Find User
|--------------------------------------------------------------------------
*/

$result = mysqli_query(
    $conn,
    "
    SELECT
        id,
        first_name,
        last_name,
        email
    FROM users
    WHERE gym_id = $gym_id
    AND email = '$email'
    LIMIT 1
    "
);

if (!$result) {
    errorResponse('Database error', 500);
}

if (mysqli_num_rows($result) === 0) {
    errorResponse('No account found with this email for this gym', 404);
}

$user = mysqli_fetch_assoc($result);

/*
|--------------------------------------------------------------------------
| Generate OTP
|--------------------------------------------------------------------------
*/

$otp = str_pad(
    random_int(0, 999999),
    6,
    '0',
    STR_PAD_LEFT
);

$expires = date(
    'Y-m-d H:i:s',
    strtotime('+10 minutes')
);

$otp = mysqli_real_escape_string($conn, $otp);

/*
|--------------------------------------------------------------------------
| Save OTP
|--------------------------------------------------------------------------
*/

$update = mysqli_query(
    $conn,
    "
    UPDATE users
    SET
        reset_otp = '$otp',
        reset_otp_expires = '$expires'
    WHERE id = {$user['id']}
    "
);

if (!$update) {
    errorResponse('Failed to generate OTP', 500);
}

/*
|--------------------------------------------------------------------------
| Send Email
|--------------------------------------------------------------------------
*/

$name = trim(
    ($user['first_name'] ?? '') .
    ' ' .
    ($user['last_name'] ?? '')
);

if (empty($name)) {
    $name = 'User';
}

$sent = sendOtpMail(
    $user['email'],
    $name,
    $otp,
    'Rapid Gym'
);

if (!$sent) {
    errorResponse(
        'Failed to send OTP email',
        500
    );
}

/*
|--------------------------------------------------------------------------
| Success Response
|--------------------------------------------------------------------------
*/

successResponse(
    'A verification code has been sent to your email.',
    []
);
