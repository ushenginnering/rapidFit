<?php

function initializeDatabase($conn)
{
    $queries = [];

    /*
    |--------------------------------------------------------------------------
    | Gyms
    |--------------------------------------------------------------------------
    */

    $queries[] = "
        CREATE TABLE IF NOT EXISTS gyms (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE,
            email VARCHAR(255),
            phone VARCHAR(30),
            logo TEXT,
            status ENUM('active','inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ";

    /*
    |--------------------------------------------------------------------------
    | Users
    |--------------------------------------------------------------------------
    */

    $queries[] = "
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            gym_id INT NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(30),
            password VARCHAR(255) NOT NULL,
            role ENUM(
                'owner',
                'admin',
                'trainer',
                'receptionist',
                'member',
                'super_admin'
            ) DEFAULT 'member',
            status ENUM('active','inactive') DEFAULT 'active',
            api_token VARCHAR(255),
            reset_token VARCHAR(255),
            reset_token_expires DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            INDEX idx_gym (gym_id),
            INDEX idx_email (email),
            INDEX idx_token (api_token),
            UNIQUE KEY unique_gym_email (gym_id, email)
        )
    ";

    /*
    |--------------------------------------------------------------------------
    | Membership Plans
    |--------------------------------------------------------------------------
    */

    $queries[] = "
        CREATE TABLE IF NOT EXISTS memberships (
            id INT AUTO_INCREMENT PRIMARY KEY,
            gym_id INT NOT NULL,
            name VARCHAR(100),
            duration INT DEFAULT 30,
            price DECIMAL(10,2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            INDEX idx_gym (gym_id)
        )
    ";

    /*
    |--------------------------------------------------------------------------
    | Members
    |--------------------------------------------------------------------------
    */

    $queries[] = "
        CREATE TABLE IF NOT EXISTS members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            gym_id INT NOT NULL,
            user_id INT,
            membership_id INT,
            start_date DATE,
            end_date DATE,
            status ENUM(
                'active',
                'expired',
                'suspended'
            ) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            INDEX idx_gym (gym_id),
            INDEX idx_user (user_id)
        )
    ";

    /*
    |--------------------------------------------------------------------------
    | Payments
    |--------------------------------------------------------------------------
    */

    $queries[] = "
        CREATE TABLE IF NOT EXISTS payments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            gym_id INT NOT NULL,
            member_id INT,
            amount DECIMAL(12,2) DEFAULT 0,
            payment_method VARCHAR(50),
            status ENUM(
                'paid',
                'pending',
                'failed'
            ) DEFAULT 'paid',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            INDEX idx_gym (gym_id),
            INDEX idx_member (member_id)
        )
    ";

    /*
    |--------------------------------------------------------------------------
    | Workouts
    |--------------------------------------------------------------------------
    */

    $queries[] = "
        CREATE TABLE IF NOT EXISTS workouts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            gym_id INT NOT NULL,
            trainer_id INT,
            member_id INT,
            title VARCHAR(255),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            INDEX idx_gym (gym_id)
        )
    ";

    /*
    |--------------------------------------------------------------------------
    | Settings
    |--------------------------------------------------------------------------
    */

    $queries[] = "
        CREATE TABLE IF NOT EXISTS settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            gym_id INT NOT NULL,
            currency VARCHAR(10) DEFAULT 'NGN',
            timezone VARCHAR(100) DEFAULT 'Africa/Lagos',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            UNIQUE KEY unique_gym_settings (gym_id)
        )
    ";

    /*
    |--------------------------------------------------------------------------
    | Execute Queries
    |--------------------------------------------------------------------------
    */

    foreach ($queries as $query) {
        if (!mysqli_query($conn, $query)) {
            throw new Exception(
                'Database initialization failed: '
                . mysqli_error($conn)
            );
        }
    }

    return true;
}
