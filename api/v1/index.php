
<!-- 
// direct reqested route
$route = $_SERVER['REQUEST_URI'];
echo $route; 
-->

$route = str_replace('/api/v1/', '', $_SERVER['REQUEST_URI']);
$route = trim($route, '/');

$method = $_SERVER['REQUEST_METHOD'];

switch (true) {

    case $method === 'POST' && $route === 'auth/login':
        require 'controllers/auth/login.php';
        break;

    case $method === 'GET' && $route === 'members':
        require 'controllers/members/index.php';
        break;

    case $method === 'POST' && $route === 'members':
        require 'controllers/members/create.php';
        break;

    default:
        http_response_code(404);

        echo json_encode([
            'success' => false,
            'message' => 'Route not found'
        ]);
}
