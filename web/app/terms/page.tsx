import Link from 'next/link';

export const metadata = { title: 'Terms of service · spoweb' };

export default function Terms() {
  return (
    <div className="page">
      <header className="top"><nav><Link className="brand" href="/">spoweb</Link></nav></header>
      <main className="page-main legal">
        <span className="eyebrow">Legal</span>
        <h1 className="sample-title">Terms of service</h1>
        <p className="hint">Last updated: 14 November 2026</p>

        <h2>Using spoweb</h2>
        <p>spoweb lets you show your Spotify listening activity on your website with an API key. By creating an account you agree to these terms.</p>

        <h2>Your account and keys</h2>
        <ul>
          <li>Keep your password and API keys private. You are responsible for activity under your keys.</li>
          <li>Revoke a key if it is exposed. Revoked keys stop working immediately.</li>
          <li>Browser-based widgets expose the key to visitors, so use keys meant for that purpose.</li>
        </ul>

        <h2>Spotify</h2>
        <p>You must have a Spotify account to connect. You agree to Spotify&apos;s terms and must not use spoweb to break them. spoweb is not affiliated with or endorsed by Spotify.</p>

        <h2>Acceptable use</h2>
        <p>Do not use spoweb to harass anyone, to scrape, to overload the service, or to show content you do not have the right to share.</p>

        <h2>Availability</h2>
        <p>spoweb is provided as is, without any guarantee of uptime or accuracy. Spotify&apos;s data can be delayed or unavailable.</p>

        <h2>Ending access</h2>
        <p>We may suspend keys or accounts that break these terms. You can stop using spoweb at any time by disconnecting Spotify and revoking your keys.</p>

        <h2>Liability</h2>
        <p>To the extent the law allows, spoweb and its operator are not liable for indirect or consequential losses arising from use of the service.</p>

        <h2>Contact</h2>
        <p>Questions about these terms: <a href="https://preciousadedokun.com.ng">preciousadedokun.com.ng</a>.</p>
      </main>
      <footer className="site-foot"><span>spoweb</span><Link href="/privacy">Privacy</Link></footer>
    </div>
  );
}
