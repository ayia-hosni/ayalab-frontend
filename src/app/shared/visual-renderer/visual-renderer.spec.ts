import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import type { SlideSpec } from '../../core/models/slide-spec.models';
import { VisualRenderer } from './visual-renderer';

@Component({
  standalone: true,
  imports: [VisualRenderer],
  template: `<app-visual-renderer [spec]="spec()" />`,
})
class Host {
  spec = signal<SlideSpec>({ kind: 'legacy-html', html: '<p class="legacy">hi</p>' });
}

function render(spec: SlideSpec): HTMLElement {
  const fixture = TestBed.createComponent(Host);
  fixture.componentInstance.spec.set(spec);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('VisualRenderer', () => {
  it('renders legacy HTML through Angular sanitization (scripts removed, markup kept)', () => {
    const el = render({ kind: 'legacy-html', html: '<p class="legacy">hi</p><script>window.pwned = 1</script>' });
    expect(el.querySelector('.legacy')?.textContent).toBe('hi');
    expect(el.querySelector('script')).toBeNull();
  });

  it('renders a doubly list with pointers, a highlighted node and an accessible description', () => {
    const el = render({
      kind: 'list', variant: 'doubly',
      panels: [{
        caption: 'Before',
        nodes: [{ id: 'a', label: '10' }, { id: 'b', label: '20' }],
        pointers: [{ name: 'Head', at: 'a' }],
        highlight: ['b'],
      }],
    });
    const box = el.querySelector('[role="img"]')!;
    expect(box.getAttribute('aria-label')).toBe('Before: doubly linked list: 10, 20, then NULL');
    expect(el.textContent).toContain('Head');
    expect(el.textContent).toContain('∅');
    expect(el.querySelectorAll('.ring-amber-300')).toHaveLength(1);
  });

  it('draws the return path for circular lists and no NULL terminator', () => {
    const el = render({
      kind: 'list', variant: 'circular',
      panels: [{ nodes: [{ id: 'a', label: '1' }, { id: 'b', label: '2' }] }],
    });
    expect(el.textContent).not.toContain('∅');
    expect(el.querySelector('.border-dashed.rounded-b-xl')).not.toBeNull();
    expect(el.querySelector('[role="img"]')!.getAttribute('aria-label')).toContain('back to the first node');
  });

  it('renders one box per panel', () => {
    const panel = { nodes: [{ id: 'a', label: '1' }] };
    const el = render({ kind: 'list', variant: 'singly', panels: [panel, panel] });
    expect(el.querySelectorAll('[role="img"]')).toHaveLength(2);
  });

  it('renders a tree with edges, computed positions and numbered visit badges', () => {
    const el = render({
      kind: 'tree',
      panels: [{
        nodes: [
          { id: 'r', label: 'A', parent: null },
          { id: 'l', label: 'B', parent: 'r', side: 'left' },
          { id: 'x', label: 'C', parent: 'r', side: 'right' },
        ],
        visitOrder: ['l', 'r', 'x'],
      }],
    });
    expect(el.querySelectorAll('svg line')).toHaveLength(2);
    const nodes = Array.from(el.querySelectorAll<HTMLElement>('div.absolute.w-14'));
    expect(nodes).toHaveLength(3);
    expect(nodes.every(n => n.style.left.endsWith('px') && n.style.top.endsWith('px'))).toBe(true);
    expect(Array.from(el.querySelectorAll('span.rounded-full')).map(b => b.textContent?.trim())).toEqual(['1', '2', '3']);
    expect(el.querySelector('[role="img"]')!.getAttribute('aria-label')).toBe('binary tree with 3 nodes, visited in order B, A, C');
  });

  it('renders memory cells with addresses, an uninitialised "?" and pointer arrows', () => {
    const el = render({
      kind: 'memory',
      panels: [{
        caption: 'After',
        cells: [
          { id: 'x', address: '1000', name: 'x', value: '42' },
          { id: 'y', address: '1004', name: 'y' },
          { id: 'p', address: '1008', name: 'p', value: '1000' },
        ],
        arrows: [{ from: 'p', to: 'x' }],
        highlight: ['x'],
      }],
    });
    expect(el.textContent).toContain('1004');
    expect(el.querySelectorAll('svg path')).toHaveLength(1);
    expect(el.querySelectorAll('svg polygon')).toHaveLength(1);
    expect(el.querySelector('.opacity-40')!.textContent?.trim()).toBe('?');
    expect(el.querySelectorAll('.ring-amber-300')).toHaveLength(1);
    expect(el.querySelector('[role="img"]')!.getAttribute('aria-label'))
      .toBe('After: memory: x at 1000 holds 42; y at 1004 holds nothing yet; p at 1008 holds 1000. p points to x');
  });

  it('renders nothing for a kind it does not know instead of throwing', () => {
    const el = render({ kind: 'hologram' } as unknown as SlideSpec);
    expect(el.textContent?.trim()).toBe('');
  });
});
