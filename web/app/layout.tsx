import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'spoweb',
  description: 'Live Spotify now-playing for your website. One API key, one component.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
