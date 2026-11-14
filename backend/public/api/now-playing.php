<?php
declare(strict_types=1);
require __DIR__ . '/../../src/bootstrap.php';

cors_open();
require_method('GET');

$key = $_SERVER['HTTP_X_API_KEY'] ?? '';
if ($key === '') {
    json_out(['error' => 'Missing x-api-key header'], 401);
}

$stmt = db()->prepare('SELECT id FROM api_keys WHERE key_hash = ? AND revoked_at IS NULL');
$stmt->execute([hash('sha256', $key)]);
if (!$stmt->fetch()) {
    json_out(['error' => 'Invalid or revoked API key'], 401);
}

try {
    header('Cache-Control: public, max-age=20');
    json_out(spotify_now_playing());
} catch (Throwable $e) {
    json_out(['error' => 'Spotify is unavailable'], 502);
}
