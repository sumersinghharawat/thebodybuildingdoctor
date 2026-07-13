<?php

$publicPath = getcwd();

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

$corsPrefixes = [
    '/build/',
    '/faceplugin/',
    '/onnxruntime/',
    '/css/',
];

if ($uri !== '/' && file_exists($publicPath.$uri) && ! is_dir($publicPath.$uri)) {
    foreach ($corsPrefixes as $prefix) {
        if (str_starts_with($uri, $prefix)) {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, HEAD, OPTIONS');
            header('Access-Control-Allow-Headers: *');

            if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
                http_response_code(204);

                return true;
            }

            $extension = strtolower(pathinfo($uri, PATHINFO_EXTENSION));
            $contentTypes = [
                'js' => 'application/javascript; charset=utf-8',
                'mjs' => 'application/javascript; charset=utf-8',
                'css' => 'text/css; charset=utf-8',
                'wasm' => 'application/wasm',
                'onnx' => 'application/octet-stream',
                'mjs' => 'application/javascript; charset=utf-8',
            ];

            if (isset($contentTypes[$extension])) {
                header('Content-Type: '.$contentTypes[$extension]);
            }

            header('Cache-Control: public, max-age=31536000, immutable');

            $filePath = $publicPath.$uri;
            $etag = '"'.md5_file($filePath).'"';
            header('ETag: '.$etag);

            if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) {
                http_response_code(304);

                return true;
            }

            if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'HEAD') {
                header('Content-Length: '.filesize($filePath));

                return true;
            }

            readfile($filePath);

            return true;
        }
    }

    return false;
}

$formattedDateTime = date('D M j H:i:s Y');

$requestMethod = $_SERVER['REQUEST_METHOD'];
$remoteAddress = $_SERVER['REMOTE_ADDR'].':'.$_SERVER['REMOTE_PORT'];

file_put_contents('php://stdout', "[$formattedDateTime] $remoteAddress [$requestMethod] URI: $uri\n");

require_once $publicPath.'/index.php';
