<?php

header('Content-Type: application/json');

/*
|--------------------------------------------------------------------------
| Parse Route
|--------------------------------------------------------------------------
*/

$route = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$route = str_replace('/api/v1/', '', $route);

$route = trim($route, '/');

$method = $_SERVER['REQUEST_METHOD'];

/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
*/

switch (true) {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    case $method === 'POST' && $route === 'auth/login':
        require 'controllers/auth/login.php';
        break;

    case $method === 'POST' && $route === 'auth/logout':
        require 'controllers/auth/logout.php';
        break;

    case $method === 'POST' && $route === 'auth/forgot-password':
        require 'controllers/auth/forgot_password.php';
        break;

    case $method === 'POST' && $route === 'auth/reset-password':
        require 'controllers/auth/reset_password.php';
        break;

    case $method === 'GET' && $route === 'auth/me':
        require 'controllers/auth/me.php';
        break;

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    case $method === 'GET' && $route === 'dashboard':
        require 'controllers/dashboard/index.php';
        break;

    /*
    |--------------------------------------------------------------------------
    | Members
    |--------------------------------------------------------------------------
    */

    case $method === 'GET' && $route === 'members':
        require 'controllers/members/index.php';
        break;

    case $method === 'POST' && $route === 'members':
        require 'controllers/members/create.php';
        break;

    /*
    |--------------------------------------------------------------------------
    | Dynamic Member Routes
    |--------------------------------------------------------------------------
    */

    case $method === 'GET'
        && preg_match('/^members\/(\d+)$/', $route, $matches):

        $_GET['id'] = $matches[1];

        require 'controllers/members/show.php';
        break;

    case $method === 'PUT'
        && preg_match('/^members\/(\d+)$/', $route, $matches):

        $_GET['id'] = $matches[1];

        require 'controllers/members/update.php';
        break;

    case $method === 'DELETE'
        && preg_match('/^members\/(\d+)$/', $route, $matches):

        $_GET['id'] = $matches[1];

        require 'controllers/members/delete.php';
        break;

    /*
    |--------------------------------------------------------------------------
    | Not Found
    |--------------------------------------------------------------------------
    */

    default:

        http_response_code(404);

        echo json_encode([
            'success' => false,
            'message' => 'Route not found'
        ]);
}
