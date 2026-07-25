// @ts-nocheck
// Shared color palette for the pointer badges (head/prev/curr/next/slow/fast/...)
// used across the move-pointer, linked-list-game and solution-slides visualizers.

export const PALETTE = {
  gray: '#ccd2dd',
  red: '#f4c2c2',
  teal: '#00D2D3',
  yellow: '#f9e4bc',
  sage: '#e0e8c3',
  orange: '#FF9F43',
};

export const POINTER_COLORS = {
  head: PALETTE.gray,
  prev: PALETTE.red,
  curr: PALETTE.sage,
  next: PALETTE.yellow,
  nxt: PALETTE.yellow,
  slow: PALETTE.teal,
  fast: PALETTE.red,
  tmp: PALETTE.gray,
  p: 'var(--secondary)',
  left: 'var(--secondary)',
  right: PALETTE.orange,
  result: 'var(--secondary)',
};

export const POINTER_TEXT_COLORS = {
  head: '#FFF',
  prev: '#FFF',
  curr: '#2D3436',
  next: '#7A5000',
  nxt: '#7A5000',
  slow: '#FFF',
  fast: '#FFF',
  tmp: '#FFF',
  p: '#FFF',
  left: '#FFF',
  right: '#FFF',
  result: '#FFF',
};
