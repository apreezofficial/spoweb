import { flags } from '@/lib/flags';
import HeroNowPlaying from '@/app/HeroNowPlaying';

export default function Home() {
  return (
    <div className="wrap">
      <nav>
        <a className="brand" href="/">spoweb</a>
        <div className="links">
          <a href="#usage">Usage</a>
          <a href="/sample">Sample</a>
          <a href="/playground">Playground</a>
          <a href="/dashboard">Get a key</a>
          <a href="#open-source">Open source</a>
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
            <span className="dollar">$</span> npm install spoweb
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
