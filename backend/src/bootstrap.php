<?php
declare(strict_types=1);

// Loads .env, starts the session, and includes shared helpers.
// All files in src/ live outside the web root (public/) so they are never served.

function env_load(string $path): void
{
    if (!is_file($path)) {
        return;
    }
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$k, $v] = array_map('trim', explode('=', $line, 2));
        $_ENV[$k] = $v;
        putenv("$k=$v");
    }
}

function env(string $key, ?string $default = null): ?string
{
    $v = $_ENV[$key] ?? getenv($key);
    return ($v === false || $v === null || $v === '') ? $default : (string) $v;
}

env_load(dirname(__DIR__) . '/.env');

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => env('SECURE_COOKIES', '0') === '1',
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/http.php';
require_once __DIR__ . '/spotify.php';
