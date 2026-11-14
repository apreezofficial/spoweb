/**
 * Feature flags, read from env at build time.
 * NEXT_PUBLIC_FLAG_* values are "true" or "false". In development, flags
 * default to on unless explicitly set to "false".
 */
const isDev = process.env.NODE_ENV === 'development';

function flag(value: string | undefined, devDefault: boolean, prodDefault: boolean): boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return isDev ? devDefault : prodDefault;
}

export const flags = {
  /** Show the live-looking now-playing demo card in the hero. */
  showDemoCard: flag(process.env.NEXT_PUBLIC_FLAG_DEMO_CARD, true, false),
  /** Show a DEV badge in development so flags are visible while building. */
  showDevBadge: flag(process.env.NEXT_PUBLIC_FLAG_DEV_BADGE, true, false),
};
