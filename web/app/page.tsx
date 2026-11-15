import { flags } from '@/lib/flags';
import HeroNowPlaying from '@/app/HeroNowPlaying';

export default function Home() {
  return (
    <div className="wrap">
      <nav>
        <a className="brand" href="/">spoweb</a>
        <div className="links">
          <a href="/sample">Sample</a>
          <a href="/playground">Playground</a>
          <a href="/dashboard">Get a key</a>
          <a
            href="https://github.com/apreezofficial/spoweb"
            aria-label="spoweb on GitHub"
            title="GitHub"
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
        </div>
      </nav>

      {/* Section 1: hero */}
      <section>
        <span className="eyebrow">Spotify for websites</span>
        <h1>Show what you&apos;re listening to.</h1>
        <p>
          A live now-playing card with Spotify&apos;s player, refreshed every 30 seconds. One API key,
          one component, no OAuth on your side.
        </p>
        {flags.showDemoCard && (
          <>
            <div className="cells" aria-hidden="true">
              <div className="cell">S</div>
              <div className="cell">P</div>
              <div className="cell">O</div>
              <div className="cell on" />
            </div>
            <HeroNowPlaying />
          </>
        )}
        <div style={{ marginTop: 28 }}>
          <span className="pill">
            <span className="dollar">$</span> npm install github:apreezofficial/spoweb
          </span>
        </div>
      </section>

      {/* Section 2: usage */}
      <section id="usage">
        <span className="eyebrow">Usage</span>
        <h2>Drop it in. Or call it yourself.</h2>
        <p>Use the React component, or the plain client if you want the data in your own UI.</p>
        <div className="tabs">
          <div className="tab active">React / Next.js</div>
        </div>
        <pre>
          <code>{`import { SpotifyNowPlaying } from 'spoweb';

export default function Page() {
  return <SpotifyNowPlaying apiKey={process.env.NEXT_PUBLIC_SPOWEB_KEY!} />;
}`}</code>
        </pre>
        <p style={{ marginTop: 16 }}>Plain JavaScript:</p>
        <pre>
          <code>{`import { createSpotifyClient } from 'spoweb';

const spotify = createSpotifyClient({ apiKey: 'YOUR_API_KEY' });
const { isPlaying, track } = await spotify.getNowPlaying();`}</code>
        </pre>
      </section>

      {/* Section 3: open source and keys */}
      <section id="open-source">
        <span className="eyebrow">Open source</span>
        <h2>Free to read, free to use, open to contributions.</h2>
        <p>
          The package and this site are open source. Want an API key to try the widget? Keys are
          issued by hand for now.
        </p>
        <a className="btn" href="https://github.com/apreezofficial/spoweb">View on GitHub</a>
        <a className="btn ghost" href="https://www.npmjs.com/package/spoweb">npm</a>
      </section>

      <footer>
        <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · Built by <a href="https://preciousadedokun.com.ng">preciousadedokun.com.ng</a>
      </footer>

      {flags.showDevBadge && process.env.NODE_ENV === 'development' && (
        <div className="dev-badge">DEV · demo card {flags.showDemoCard ? 'on' : 'off'}</div>
      )}
    </div>
  );
}
