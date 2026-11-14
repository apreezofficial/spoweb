<?php
declare(strict_types=1);
require __DIR__ . '/../src/bootstrap.php';
$loggedIn = current_user_id() !== null;
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>spoweb keys</title>
  <style>
    body { font: 16px/1.5 system-ui, sans-serif; max-width: 560px; margin: 40px auto; padding: 0 16px; background: #09090b; color: #fafafa; }
    input, button { font: inherit; padding: 10px 12px; border-radius: 8px; border: 1px solid #27272a; background: #18181b; color: #fafafa; }
    button { background: #fafafa; color: #09090b; cursor: pointer; }
    .card { border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin: 16px 0; background: #18181b; }
    code { font-family: ui-monospace, Menlo, monospace; word-break: break-all; }
    .muted { color: #a1a1aa; font-size: 14px; }
    .row { display: flex; gap: 8px; flex-wrap: wrap; margin: 8px 0; }
    .error { color: #f87171; min-height: 1.4em; }
  </style>
</head>
<body>
  <h1>spoweb API keys</h1>
  <p class="muted">Create an account, then generate a key for the <code>spoweb</code> package.</p>
  <div id="error" class="error"></div>

  <?php if (!$loggedIn): ?>
    <div class="card">
      <form id="auth" class="row">
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password (8+ characters)" minlength="8" required />
        <button name="mode" value="login">Log in</button>
        <button name="mode" value="register">Create account</button>
      </form>
    </div>
  <?php else: ?>
    <div class="card">
      <form id="newkey" class="row">
        <input name="label" placeholder="Label, e.g. my-portfolio" maxlength="60" />
        <button>Create key</button>
        <button type="button" id="logout">Log out</button>
      </form>
      <div id="fresh"></div>
    </div>
    <div class="card"><strong>Your keys</strong><div id="keys" class="muted">Loading…</div></div>
  <?php endif; ?>

<script>
const $ = (s) => document.querySelector(s);
const err = (m) => ($('#error').textContent = m || '');
async function api(path, body) {
  const res = await fetch('/api/' + path, {
    method: 'POST', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
const auth = $('#auth');
if (auth) {
  auth.addEventListener('click', (e) => { auth.dataset.mode = e.target.value || ''; });
  auth.addEventListener('submit', async (e) => {
    e.preventDefault();
    err('');
    const f = new FormData(auth);
    try {
      await api(f.get('mode') === 'register' || auth.dataset.mode === 'register' ? 'register.php' : 'login.php',
        { email: f.get('email'), password: f.get('password') });
      location.reload();
    } catch (x) { err(x.message); }
  });
}
const newkey = $('#newkey');
if (newkey) {
  async function loadKeys() {
    const res = await fetch('/api/keys.php', { credentials: 'same-origin' });
    const { keys } = await res.json();
    $('#keys').innerHTML = keys.length ? keys.map((k) =>
      `<div class="row"><span>${k.label} · <code>${k.prefix}…</code> · ${k.revoked_at ? 'revoked' : 'active'}</span>` +
      (k.revoked_at ? '' : `<button data-revoke="${k.id}">Revoke</button>`) + `</div>`).join('') : 'No keys yet.';
  }
  newkey.addEventListener('submit', async (e) => {
    e.preventDefault(); err('');
    try {
      const data = await api('keys.php', { label: new FormData(newkey).get('label') });
      $('#fresh').innerHTML = `<p>Copy this key now. It won't be shown again:</p><code>${data.key}</code>`;
      loadKeys();
    } catch (x) { err(x.message); }
  });
  $('#keys').addEventListener('click', async (e) => {
    const id = e.target.dataset.revoke;
    if (!id) return;
    try { await api('keys.php', { action: 'revoke', id: Number(id) }); loadKeys(); } catch (x) { err(x.message); }
  });
  $('#logout').addEventListener('click', async () => { await api('logout.php'); location.reload(); });
  loadKeys();
}
</script>
</body>
</html>
