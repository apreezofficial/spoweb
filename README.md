# spoweb

Show a live Spotify "now playing" widget on your website with one API key.

## Install

```bash
npm install spoweb
```

## React / Next.js

```tsx
import { SpotifyNowPlaying } from 'spoweb';

export default function Page() {
  return <SpotifyNowPlaying apiKey={process.env.NEXT_PUBLIC_SPOTIFY_WIDGET_KEY!} />;
}
```

## Plain JavaScript

```js
import { createSpotifyClient } from 'spoweb';

const spotify = createSpotifyClient({ apiKey: 'YOUR_API_KEY' });
const { isPlaying, track } = await spotify.getNowPlaying();
console.log(track?.title, track?.artist, isPlaying);
```

## Options

| Option | Default | Description |
| --- | --- | --- |
| `apiKey` | required | Your key from apcodesphere.xyz |
| `baseUrl` | `https://apcodesphere.xyz` | Override the API host |
| `refreshMs` | `30000` | How often the component refreshes |
| `emptyText` | "I'm not listening…" | Text shown when there is no track |
| `className`, `style` | — | Styling for the wrapper |

## Getting a key

Sign up and create a key at your spoweb backend (the `backend/` folder in this repo, served at `/`). Pass its address as `baseUrl` if you run your own.

## Keeping your key safe

Browser code exposes its key to every visitor. For a public site this is
usually fine for a read-only widget, but for stricter setups call the
client from your own server and pass results to the page.
