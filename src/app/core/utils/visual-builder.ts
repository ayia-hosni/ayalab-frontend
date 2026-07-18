// Structured builder for lesson slide visuals — generates the same Tailwind-class
// HTML the original hand-authored diagrams used (ported from the project's former
// lesson-visuals.ts), so admin-built content renders identically to the seeded one.
// Supports two independent "kinds" of visual: a sequence of chain diagrams (nodes,
// arrows, pointer tags, optionally followed by a bilingual code snippet), or a grid
// of comparison cards.

export interface ColorSet {
  border: string;
  bg: string;
  text: string;
  line: string;
}

export type NodeColorName = 'orange' | 'purple' | 'teal' | 'rose' | 'gray';

export const NODE_COLORS: Record<NodeColorName, ColorSet> = {
  orange: { border: 'border-orange-400',    bg: 'bg-orange-50',   text: 'text-orange-600', line: 'bg-orange-400' },
  purple: { border: 'border-brand-purple',  bg: 'bg-brand-light', text: 'text-brand-dark',  line: 'bg-brand-purple' },
  teal:   { border: 'border-teal-400',      bg: 'bg-teal-50',     text: 'text-teal-600',    line: 'bg-teal-400' },
  rose:   { border: 'border-rose-400',      bg: 'bg-rose-50',     text: 'text-rose-600',    line: 'bg-rose-400' },
  gray:   { border: 'border-gray-300',      bg: 'bg-gray-50',     text: 'text-gray-400',    line: 'bg-gray-300' },
};

export interface PointerTag {
  text: string;
  style: 'head' | 'cur';
}

export interface ChainNodeItem {
  type: 'node';
  label: string;
  color: NodeColorName;
  size: 'normal' | 'large';
  pointerTag: PointerTag | null;
}

export interface ChainNullItem {
  type: 'null';
  size: 'normal' | 'large';
  pointerTag: PointerTag | null;
}

/** A two-cell "struct" box (e.g. Data | Next) — the way a Node's internal fields are illustrated. */
export interface ChainSplitItem {
  type: 'split';
  leftLabel: string;
  rightLabel: string;
  size: 'normal' | 'large';
  rightMono: boolean;
  pointerTag: PointerTag | null;
}

export type ChainItem = ChainNodeItem | ChainNullItem | ChainSplitItem;
export type ConnectorStyle = 'solid' | 'dashed' | 'none';

export interface VisualFrame {
  note: string;
  items: ChainItem[];
  /** connectors[i] sits between items[i] and items[i+1]; length = max(items.length - 1, 0). */
  connectors: ConnectorStyle[];
}

export interface CodeSnippet {
  cpp: string;
  java: string;
}

export type CardColorName = NodeColorName | 'emerald';

export const CARD_COLORS: Record<CardColorName, ColorSet> = {
  ...NODE_COLORS,
  emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-600', line: 'bg-emerald-400' },
};

export type CardTopStyle = 'icon' | 'mono';

export interface ComparisonCard {
  color: CardColorName;
  topLine: string;
  topStyle: CardTopStyle;
  strikethrough: boolean;
  label: string;
}

export interface ComparisonGrid {
  columns: 2 | 3 | 4;
  cards: ComparisonCard[];
}

export type VisualSpec =
  | { kind: 'chain'; frames: VisualFrame[]; code: CodeSnippet | null }
  | { kind: 'grid'; grid: ComparisonGrid };

export function emptyVisualSpec(): VisualSpec {
  return { kind: 'chain', frames: [], code: null };
}

export function emptyFrame(): VisualFrame {
  return { note: '', items: [], connectors: [] };
}

export function emptyGrid(): ComparisonGrid {
  return { columns: 2, cards: [] };
}

export function emptyCard(): ComparisonCard {
  return { color: 'orange', topLine: '', topStyle: 'icon', strikethrough: false, label: '' };
}

export function emptyCodeSnippet(): CodeSnippet {
  return { cpp: '', java: '' };
}

export function emptyChainNode(): ChainNodeItem {
  return { type: 'node', label: '', color: 'orange', size: 'normal', pointerTag: null };
}

export function emptyChainNull(): ChainNullItem {
  return { type: 'null', size: 'normal', pointerTag: null };
}

export function emptyChainSplit(): ChainSplitItem {
  return { type: 'split', leftLabel: 'Data', rightLabel: 'Next', size: 'normal', rightMono: false, pointerTag: null };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Chain primitives ─────────────────────────────────────────────────────────

function nodeBox(label: string, colorSet: ColorSet, size: string): string {
  return `<div class="${size} rounded-2xl border-[3px] ${colorSet.border} ${colorSet.bg} ${colorSet.text} flex items-center justify-center font-bold node-3d flex-shrink-0">${escapeHtml(label)}</div>`;
}

function arrowConn(colorClass: string, dashed = false): string {
  if (dashed) {
    return `<div class="w-8 sm:w-10 h-0 border-t-2 border-dashed border-gray-300 flex-shrink-0"></div>`;
  }
  const tipClass = colorClass.replace('bg-', 'border-l-');
  return `<div class="w-8 sm:w-10 h-1 ${colorClass} relative flex-shrink-0"><div class="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-l-[7px] ${tipClass}"></div></div>`;
}

function nullNode(size: string): string {
  return `<div class="${size} rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-bold bg-white flex-shrink-0">∅</div>`;
}

function pointerTagHtml(tag: PointerTag): string {
  const bg = tag.style === 'head' ? 'bg-gray-900' : 'bg-teal-500';
  const tip = tag.style === 'head' ? 'border-t-gray-900' : 'border-t-teal-500';
  const delay = tag.style === 'cur' ? ' style="animation-delay:0.1s"' : '';
  return `<div class="relative flex flex-col items-center animate-bounce-subtle"${delay}>
        <div class="${bg} text-white font-bold text-[10px] px-2.5 py-1 rounded shadow-sm uppercase tracking-wider whitespace-nowrap">${escapeHtml(tag.text)}</div>
        <div class="w-0 h-0 border-x-[6px] border-x-transparent border-t-[7px] ${tip} mt-0.5"></div>
    </div>`;
}

function visualBox(inner: string, note?: string): string {
  return `<div class="visual-box bg-gray-50 border border-gray-200 rounded-xl p-5 sm:p-8 mb-6 shadow-sm relative overflow-x-auto">
        ${note ? `<div class="absolute -top-3 left-4 bg-white border border-gray-200 px-3 py-1 rounded-md text-[10px] font-bold text-gray-500 uppercase tracking-wider shadow-sm">${escapeHtml(note)}</div>` : ''}
        <div class="flex items-center justify-center gap-0 min-w-max py-2">${inner}</div>
    </div>`;
}

function splitNodeBox(item: ChainSplitItem): string {
  const size = item.size === 'large' ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-14 h-14 sm:w-16 sm:h-16';
  const rightClass = item.rightMono ? 'font-mono font-bold text-xs' : 'font-bold text-sm';
  return `<div class="flex rounded-2xl border-[3px] border-brand-purple overflow-hidden node-3d flex-shrink-0">
        <div class="${size} bg-brand-light text-brand-dark flex items-center justify-center font-bold text-sm border-r-2 border-brand-purple">${escapeHtml(item.leftLabel)}</div>
        <div class="${size} bg-white text-brand-dark flex items-center justify-center ${rightClass}">${escapeHtml(item.rightLabel)}</div>
    </div>`;
}

function itemColorLine(item: ChainItem): string {
  if (item.type === 'node') return NODE_COLORS[item.color].line;
  if (item.type === 'split') return NODE_COLORS.purple.line;
  return NODE_COLORS.gray.line;
}

function renderItem(item: ChainItem): string {
  const tag = item.pointerTag ? pointerTagHtml(item.pointerTag) : '<div class="h-6"></div>';
  let body: string;
  if (item.type === 'node') {
    body = nodeBox(item.label, NODE_COLORS[item.color], item.size === 'large' ? 'w-16 h-16 text-xl' : 'w-14 h-14 text-lg');
  } else if (item.type === 'null') {
    body = nullNode(item.size === 'large' ? 'w-16 h-16 text-2xl' : 'w-9 h-9 text-xs');
  } else {
    body = splitNodeBox(item);
  }
  return `<div class="flex flex-col items-center">${tag}<div class="w-0 h-4"></div>${body}</div>`;
}

function renderFrame(frame: VisualFrame): string {
  let inner = '';
  frame.items.forEach((item, i) => {
    inner += renderItem(item);
    if (i < frame.items.length - 1) {
      const style = frame.connectors[i] ?? 'solid';
      if (style === 'dashed') inner += arrowConn('bg-gray-300', true);
      else if (style === 'solid') inner += arrowConn(itemColorLine(item));
    }
  });
  return visualBox(inner, frame.note || undefined);
}

function codeBlockHtml(snippet: CodeSnippet): string {
  const panel = (cls: string, code: string) =>
    `<div class="${cls} bg-[#1E1E2E] rounded-xl p-5 shadow-inner border border-gray-800 font-mono text-[13px] text-gray-300 leading-relaxed overflow-x-auto my-4" dir="ltr"><pre class="m-0"><code>${escapeHtml(code)}</code></pre></div>`;
  return panel('code-cpp', snippet.cpp) + panel('code-java', snippet.java);
}

// ── Grid primitives ──────────────────────────────────────────────────────────

function cardLabelClass(color: CardColorName): string {
  return color === 'purple'
    ? 'text-xs font-bold text-brand-dark'
    : `text-xs font-bold ${CARD_COLORS[color].text} uppercase tracking-wider`;
}

function renderCard(card: ComparisonCard): string {
  const top = card.topStyle === 'mono'
    ? `<div class="font-mono text-lg ${CARD_COLORS[card.color].text} mb-1${card.strikethrough ? ' line-through' : ''}">${escapeHtml(card.topLine)}</div>`
    : `<div class="text-2xl mb-1">${card.topLine}</div>`;
  const label = `<div class="${cardLabelClass(card.color)}">${escapeHtml(card.label)}</div>`;
  const colors = CARD_COLORS[card.color];
  return `<div class="${colors.bg} border ${colors.border} rounded-xl p-4 text-center">${top}${label}</div>`;
}

function renderGrid(grid: ComparisonGrid): string {
  const cards = grid.cards.map(renderCard).join('');
  return `<div class="grid grid-cols-1 sm:grid-cols-${grid.columns} gap-3 mb-2">${cards}</div>`;
}

// ── Unified render ───────────────────────────────────────────────────────────

export function renderVisualHtml(spec: VisualSpec): string {
  if (spec.kind === 'grid') return renderGrid(spec.grid);

  let html = '';
  for (const frame of spec.frames) {
    if (frame.items.length > 0 || frame.note) html += renderFrame(frame);
  }
  if (spec.code) html += codeBlockHtml(spec.code);
  return html;
}

// ── Parser: recognizes HTML generated by the helpers above (or the original ──
// lesson-visuals.ts, which used the same class vocabulary) and reconstructs a
// VisualSpec. Returns null the moment it sees anything it can't confidently
// account for — silently guessing would risk mangling a diagram, so slides
// built from custom layouts (callout boxes, one-off illustrations, etc.) are
// left as raw HTML.

function isSpacerDiv(el: Element): boolean {
  const cls = el.className.trim();
  return el.tagName === 'DIV' && (cls === 'h-6' || cls === 'w-0 h-4');
}

function colorFromClassList(el: Element): NodeColorName | null {
  for (const name of Object.keys(NODE_COLORS) as NodeColorName[]) {
    if (el.classList.contains(NODE_COLORS[name].border)) return name;
  }
  return null;
}

function parseNodeEl(el: Element): ChainNodeItem | null {
  // A real nodeBox() is always a leaf with plain text — anything with child elements
  // (e.g. a two-cell Data/Next illustration that happens to share the same rounded
  // corner + border-color classes) is a different, non-chain illustration.
  if (el.children.length > 0) return null;
  if (!el.classList.contains('rounded-2xl')) return null;
  const color = colorFromClassList(el);
  if (!color) return null;
  const size: 'normal' | 'large' = el.classList.contains('w-16') ? 'large' : 'normal';
  return { type: 'node', label: (el.textContent ?? '').trim(), color, size, pointerTag: null };
}

function parseNullEl(el: Element): ChainNullItem | null {
  if (el.children.length > 0) return null;
  if (!el.classList.contains('rounded-full') || !el.classList.contains('border-dashed')) return null;
  // nullNode() always renders the literal ∅ glyph — a dashed circle with different
  // text (e.g. a "?" placeholder for "Head is lost") is a different symbol, not a
  // null terminator, even though it happens to share the same shape classes.
  if ((el.textContent ?? '').trim() !== '∅') return null;
  const size: 'normal' | 'large' = el.classList.contains('w-16') || el.classList.contains('w-12') ? 'large' : 'normal';
  return { type: 'null', size, pointerTag: null };
}

function parseSplitEl(el: Element): ChainSplitItem | null {
  if (!el.classList.contains('border-brand-purple') || !el.classList.contains('overflow-hidden')) return null;
  const children = Array.from(el.children);
  if (children.length !== 2) return null;
  const [left, right] = children;
  // Both cells must be plain leaves — this is a fixed two-field illustration, not a
  // container for arbitrary nested content.
  if (left.children.length > 0 || right.children.length > 0) return null;
  if (!left.classList.contains('border-r-2')) return null;
  const size: 'normal' | 'large' = left.classList.contains('sm:w-20') ? 'large' : 'normal';
  return {
    type: 'split',
    leftLabel: (left.textContent ?? '').trim(),
    rightLabel: (right.textContent ?? '').trim(),
    size,
    rightMono: right.classList.contains('font-mono'),
    pointerTag: null,
  };
}

function parseTagEl(el: Element): PointerTag | null {
  if (!el.classList.contains('animate-bounce-subtle')) return null;
  const label = el.querySelector(':scope > div');
  if (!label) return null;
  const style: 'head' | 'cur' = label.classList.contains('bg-teal-500') ? 'cur' : 'head';
  return { text: (label.textContent ?? '').trim(), style };
}

function parseConnectorEl(el: Element): ConnectorStyle | null {
  if (el.classList.contains('h-0') && el.classList.contains('border-dashed')) return 'dashed';
  if (el.classList.contains('h-1')) return 'solid';
  return null;
}

/** A chain item wrapper is `<div class="flex flex-col items-center ...">[tag-or-spacer][w-0 h-4 spacer][node-or-null]?</div>`.
 *  With no third child it's a standalone pointer-tag marker (e.g. a leading "Head" before the first node). */
function parseWrapperItem(el: Element): { item: ChainItem | null; tagOnly: PointerTag | null } | null {
  const children = Array.from(el.children);
  if (children.length < 2 || children.length > 3) return null;
  const [first, second, third] = children;
  if (!isSpacerDiv(second)) return null;

  let tag: PointerTag | null = null;
  if (!isSpacerDiv(first)) {
    tag = parseTagEl(first);
    if (!tag) return null;
  }

  if (!third) return tag ? { item: null, tagOnly: tag } : null;

  const item = parseNodeEl(third) ?? parseNullEl(third) ?? parseSplitEl(third);
  if (!item) return null;
  item.pointerTag = tag;
  return { item, tagOnly: null };
}

function isCodePanelEl(el: Element): boolean {
  return el.classList.contains('shadow-inner') && el.classList.contains('font-mono');
}

/** Parses one `.visual-box`'s content into a VisualFrame, or null if anything is unrecognized. */
function parseFrame(box: Element): VisualFrame | null {
  let note = '';
  const noteEl = box.querySelector(':scope > div.absolute');
  if (noteEl) note = (noteEl.textContent ?? '').trim();

  const row = box.querySelector(':scope > div.flex.items-center.justify-center');
  if (!row) return null;

  const items: ChainItem[] = [];
  const connectors: ConnectorStyle[] = [];
  let pendingTag: PointerTag | null = null;

  for (const child of Array.from(row.children)) {
    const connector = parseConnectorEl(child);
    if (connector) { connectors.push(connector); continue; }

    // A tag can appear bare at the row level too (not every wrapper wraps its
    // marker) — check that before treating the child as a generic wrapper, since
    // a tag div's own classes ("flex flex-col items-center") would otherwise match.
    const bareTag = parseTagEl(child);
    if (bareTag) {
      if (pendingTag) return null; // two pending tags with nothing between them
      pendingTag = bareTag;
      continue;
    }

    if (child.classList.contains('flex') && child.classList.contains('flex-col')) {
      const parsed = parseWrapperItem(child);
      if (!parsed) return null;
      if (parsed.item) {
        if (pendingTag && !parsed.item.pointerTag) { parsed.item.pointerTag = pendingTag; pendingTag = null; }
        items.push(parsed.item);
        continue;
      }
      if (parsed.tagOnly) { pendingTag = parsed.tagOnly; continue; }
      return null;
    }

    // A lone item is sometimes wrapped in an inert `flex items-center gap-*` div with
    // no other children (no layout effect with a single child) — unwrap it so the
    // real item underneath still parses.
    const effective = (child.classList.contains('flex') && !child.classList.contains('flex-col') && child.children.length === 1)
      ? child.children[0]
      : child;

    const bare = parseNodeEl(effective) ?? parseNullEl(effective) ?? parseSplitEl(effective);
    if (!bare) return null;
    if (pendingTag) { bare.pointerTag = pendingTag; pendingTag = null; }
    items.push(bare);
  }
  if (pendingTag) return null;
  if (connectors.length !== Math.max(items.length - 1, 0)) return null;

  return { note, items, connectors };
}

function cardColorFromBgClass(el: Element): CardColorName | null {
  for (const name of Object.keys(CARD_COLORS) as CardColorName[]) {
    if (el.classList.contains(CARD_COLORS[name].bg)) return name;
  }
  return null;
}

/** Parses one grid card, or null if it has anything nested beyond a plain top line + label. */
function parseCard(el: Element): ComparisonCard | null {
  const color = cardColorFromBgClass(el);
  if (!color) return null;
  const children = Array.from(el.children);
  if (children.length !== 2) return null;
  const [top, label] = children;
  // Both lines must be plain leaves — a nested diagram (e.g. a null-node illustration)
  // or nested per-language toggle spans mean this card isn't a plain text/icon card.
  if (top.children.length > 0 || label.children.length > 0) return null;

  const topStyle: CardTopStyle = top.classList.contains('font-mono') ? 'mono' : 'icon';
  const strikethrough = top.classList.contains('line-through');
  return {
    color,
    topLine: topStyle === 'mono' ? (top.textContent ?? '').trim() : top.innerHTML.trim(),
    topStyle,
    strikethrough,
    label: (label.textContent ?? '').trim(),
  };
}

function parseGrid(el: Element): ComparisonGrid | null {
  const match = el.className.match(/sm:grid-cols-(\d+)/);
  const columns = match ? Number(match[1]) : NaN;
  if (columns !== 2 && columns !== 3 && columns !== 4) return null;

  const cards: ComparisonCard[] = [];
  for (const child of Array.from(el.children)) {
    const card = parseCard(child);
    if (!card) return null;
    cards.push(card);
  }
  if (cards.length === 0) return null;
  return { columns, cards };
}

export function tryParseVisualSpec(html: string): VisualSpec | null {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const topLevel = Array.from(doc.body.children);
  if (topLevel.length === 0) return null;

  if (topLevel.length === 1 && topLevel[0].classList.contains('grid')) {
    const grid = parseGrid(topLevel[0]);
    return grid ? { kind: 'grid', grid } : null;
  }

  const boxes = topLevel.filter(el => el.classList.contains('visual-box'));
  const codePanels = topLevel.filter(isCodePanelEl);

  let code: CodeSnippet | null = null;
  if (codePanels.length === 1) {
    // Authored as a single "same code either way" block (no cpp/java classes) — one
    // panel visible regardless of language toggle. Storing it as an identical pair
    // reproduces that exact behavior on render.
    const text = (codePanels[0].textContent ?? '').trim();
    code = { cpp: text, java: text };
  } else if (codePanels.length === 2) {
    const cppEl = codePanels.find(e => e.classList.contains('code-cpp'));
    const javaEl = codePanels.find(e => e.classList.contains('code-java'));
    if (!cppEl || !javaEl) return null;
    code = { cpp: (cppEl.textContent ?? '').trim(), java: (javaEl.textContent ?? '').trim() };
  } else if (codePanels.length > 2) {
    return null;
  }

  const allowed = new Set<Element>([...boxes, ...codePanels]);
  for (const el of topLevel) {
    if (!allowed.has(el)) return null;
  }
  if (boxes.length === 0 && !code) return null;

  const frames: VisualFrame[] = [];
  for (const box of boxes) {
    const frame = parseFrame(box);
    if (!frame) return null;
    frames.push(frame);
  }
  if (frames.length === 0 && !code) return null;

  return { kind: 'chain', frames, code };
}
