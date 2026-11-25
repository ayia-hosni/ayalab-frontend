import type { NodeColorName, VisualSpec } from '../utils/visual-builder';

/** Slides authored as raw HTML (or not yet converted to a structured spec). */
export interface LegacyHtmlSpec {
  kind: 'legacy-html';
  html: string;
}

export type ListVariant = 'singly' | 'doubly' | 'circular';

export interface ListNode {
  id: string;
  label: string;
  color?: NodeColorName;
}

export interface ListPointer {
  name: string;
  at: string;
}

export interface ListPanel {
  caption?: string;
  nodes: ListNode[];
  pointers?: ListPointer[];
  highlight?: string[];
  /** Draw the dashed arrow into a NULL terminator (ignored for circular lists). Defaults to true. */
  nullEnd?: boolean;
}

export interface ListSpec {
  kind: 'list';
  variant: ListVariant;
  panels: ListPanel[];
}

export interface TreeNode {
  id: string;
  label: string;
  /** Null/absent for the single root. */
  parent?: string | null;
  side?: 'left' | 'right';
  color?: NodeColorName;
}

export interface TreePanel {
  caption?: string;
  nodes: TreeNode[];
  highlight?: string[];
  /** Node ids in the order they are visited; rendered as numbered badges. */
  visitOrder?: string[];
}

export interface TreeSpec {
  kind: 'tree';
  panels: TreePanel[];
}

export interface MemoryCell {
  id: string;
  /** Shown above the box, e.g. "1004". */
  address?: string;
  /** Variable name, e.g. "x" or "p". */
  name?: string;
  /** What the cell holds; an empty or missing value renders as an uninitialised "?". */
  value?: string;
  color?: NodeColorName;
}

/** A pointer relationship: an arrow from the cell that holds an address to the cell it points at. */
export interface MemoryArrow {
  from: string;
  to: string;
}

export interface MemoryPanel {
  caption?: string;
  cells: MemoryCell[];
  arrows?: MemoryArrow[];
  highlight?: string[];
}

/** A row of memory cells (address, name, value) with pointer arrows between them. */
export interface MemorySpec {
  kind: 'memory';
  panels: MemoryPanel[];
}

/** Everything the API can return as a slide's `visual`; discriminated by `kind`. */
export type SlideSpec = VisualSpec | LegacyHtmlSpec | ListSpec | TreeSpec | MemorySpec;
