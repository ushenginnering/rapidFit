<?php

function seedGymDefaults($conn, $gymId)
{
    $gymId = (int)$gymId;

    /*
    |--------------------------------------------------------------------------
    | Default Membership Plans
    |--------------------------------------------------------------------------
    */

    $memberships = [
        ['Basic Monthly', 30, 15000],
        ['Premium Monthly', 30, 25000],
        ['Quarterly', 90, 40000],
        ['Annual', 365, 120000]
    ];

    foreach ($memberships as $membership) {

        [$name, $duration, $price] = $membership;

        $exists = mysqli_query(
            $conn,
            "
            SELECT id
            FROM memberships
            WHERE gym_id = $gymId
            AND name = '$name'
            LIMIT 1
            "
        );

        if (mysqli_num_rows($exists) == 0) {
            mysqli_query(
                $conn,
                "
                INSERT INTO memberships (
                    gym_id,
                    name,
                    duration,
                    price
                )
                VALUES (
                    $gymId,
                    '$name',
                    $duration,
                    $price
                )
                "
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Default Settings
    |--------------------------------------------------------------------------
    */

    $exists = mysqli_query(
        $conn,
        "
        SELECT id
        FROM settings
        WHERE gym_id = $gymId
        LIMIT 1
        "
    );

    if (mysqli_num_rows($exists) == 0) {
        mysqli_query(
            $conn,
            "
            INSERT INTO settings (
                gym_id,
                currency,
                timezone
            )
            VALUES (
                $gymId,
                'NGN',
                'Africa/Lagos'
            )
            "
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Dashboard Demo Metrics
    |--------------------------------------------------------------------------
    */

    $exists = mysqli_query(
        $conn,
        "
        SELECT id
        FROM dashboard_stats
        WHERE gym_id = $gymId
        LIMIT 1
        "
    );

    if (!$exists || mysqli_num_rows($exists) == 0) {

        mysqli_query(
            $conn,
            "
            INSERT INTO dashboard_stats (
                gym_id,
                total_members,
                active_members,
                monthly_revenue
            )
            VALUES (
                $gymId,
                0,
                0,
                0
            )
            "
        );
    }

    return true;
}
