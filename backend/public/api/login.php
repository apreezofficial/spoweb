<?php
declare(strict_types=1);
require __DIR__ . '/../../src/bootstrap.php';
require_method('POST');

$in = request_body();
$email = strtolower(trim((string) ($in['email'] ?? '')));
$password = (string) ($in['password'] ?? '');

$stmt = db()->prepare('SELECT id, password_hash FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

// Same message for unknown email and wrong password, so emails cannot be probed.
if (!$user || !password_verify($password, $user['password_hash'])) {
    json_out(['error' => 'Wrong email or password'], 401);
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];
json_out(['ok' => true]);
