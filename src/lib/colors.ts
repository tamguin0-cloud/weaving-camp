export const STICKY_COLOR_KEYS = [
  'yellow',
  'pink',
  'mint',
  'sky',
  'lavender',
  'orange',
] as const

export type StickyColorKey = (typeof STICKY_COLOR_KEYS)[number]

export const STICKY_COLORS: Record<StickyColorKey, { bg: string; edge: string }> = {
  yellow: { bg: '#FFF4A8', edge: '#E6D864' },
  pink: { bg: '#FFCFD6', edge: '#E8A6B0' },
  mint: { bg: '#BFF0D7', edge: '#8CCDA9' },
  sky: { bg: '#C6E0FF', edge: '#95B9E6' },
  lavender: { bg: '#DDC6FF', edge: '#B198E0' },
  orange: { bg: '#FFD6A5', edge: '#E6AF76' },
}

export function pickColorKey(): StickyColorKey {
  return STICKY_COLOR_KEYS[Math.floor(Math.random() * STICKY_COLOR_KEYS.length)]
}
