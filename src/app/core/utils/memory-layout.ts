import type { MemoryArrow, MemoryCell } from '../models/slide-spec.models';

export interface MemoryLayoutOptions {
  cellWidth: number;
  gap: number;
  padding: number;
  /** Height of the address label above each box. */
  addressHeight: number;
  boxHeight: number;
  /** Arrow head size. */
  head: number;
}

export const DEFAULT_MEMORY_LAYOUT: MemoryLayoutOptions = {
  cellWidth: 92, gap: 14, padding: 24, addressHeight: 18, boxHeight: 56, head: 9,
};

export interface PositionedCell {
  id: string;
  /** Left edge. */
  x: number;
  /** Centre line, where arrows attach. */
  cx: number;
}

export interface PositionedArrow {
  key: string;
  from: string;
  /** SVG path for the curve, ending at the base of the arrow head. */
  d: string;
  /** SVG polygon points for the arrow head. */
  head: string;
}

export interface MemoryLayout {
  cells: PositionedCell[];
  arrows: PositionedArrow[];
  width: number;
  height: number;
  /** Top of the row (the address label). */
  rowTop: number;
  /** Where the boxes end and the arrow area begins. */
  boxBottom: number;
}

/**
 * Lays cells out in one row and routes each arrow as a curve under the row, deeper the further
 * apart its ends are so short arrows stay inside long ones. Arrows with unknown ends are dropped.
 */
export function layoutMemory(
  cells: MemoryCell[],
  arrows: MemoryArrow[] = [],
  o: MemoryLayoutOptions = DEFAULT_MEMORY_LAYOUT,
): MemoryLayout {
  const placed = cells.map((c, i): PositionedCell => {
    const x = o.padding + i * (o.cellWidth + o.gap);
    return { id: c.id, x, cx: x + o.cellWidth / 2 };
  });
  const index = new Map(placed.map((c, i) => [c.id, i]));
  const rowTop = o.padding;
  const boxBottom = rowTop + o.addressHeight + o.boxHeight;

  let maxDepth = 0;
  const routed: PositionedArrow[] = [];
  for (const a of arrows) {
    const i = index.get(a.from);
    const j = index.get(a.to);
    if (i === undefined || j === undefined || i === j) continue;
    const depth = Math.min(28 + 18 * Math.abs(i - j), 120);
    maxDepth = Math.max(maxDepth, depth);
    const sx = placed[i].cx;
    const tx = placed[j].cx;
    // A cubic's lowest point is 0.75 of the way to its control points, so scale to hit `depth`.
    const c = boxBottom + depth / 0.75;
    const tipY = boxBottom + 2;
    routed.push({
      key: `${a.from}-${a.to}`,
      from: a.from,
      d: `M ${sx} ${boxBottom} C ${sx} ${c}, ${tx} ${c}, ${tx} ${tipY + o.head}`,
      head: `${tx - o.head / 2},${tipY + o.head} ${tx + o.head / 2},${tipY + o.head} ${tx},${tipY}`,
    });
  }

  const n = placed.length;
  return {
    cells: placed,
    arrows: routed,
    width: n === 0 ? 0 : n * o.cellWidth + (n - 1) * o.gap + o.padding * 2,
    height: boxBottom + maxDepth + o.padding,
    rowTop,
    boxBottom,
  };
}
