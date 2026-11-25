import { describe, expect, it } from 'vitest';

import { DEFAULT_MEMORY_LAYOUT as O, layoutMemory } from './memory-layout';

const cells = [{ id: 'x' }, { id: 'y' }, { id: 'p' }];

describe('layoutMemory', () => {
  it('places cells left to right at a fixed pitch and sizes the canvas around them', () => {
    const l = layoutMemory(cells);
    expect(l.cells.map(c => c.x)).toEqual([O.padding, O.padding + 106, O.padding + 212]);
    expect(l.cells[0].cx).toBe(O.padding + O.cellWidth / 2);
    expect(l.width).toBe(3 * O.cellWidth + 2 * O.gap + 2 * O.padding);
  });

  it('routes an arrow from the source centre to the target centre, tip pointing up at the box', () => {
    const l = layoutMemory(cells, [{ from: 'p', to: 'x' }]);
    const [arrow] = l.arrows;
    expect(arrow.d.startsWith(`M ${l.cells[2].cx} ${l.boxBottom}`)).toBe(true);
    expect(arrow.d.endsWith(`${l.cells[0].cx} ${l.boxBottom + 2 + O.head}`)).toBe(true);
    expect(arrow.head).toContain(`${l.cells[0].cx},${l.boxBottom + 2}`);
  });

  it('goes deeper for arrows that span more cells and grows the canvas to fit', () => {
    const near = layoutMemory(cells, [{ from: 'y', to: 'x' }]);
    const far = layoutMemory(cells, [{ from: 'p', to: 'x' }]);
    expect(far.height).toBeGreaterThan(near.height);
    expect(near.height).toBeGreaterThan(layoutMemory(cells).height);
  });

  it('drops arrows with unknown ends and self-arrows instead of throwing', () => {
    const l = layoutMemory(cells, [{ from: 'p', to: 'ghost' }, { from: 'x', to: 'x' }]);
    expect(l.arrows).toEqual([]);
  });

  it('handles no cells', () => {
    expect(layoutMemory([]).width).toBe(0);
  });
});
