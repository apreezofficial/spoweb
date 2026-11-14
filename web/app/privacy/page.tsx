import Link from 'next/link';

export const metadata = { title: 'Privacy policy · spoweb' };

export default function Privacy() {
  return (
    <div className="page">
      <header className="top"><nav><Link className="brand" href="/">spoweb</Link></nav></header>
      <main className="page-main legal">
        <span className="eyebrow">Legal</span>
        <h1 className="sample-title">Privacy policy</h1>
        <p className="hint">Last updated: 14 November 2026</p>

        <h2>Who we are</h2>
        <p>spoweb is a small service that shows a developer&apos;s Spotify listening activity on their website. It is operated by Precious Adedokun. Questions: <a href="https://preciousadedokun.com.ng">preciousadedokun.com.ng</a>.</p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>Account details:</strong> your email address and a password hash. We never store your password in plain text.</li>
          <li><strong>API keys:</strong> only a one-way hash of each key, plus its first characters for display.</li>
          <li><strong>Spotify connection:</strong> your Spotify user ID, display name, and a refresh token. The refresh token is encrypted at rest.</li>
          <li><strong>Listening data:</strong> the track you are playing, your recently played track, and your queue. We read this only to show it in your widget or preview. We do not save listening history.</li>
        </ul>

        <h2>How we use it</h2>
        <p>We use this data only to run spoweb: signing you in, showing your widget, and letting you manage keys and your Spotify connection. We do not sell your data, and we do not use it for advertising.</p>

        <h2>Spotify data</h2>
        <p>spoweb uses the Spotify Web API. Spotify&apos;s own privacy policy governs your Spotify account. You can revoke spoweb&apos;s access at any time in your Spotify account settings, or disconnect from the spoweb dashboard, which deletes our stored token.</p>

        <h2>Sharing</h2>
        <p>Your widget shows your track to the visitors of the sites where you place it. We do not share your account details with third parties, except the hosting and database providers that run the service.</p>

        <h2>Retention and deletion</h2>
        <p>We keep your account and keys until you delete them. Disconnecting Spotify removes the stored token immediately. To delete your account and all data, contact us through the link above.</p>

        <h2>Security</h2>
        <p>Passwords are hashed with scrypt. Spotify tokens are encrypted with AES-256-GCM. Connections use TLS.</p>

        <h2>Changes</h2>
        <p>We will update this page if our practices change, and note the new date above.</p>
      </main>
      <footer className="site-foot"><span>spoweb</span><Link href="/terms">Terms</Link></footer>
    </div>
  );
}
