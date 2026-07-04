// Small HTML-generating helpers for lesson slide diagrams, ported from the
// aya_coding_lab_slides_linked_list.html mockup. These emit Tailwind utility
// classes intentionally (Tailwind is loaded globally via CDN in index.html)
// since the diagrams are one-off illustrations, not reusable UI components.

export interface ColorSet {
  border: string;
  bg: string;
  text: string;
  line: string;
}

export const COLOR_A: ColorSet = { border: 'border-orange-400', bg: 'bg-orange-50', text: 'text-orange-600', line: 'bg-orange-400' };
export const COLOR_B: ColorSet = { border: 'border-brand-purple', bg: 'bg-brand-light', text: 'text-brand-dark', line: 'bg-brand-purple' };
export const COLOR_C: ColorSet = { border: 'border-teal-400', bg: 'bg-teal-50', text: 'text-teal-600', line: 'bg-teal-400' };
export const COLOR_X: ColorSet = { border: 'border-rose-400', bg: 'bg-rose-50', text: 'text-rose-600', line: 'bg-rose-400' };
export const COLOR_GHOST: ColorSet = { border: 'border-gray-300', bg: 'bg-gray-50', text: 'text-gray-400', line: 'bg-gray-300' };

export function nodeBox(label: string, colorSet: ColorSet, size = 'w-14 h-14 text-lg'): string {
  return `<div class="${size} rounded-2xl border-[3px] ${colorSet.border} ${colorSet.bg} ${colorSet.text} flex items-center justify-center font-bold node-3d flex-shrink-0">${label}</div>`;
}

export function arrowConn(colorClass: string, dashed = false): string {
  if (dashed) {
    return `<div class="w-8 sm:w-10 h-0 border-t-2 border-dashed border-gray-300 flex-shrink-0"></div>`;
  }
  const tipClass = colorClass.replace('bg-', 'border-l-');
  return `<div class="w-8 sm:w-10 h-1 ${colorClass} relative flex-shrink-0"><div class="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-l-[7px] ${tipClass}"></div></div>`;
}

export function nullNode(size = 'w-9 h-9 text-xs'): string {
  return `<div class="${size} rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-bold bg-white flex-shrink-0">∅</div>`;
}

export function headTag(text: string): string {
  return `<div class="relative flex flex-col items-center animate-bounce-subtle">
        <div class="bg-gray-900 text-white font-bold text-[10px] px-2.5 py-1 rounded shadow-sm uppercase tracking-wider whitespace-nowrap">${text}</div>
        <div class="w-0 h-0 border-x-[6px] border-x-transparent border-t-[7px] border-t-gray-900 mt-0.5"></div>
    </div>`;
}

export function curTag(text: string): string {
  return `<div class="relative flex flex-col items-center animate-bounce-subtle" style="animation-delay:0.1s">
        <div class="bg-teal-500 text-white font-bold text-[10px] px-2.5 py-1 rounded shadow-sm uppercase tracking-wider whitespace-nowrap">${text}</div>
        <div class="w-0 h-0 border-x-[6px] border-x-transparent border-t-[7px] border-t-teal-500 mt-0.5"></div>
    </div>`;
}

export function visualBox(inner: string, note?: string): string {
  return `<div class="visual-box bg-gray-50 border border-gray-200 rounded-xl p-5 sm:p-8 mb-6 shadow-sm relative overflow-x-auto">
        ${note ? `<div class="absolute -top-3 left-4 bg-white border border-gray-200 px-3 py-1 rounded-md text-[10px] font-bold text-gray-500 uppercase tracking-wider shadow-sm">${note}</div>` : ''}
        <div class="flex items-center justify-center gap-0 min-w-max py-2">${inner}</div>
    </div>`;
}

// Full chain: Head -> A -> B -> C -> NULL
export function fullChainVisual(headOn: boolean): string {
  return visualBox(`
        <div class="flex flex-col items-center mr-2">
            ${headOn ? headTag('Head') : '<div class="h-6"></div>'}
            <div class="w-0 h-4"></div>
        </div>
        ${nodeBox('A', COLOR_A)}
        ${arrowConn(COLOR_A.line)}
        ${nodeBox('B', COLOR_B)}
        ${arrowConn(COLOR_B.line)}
        ${nodeBox('C', COLOR_C)}
        ${arrowConn(COLOR_GHOST.line, true)}
        ${nullNode()}
    `);
}

// A dark code panel. Pass one arg for code identical in C++ and Java,
// or two args (cppHtml, javaHtml) to show a toggle-controlled version of each.
export function codeBlock(cppHtml: string, javaHtml?: string): string {
  const panel = (cls: string, html: string) =>
    `<div class="${cls} bg-[#1E1E2E] rounded-xl p-5 shadow-inner border border-gray-800 font-mono text-[13px] text-gray-300 leading-relaxed overflow-x-auto my-4" dir="ltr"><pre class="m-0"><code>${html}</code></pre></div>`;
  if (javaHtml === undefined) return panel('', cppHtml);
  return panel('code-cpp', cppHtml) + panel('code-java', javaHtml);
}

// An inline <code> chip for prose. One arg = same in both languages.
export function codeInline(cpp: string, java?: string): string {
  const chip = (cls: string, text: string) =>
    `<code class="${cls} bg-white border border-gray-200 px-1.5 py-0.5 rounded font-mono text-sm">${text}</code>`;
  if (java === undefined) return chip('', cpp);
  return chip('code-cpp', cpp) + chip('code-java', java);
}

// Same idea as codeInline but unstyled — for embedding inside headings/titles.
export function codeText(cpp: string, java?: string): string {
  if (java === undefined) return cpp;
  return `<span class="code-cpp">${cpp}</span><span class="code-java">${java}</span>`;
}

// Numbered chain (10 -> 20 -> 30 -> NULL) used for Traversal slides.
// currentAt: 0|1|2 for a node index, 'null' for the NULL terminator, or undefined for none.
export function numberChainVisual(opts: { headOn?: boolean; currentAt?: number | 'null' } = {}): string {
  const nodes = [
    { label: '10', color: COLOR_A },
    { label: '20', color: COLOR_B },
    { label: '30', color: COLOR_C },
  ];
  let inner = `<div class="flex flex-col items-center mr-1">
        ${opts.headOn ? headTag('Head') : '<div class="h-6"></div>'}
        <div class="w-0 h-4"></div>
    </div>`;
  nodes.forEach((n, i) => {
    inner += `<div class="flex flex-col items-center">
            ${opts.currentAt === i ? curTag('current') : '<div class="h-6"></div>'}
            <div class="w-0 h-4"></div>
            ${nodeBox(n.label, n.color, 'w-16 h-16 text-xl')}
        </div>`;
    inner += i < nodes.length - 1 ? arrowConn(n.color.line) : arrowConn('bg-gray-300', true);
  });
  inner += `<div class="flex flex-col items-center">
        ${opts.currentAt === 'null' ? curTag('current') : '<div class="h-6"></div>'}
        <div class="w-0 h-4"></div>
        ${nullNode()}
    </div>`;
  return visualBox(inner);
}
