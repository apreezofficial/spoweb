<?php
declare(strict_types=1);

/** Plain HTTP call with curl. Returns [status, decoded JSON or null]. */
function http_call(string $method, string $url, array $headers = [], ?string $body = null): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $data = is_string($raw) ? json_decode($raw, true) : null;
    return [$status, is_array($data) ? $data : null];
}

function spotify_access_token(): string
{
    $id = env('SPOTIFY_CLIENT_ID');
    $secret = env('SPOTIFY_CLIENT_SECRET');
    $refresh = env('SPOTIFY_REFRESH_TOKEN');
    if (!$id || !$secret || !$refresh) {
        throw new RuntimeException('Spotify env vars are not set');
    }
    $basic = base64_encode("$id:$secret");
    [$status, $data] = http_call('POST', 'https://accounts.spotify.com/api/token', [
        "Authorization: Basic $basic",
        'Content-Type: application/x-www-form-urlencoded',
    ], http_build_query(['grant_type' => 'refresh_token', 'refresh_token' => $refresh]));
    if ($status !== 200 || empty($data['access_token'])) {
        throw new RuntimeException("Token refresh failed: $status");
    }
    return $data['access_token'];
}

function spotify_shape(array $t): array
{
    return [
        'id' => $t['id'],
        'title' => $t['name'],
        'artist' => implode(', ', array_column($t['artists'], 'name')),
        'album' => $t['album']['name'],
        'albumArt' => $t['album']['images'][1]['url'] ?? $t['album']['images'][0]['url'] ?? null,
        'url' => $t['external_urls']['spotify'],
    ];
}

/** Current track if playing, else last played. Cached for 20 seconds on disk. */
function spotify_now_playing(): array
{
    $cacheDir = dirname(__DIR__) . '/cache';
    $cacheFile = $cacheDir . '/now-playing.json';
    if (is_file($cacheFile) && time() - filemtime($cacheFile) < 20) {
        return json_decode((string) file_get_contents($cacheFile), true);
    }

    $token = spotify_access_token();
    $auth = ["Authorization: Bearer $token"];

    [$status, $now] = http_call('GET', 'https://api.spotify.com/v1/me/player/currently-playing', $auth);
    if ($status === 200 && !empty($now['item']) && !empty($now['is_playing'])) {
        $result = ['isPlaying' => true, 'track' => spotify_shape($now['item'])];
    } else {
        [, $recent] = http_call('GET', 'https://api.spotify.com/v1/me/player/recently-played?limit=1', $auth);
        $last = $recent['items'][0]['track'] ?? null;
        $result = ['isPlaying' => false, 'track' => $last ? spotify_shape($last) : null];
    }

    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0700, true);
    }
    file_put_contents($cacheFile, json_encode($result));
    return $result;
}
