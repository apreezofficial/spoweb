<?php
declare(strict_types=1);
require __DIR__ . '/../../src/bootstrap.php';

$userId = require_login();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = db()->prepare('SELECT id, prefix, label, created_at, revoked_at FROM api_keys WHERE user_id = ? ORDER BY id DESC');
    $stmt->execute([$userId]);
    json_out(['keys' => $stmt->fetchAll()]);
}

require_method('POST');
$in = request_body();

// Revoke a key: {"action":"revoke","id":3}
if (($in['action'] ?? '') === 'revoke') {
    $stmt = db()->prepare('UPDATE api_keys SET revoked_at = ? WHERE id = ? AND user_id = ? AND revoked_at IS NULL');
    $stmt->execute([gmdate('c'), (int) ($in['id'] ?? 0), $userId]);
    json_out(['ok' => $stmt->rowCount() === 1]);
}

// Create a key. The full key is shown once and only its hash is stored.
$label = substr(trim((string) ($in['label'] ?? 'default')), 0, 60);
$key = 'spw_' . bin2hex(random_bytes(24));
$stmt = db()->prepare('INSERT INTO api_keys (user_id, key_hash, prefix, label, created_at) VALUES (?, ?, ?, ?, ?)');
$stmt->execute([$userId, hash('sha256', $key), substr($key, 0, 8), $label, gmdate('c')]);
json_out(['key' => $key, 'prefix' => substr($key, 0, 8), 'label' => $label], 201);
