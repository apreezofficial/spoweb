<?php
declare(strict_types=1);
require __DIR__ . '/../../src/bootstrap.php';
require_method('POST');

$in = request_body();
$email = strtolower(trim((string) ($in['email'] ?? '')));
$password = (string) ($in['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_out(['error' => 'Enter a valid email'], 422);
}
if (strlen($password) < 8) {
    json_out(['error' => 'Password must be at least 8 characters'], 422);
}

try {
    $stmt = db()->prepare('INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)');
    $stmt->execute([$email, password_hash($password, PASSWORD_DEFAULT), gmdate('c')]);
} catch (PDOException $e) {
    json_out(['error' => 'That email is already registered'], 409);
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int) db()->lastInsertId();
json_out(['ok' => true, 'email' => $email], 201);
