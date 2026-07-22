<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

function sendOtpMail(
    $to,
    $name,
    $otp
) {
    $config = require __DIR__ . '/../config/mailer.php';

    try {

        $mail = new PHPMailer(true);

        $mail->isSMTP();
        $mail->Host = $config['host'];
        $mail->SMTPAuth = true;
        $mail->Username = $config['username'];
        $mail->Password = $config['password'];

        if ($config['encryption'] === 'ssl') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } else {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        }

        $mail->Port = $config['port'];

        $mail->setFrom(
            $config['from_email'],
            $config['from_name']
        );

        $mail->addAddress(
            $to,
            $name
        );

        $mail->isHTML(true);

        $mail->Subject = 'Password Reset Verification Code';

        $mail->Body = "
        <div style='font-family: Arial, sans-serif'>
            <h2>Password Reset Request</h2>

            <p>Hello {$name},</p>

            <p>Your verification code is:</p>

            <div
                style='
                    font-size:32px;
                    font-weight:bold;
                    letter-spacing:8px;
                    color:#2563eb;
                    margin:20px 0;
                '
            >
                {$otp}
            </div>

            <p>
                This code will expire in
                <strong>10 minutes</strong>.
            </p>

            <p>
                If you did not request this,
                please ignore this email.
            </p>
        </div>
        ";

        return [
            'success' => $mail->send(),
            'message' => 'OTP sent successfully'
        ];

    } catch (Exception $e) {

        return [
            'success' => false,
            'message' => $mail->ErrorInfo
        ];
    }
}
