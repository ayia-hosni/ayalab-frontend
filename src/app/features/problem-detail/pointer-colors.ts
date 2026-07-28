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
  head: 'var(--pointer-head)',
  prev: 'var(--pointer-prev)',
  curr: 'var(--pointer-curr)',
  next: 'var(--pointer-next)',
  nxt: 'var(--pointer-next)',
  slow: PALETTE.teal,
  fast: PALETTE.red,
  tmp: PALETTE.gray,
  p: 'var(--secondary)',
  left: 'var(--secondary)',
  right: PALETTE.orange,
  result: 'var(--secondary)',
  i: PALETTE.sage,
  call: 'var(--secondary)',
  memo: PALETTE.teal,
};

export const POINTER_TEXT_COLORS = {
  head: 'var(--pointer-head-ink)',
  prev: 'var(--pointer-prev-ink)',
  curr: 'var(--pointer-curr-ink)',
  next: 'var(--pointer-next-ink)',
  nxt: 'var(--pointer-next-ink)',
  slow: '#FFF',
  fast: '#FFF',
  tmp: '#FFF',
  p: '#FFF',
  left: '#FFF',
  right: '#FFF',
  result: '#FFF',
  i: '#2D3436',
  call: '#FFF',
  memo: '#FFF',
};
