// @ts-nocheck
import React, { useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';

// ─── RECURSION TREE (built once, for the "naive vs memoized" slides) ────────
// fib(5)'s full naive call tree — small enough to read at a glance, but rich
// enough to show real repeats (fib(3) x2, fib(2) x3, fib(1) x5, fib(0) x3).

let leafX = 0;
function buildTree(n, depth, path) {
  if (n < 2) {
    const node = { id: path, label: `fib(${n})`, depth, base: true, x: leafX, children: [] };
    leafX += 1;
    return node;
  }
  const left = buildTree(n - 1, depth + 1, path + 'L');
  const right = buildTree(n - 2, depth + 1, path + 'R');
  return { id: path, label: `fib(${n})`, depth, base: false, x: (left.x + right.x) / 2, children: [left, right] };
}
const TREE_ROOT = buildTree(5, 0, 'root');

function flatten(node, acc = []) {
  acc.push(node);
  node.children.forEach((c) => flatten(c, acc));
  return acc;
}
const ALL_NODES = flatten(TREE_ROOT);

// Pre-order == real call order (visit node, then its left subtree, then right) —
// so the first time we see a label it's the original call; every later one is a repeat.
const seenLabels = new Set();
ALL_NODES.forEach((node) => {
  node.isRepeat = seenLabels.has(node.label);
  seenLabels.add(node.label);
});

function collectDescendantIds(node, acc) {
  node.children.forEach((c) => { acc.add(c.id); collectDescendantIds(c, acc); });
}
const PRUNED_IDS = new Set();
ALL_NODES.filter((n) => n.isRepeat).forEach((n) => collectDescendantIds(n, PRUNED_IDS));

const EDGES = [];
ALL_NODES.forEach((n) => n.children.forEach((c) => EDGES.push({ from: n.id, to: c.id, parent: n, child: c })));

const NODE_W = 60, NODE_H = 30;
const treePx = (node) => ({ x: node.x * 66 + 40, y: node.depth * 68 + 30 });

const REPEAT_COLORS = { 'fib(3)': '#8B5CF6', 'fib(2)': '#00A3A4' };

// ─── DP TABLE (for the bottom-up slides) ─────────────────────────────────────

const N = 8;
const VALUES = [0, 1, 1, 2, 3, 5, 8, 13];

const ITER_SLIDES = [
  { filled: [0, 1], writing: null, reads: [], activeLine: 1,
    msg: 'dp[0] = 0 and dp[1] = 1 are given — these are the base cases, not computed.' },
  { filled: [0, 1, 2], writing: 2, reads: [1, 0], activeLine: 3,
    msg: 'dp[2] = dp[1] + dp[0] = 1 + 0 = 1.' },
  { filled: [0, 1, 2, 3], writing: 3, reads: [2, 1], activeLine: 3,
    msg: 'dp[3] = dp[2] + dp[1] = 1 + 1 = 2.' },
  { filled: [0, 1, 2, 3, 4], writing: 4, reads: [3, 2], activeLine: 3,
    msg: 'dp[4] = dp[3] + dp[2] = 2 + 1 = 3.' },
  { filled: [0, 1, 2, 3, 4, 5], writing: 5, reads: [4, 3], activeLine: 3,
    msg: 'dp[5] = dp[4] + dp[3] = 3 + 2 = 5.' },
  { filled: [0, 1, 2, 3, 4, 5, 6], writing: 6, reads: [5, 4], activeLine: 3,
    msg: 'dp[6] = dp[5] + dp[4] = 5 + 3 = 8.' },
  { filled: [0, 1, 2, 3, 4, 5, 6, 7], writing: 7, reads: [6, 5], activeLine: 3,
    msg: 'dp[7] = dp[6] + dp[5] = 8 + 5 = 13. i > n — loop ends.' },
  { filled: [0, 1, 2, 3, 4, 5, 6, 7], writing: null, reads: [], activeLine: 5, done: true,
    msg: 'Solved! One left-to-right pass — O(n) time. Track only the last two values and it drops to O(1) space.' },
];

const ITER_CODE = [
  'function fib(n) {',
  '  const dp = [0, 1];',
  '  for (let i = 2; i <= n; i++) {',
  '    dp[i] = dp[i - 1] + dp[i - 2];',
  '  }',
  '  return dp[n];',
  '}',
];

const REC_SLIDES = [
  { view: 'plain', activeLine: null,
    msg: "fib(5) branches into fib(4) and fib(3), and each of those branches again — a naive recursive call tree has two children per node." },
  { view: 'repeats', activeLine: null,
    msg: 'fib(3) is computed twice. fib(2) is computed three times. Deeper down, fib(1) and fib(0) repeat even more — the exact same work, recomputed from scratch each time.' },
  { view: 'repeats', activeLine: null,
    msg: "That's 15 calls just to answer fib(5). The tree roughly doubles every time n grows by one, so fib(30) alone costs well over a million calls." },
  { view: 'memo', activeLine: 2,
    msg: 'Cache each result the first time it\'s computed. Every repeat call becomes a single lookup — the greyed-out subtrees never need to run again.' },
  { view: 'memo', activeLine: 3,
    msg: 'memo[n] = fib(n-1) + fib(n-2) only runs once per distinct n. This collapses the exponential tree down to one branch per subproblem — O(n) time.' },
];

const REC_CODE = [
  'function fib(n, memo = {}) {',
  '  if (n < 2) return n;',
  '  if (n in memo) return memo[n];',
  '  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);',
  '  return memo[n];',
  '}',
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function SolutionSlides({ initialTechnique, onTechniqueChange } = {}) {
  const [technique, setTechnique] = useState(initialTechnique === 'recursive' ? 'recursive' : 'iterative');
  const [slideIdx, setSlideIdx] = useState(0);

  const slides = technique === 'iterative' ? ITER_SLIDES : REC_SLIDES;
  const code = technique === 'iterative' ? ITER_CODE : REC_CODE;
  const state = slides[slideIdx];
  const isDone = technique === 'iterative' && state.done;

  const switchTechnique = (t) => { setTechnique(t); setSlideIdx(0); onTechniqueChange?.(t); };

  return (
    <div style={{ fontFamily: 'var(--sans)', color: 'var(--ink)', padding: '24px 24px 48px' }}>
      <div style={{ maxWidth: 1150, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF7F0 0%, #FFF0FF 55%, #F0F4FF 100%)',
          borderRadius: 32, border: '4px solid #FFF', boxShadow: '0 8px 0 var(--shadow-color)',
          padding: '16px 24px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              Both Solutions
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
              A short walk through the bottom-up and top-down approaches
            </p>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 0, background: '#F1F2F6', borderRadius: 100, padding: 3, border: '2px solid var(--line)' }}>
            {['iterative', 'recursive'].map((t) => (
              <button key={t} onClick={() => switchTechnique(t)} className="ssf-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900,
                padding: '7px 16px', borderRadius: 100, border: 'none', cursor: 'pointer',
                transition: 'all 0.15s',
                background: technique === t ? 'var(--secondary)' : 'transparent',
                color: technique === t ? '#FFF' : 'var(--ink-2)',
                boxShadow: technique === t ? '0 3px 0 var(--secondary-shadow)' : 'none',
              }}>
                {t === 'iterative' ? 'Bottom-Up' : 'Top-Down'}
              </button>
            ))}
          </div>
        </div>

        <style>{`
          .ssf-btn-press:active { transform: translateY(2px) !important; }
          .ssf-two-col { display: grid; grid-template-columns: minmax(0,2fr) minmax(0,3fr); gap: 20px; align-items: start; }
          @media (max-width: 900px) { .ssf-two-col { grid-template-columns: 1fr; } }
        `}</style>

        <div className="ssf-two-col">

          {/* ── LEFT: CODE + INFO ────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ background: '#2D3436', borderRadius: 20, overflow: 'hidden', border: '4px solid #1E2528', boxShadow: '0 6px 0 rgba(0,0,0,0.12)' }}>
              <div style={{ background: '#232A2D', padding: '8px 16px', borderBottom: '2px solid #1E2528' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#B2BEC3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {technique === 'iterative' ? 'Bottom-Up' : 'Top-Down'} · fib.js
                </span>
              </div>
              <div style={{ padding: '14px 18px', fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.9 }}>
                {code.map((text, index) => {
                  const isActive = state.activeLine === index;
                  return (
                    <div key={index} style={{
                      display: 'flex', gap: 10, padding: '1px 10px', borderRadius: 6,
                      background: isActive ? 'rgba(254,202,87,0.14)' : 'transparent',
                      borderLeft: `3px solid ${isActive ? '#FECA57' : 'transparent'}`,
                      whiteSpace: 'pre',
                    }}>
                      <span style={{ color: '#5A6268', userSelect: 'none', width: 14, textAlign: 'right', flexShrink: 0 }}>{index + 1}</span>
                      <span style={{ color: '#DFE6E9', fontWeight: isActive ? 900 : 500 }}>{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: 'var(--card)', borderRadius: 24, border: `3px solid ${isDone ? '#A8E6CE' : '#EDD9FF'}`, padding: '18px 20px', boxShadow: '0 5px 0 var(--shadow-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>{isDone ? '🏁' : technique === 'iterative' ? '🧮' : (state.view === 'memo' ? '⚡' : '🌳')}</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: isDone ? 'var(--easy)' : 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {isDone ? 'Solved' : technique === 'iterative' ? 'Fill the table' : (state.view === 'memo' ? 'Memoize' : 'Naive recursion')}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                {state.msg}
              </p>
              {isDone && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--easy)', fontWeight: 900, fontSize: 13 }}>
                  <Sparkles size={16} /> dp[7] = 13
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: VISUALIZATION ────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--card)', padding: '10px 14px', borderRadius: 20, border: '3px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 0 var(--shadow-color)' }}>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
                Slide {slideIdx + 1} of {slides.length}
              </div>
              <button onClick={() => setSlideIdx((i) => Math.max(0, i - 1))} disabled={slideIdx === 0} className="ssf-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 14px', borderRadius: 100,
                border: '2px solid var(--line)', background: '#F8F9FA', color: 'var(--ink-2)', cursor: 'pointer',
                opacity: slideIdx === 0 ? 0.4 : 1,
              }}>◀ Back</button>
              <button onClick={() => setSlideIdx((i) => Math.min(slides.length - 1, i + 1))} disabled={slideIdx === slides.length - 1} className="ssf-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 16px', borderRadius: 100,
                border: 'none', background: 'var(--secondary)', color: '#FFF', cursor: 'pointer',
                boxShadow: '0 3px 0 var(--secondary-shadow)',
                opacity: slideIdx === slides.length - 1 ? 0.4 : 1,
              }}>Next ▶</button>
            </div>

            <div style={{
              background: '#F8F9FA', backgroundImage: 'radial-gradient(circle, #DFE6E9 1.5px, transparent 1.5px)', backgroundSize: '22px 22px',
              border: '4px solid var(--line)', borderRadius: 28, boxShadow: 'inset 0 4px 0 rgba(0,0,0,0.03), 0 8px 0 var(--shadow-color)',
              padding: '48px 16px 24px', minHeight: 300, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 14, left: 20, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'rgba(165,94,234,0.55)' }}>
                {technique === 'iterative' ? 'dp[] array' : 'Call tree'}
              </div>
              <div style={{ overflowX: 'auto' }}>
                {technique === 'iterative' ? <DpTable state={state} /> : <RecursionTree view={state.view} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SUB-VIEWS ───────────────────────────────────────────────────────────────

function DpTable({ state }) {
  const filled = new Set(state.filled);
  const reads = new Set(state.reads);
  return (
    <svg width={N * 78 + 20} height="150" style={{ display: 'block', margin: '0 auto' }}>
      {Array.from({ length: N }, (_, i) => i).map((i) => {
        const x = 20 + i * 78;
        const isWrite = state.writing === i;
        const isRead = reads.has(i);
        const isBase = i < 2;
        return (
          <g key={i} transform={`translate(${x},30)`}>
            <rect x="0" y="0" width="58" height="58" rx="16"
              fill={isWrite ? '#FFF3CD' : isRead ? '#E0F7F5' : '#FFF'}
              stroke={isWrite ? '#FECA57' : isRead ? '#00D2D3' : 'var(--line-heavy)'}
              strokeWidth={isWrite || isRead ? 4 : 3} />
            <text x="29" y="30" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="19" fill="var(--ink)">
              {filled.has(i) ? String(VALUES[i]) : ''}
            </text>
            <text x="29" y="76" textAnchor="middle" fontSize="10.5" fontWeight="900" fontFamily="var(--mono)" fill={isBase ? '#B2BEC3' : 'var(--ink-3)'}>
              [{i}]{isBase ? ' given' : ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function RecursionTree({ view }) {
  const width = 8 * 66 + 40;
  const height = 5 * 68 + 30;
  return (
    <svg width={width} height={height} style={{ display: 'block', margin: '0 auto' }}>
      {EDGES.map((e) => {
        if (view === 'memo' && PRUNED_IDS.has(e.child.id)) return null;
        const p1 = treePx(e.parent), p2 = treePx(e.child);
        return <line key={e.from + e.to} x1={p1.x} y1={p1.y + NODE_H / 2} x2={p2.x} y2={p2.y - NODE_H / 2} stroke="#DFE6E9" strokeWidth="2.5" />;
      })}
      {ALL_NODES.map((n) => {
        if (view === 'memo' && PRUNED_IDS.has(n.id)) return null;
        const { x, y } = treePx(n);
        const isMemoHit = view === 'memo' && n.isRepeat;
        const repeatColor = view === 'repeats' ? REPEAT_COLORS[n.label] : null;
        const fill = isMemoHit ? '#E0F7F5' : repeatColor ? `${repeatColor}22` : n.base ? '#F8F9FA' : '#FFF';
        const stroke = isMemoHit ? '#00A3A4' : repeatColor || 'var(--line-heavy)';
        return (
          <g key={n.id} transform={`translate(${x - NODE_W / 2},${y - NODE_H / 2})`}>
            <rect x="0" y="0" width={NODE_W} height={NODE_H} rx="9" fill={fill} stroke={stroke} strokeWidth={repeatColor || isMemoHit ? 3 : 2} />
            <text x={NODE_W / 2} y={NODE_H / 2} textAnchor="middle" dominantBaseline="central" fontWeight="800" fontSize="11.5" fontFamily="var(--mono)" fill={stroke !== 'var(--line-heavy)' ? stroke : 'var(--ink-2)'}>
              {n.label}
            </text>
            {isMemoHit && (
              <g transform={`translate(${NODE_W - 6},-6)`}>
                <circle r="9" fill="#00D2D3" />
                <Zap x={-5} y={-5} size={10} color="#FFF" />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
