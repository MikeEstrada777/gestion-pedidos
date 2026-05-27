<?php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Route API requests to the backend
if (preg_match('#^/api/(.+)$#', $uri, $matches)) {
    $apiFile = __DIR__ . '/backend/api/' . $matches[1];
    if (file_exists($apiFile)) {
        require $apiFile;
        exit;
    }
}

// Serve static frontend files
$staticFile = __DIR__ . '/frontend' . $uri;
if ($uri !== '/' && file_exists($staticFile) && !is_dir($staticFile)) {
    return false; // Let the built-in PHP server handle static files
}

// Default: serve the login page
$defaultPage = __DIR__ . '/frontend/pages/login.html';
if (file_exists($defaultPage)) {
    readfile($defaultPage);
    exit;
}

http_response_code(404);
echo "Not found";
