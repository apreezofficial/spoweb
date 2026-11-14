<?php
declare(strict_types=1);

/** Send a JSON response and stop. */
function json_out(array $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

/** Read a JSON body, falling back to form fields. */
function request_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $json = json_decode($raw, true);
    return is_array($json) ? $json : $_POST;
}

function require_method(string $method): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        json_out(['error' => 'Method not allowed'], 405);
    }
}

/** Public widget endpoints allow any origin. Keys are sent in a header, not a cookie. */
function cors_open(): void
{
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: x-api-key, content-type');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function current_user_id(): ?int
{
    return isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
}

function require_login(): int
{
    $id = current_user_id();
    if ($id === null) {
        json_out(['error' => 'Log in first'], 401);
    }
    return $id;
}
