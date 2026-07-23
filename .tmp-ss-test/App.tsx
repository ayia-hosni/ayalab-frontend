// @ts-nocheck
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────────────────

const N = 5;
const VALUES = [1, 2, 3, 4, 5];

const ITER_CODE = [
  'function reverseList(head) {',
  '  let prev = null;',
  '  let curr = head;',
  '  while (curr !== null) {',
  '    let next = curr.next;',
  '    curr.next = prev;',
  '    prev = curr;',
  '    curr = next;',
  '  }',
  '  return prev;',
  '}',
];

const REC_CODE = [
  'function reverseList(head) {',
  '  if (!head?.next) return head;',
  '  let p = reverseList(head.next);',
  '  head.next.next = head;',
  '  head.next = null;',
  '  return p;',
  '}',
];

const ITER_BADGE_INFO = {
  init:  { icon: '🎯', label: 'Initialize',       color: 'var(--secondary)' },
  save:  { icon: '💾', label: 'Save the link',     color: 'var(--primary)'  },
  flip:  { icon: '🔄', label: 'Reverse the arrow', color: '#FF5252'         },
  slide: { icon: '➡️', label: 'Slide forward',     color: 'var(--easy)'     },
  done:  { icon: '🏁', label: 'Return new head',   color: 'var(--secondary)' },
};

const REC_BADGE_INFO = {
  base: { icon: '🎯', label: 'Base case',         color: 'var(--secondary)' },
  flip: { icon: '🔄', label: 'Reverse the arrow',  color: '#FF5252'          },
  brk:  { icon: '✂️', label: 'Clear old link',     color: 'var(--primary)'  },
  done: { icon: '🏁', label: 'Return new head',    color: 'var(--secondary)' },
};

// Build every intermediate state of the iterative walk (links snapshot each step).
function buildIterativeStates() {
  const links = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 'null' };
  const states = [];
  states.push({ line: 2, badge: 'init', iter: 0, prev: null, curr: 0, next: null, links: { ...links },
    msg: 'Initialize: prev = null, curr = head (node 1).' });
  let prev = null, curr = 0, iter = 0;
  while (curr !== null) {
    iter++;
    const next = links[curr];
    states.push({ line: 4, badge: 'save', iter, prev, curr, next, links: { ...links },
      msg: `Save curr.next before breaking the link: next = ${next === 'null' ? 'null' : `node ${VALUES[next]}`}.` });
    links[curr] = prev === null ? 'null' : prev;
    states.push({ line: 5, badge: 'flip', iter, prev, curr, next, links: { ...links },
      msg: `Flip the arrow: node ${VALUES[curr]} now points ${prev === null ? 'to null' : `back to node ${VALUES[prev]}`}.` });
    prev = curr; curr = next === 'null' ? null : next;
    states.push({ line: 6, badge: 'slide', iter, prev, curr, next, links: { ...links },
      msg: `Slide forward: prev = node ${VALUES[prev]}, curr = ${curr === null ? 'null' : `node ${VALUES[curr]}`}.` });
  }
  states.push({ line: 9, badge: 'done', iter: 0, prev, curr: null, next: null, links: { ...links },
    msg: `curr is null — the loop ends. Return prev (node ${VALUES[prev]}) as the new head!` });
  return states;
}

// Build every intermediate state of the recursive unwind (links snapshot each step).
function buildRecursiveStates() {
  const links = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 'null' };
  const states = [];
  states.push({ line: 1, badge: 'base', frame: N, p: N - 1, headIdx: N - 1, links: { ...links },
    msg: `Base case: node ${VALUES[N - 1]} has no next — return it as p.` });
  for (let headIdx = N - 2; headIdx >= 0; headIdx--) {
    links[headIdx + 1] = headIdx;
    states.push({ line: 3, badge: 'flip', frame: headIdx + 1, p: N - 1, headIdx, links: { ...links },
      msg: `Unwinding: node ${VALUES[headIdx + 1]}'s next now points back at node ${VALUES[headIdx]}.` });
    links[headIdx] = 'null';
    states.push({ line: 4, badge: 'brk', frame: headIdx + 1, p: N - 1, headIdx, links: { ...links },
      msg: `Node ${VALUES[headIdx]}'s old forward link is cleared to null — for now.` });
  }
  states.push({ line: 5, badge: 'done', frame: 0, p: N - 1, headIdx: null, links: { ...links },
    msg: `Recursion fully unwound. p points at node ${VALUES[N - 1]} — the new head!` });
  return states;
}

const ITER_STATES = buildIterativeStates();
const REC_STATES = buildRecursiveStates();

// Every intermediate state gets its own slide — all 5 iterations in full, not just a sample.
const ITER_SLIDES = ITER_STATES;
const REC_SLIDES = REC_STATES;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// Physical display order: nodes slide into place as the reversal progresses, exactly
// like the Trace Game canvas — the reversed portion (from startHints[0]) leads, the
// untouched remainder (from startHints[1]) follows.
function displayChain(links, startHints) {
  const visited = new Set();
  const follow = (start) => {
    const chain = [];
    let node = start;
    while (node !== null && node !== undefined && !visited.has(node)) {
      visited.add(node); chain.push(node);
      const nxt = links[node];
      node = nxt === 'null' ? null : nxt;
    }
    return chain;
  };
  let combined = [];
  startHints.forEach(h => { combined = combined.concat(follow(h)); });
  for (let i = 0; i < N; i++) if (!combined.includes(i)) combined.push(i);
  return combined;
}

const nodeX  = (i) => 40 + i * 110;
const nodeCx = (i) => nodeX(i) + 26;

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function SolutionSlides() {
  const [technique, setTechnique] = useState('iterative');
  const [slideIdx, setSlideIdx] = useState(0);

  const slides = technique === 'iterative' ? ITER_SLIDES : REC_SLIDES;
  const code = technique === 'iterative' ? ITER_CODE : REC_CODE;
  const badgeInfo = technique === 'iterative' ? ITER_BADGE_INFO : REC_BADGE_INFO;
  const state = slides[slideIdx];
  const badge = badgeInfo[state.badge];
  const isDone = state.badge === 'done';

  const startHints = technique === 'iterative' ? [state.prev, state.curr] : [N - 1, 0];
  const chain = displayChain(state.links, startHints);
  const displayPos = (origIdx) => origIdx === null || origIdx === undefined ? null : chain.indexOf(origIdx);
  const arrowExists = (displayIdx) => displayIdx < chain.length - 1 && state.links[chain[displayIdx]] === chain[displayIdx + 1];

  const switchTechnique = (t) => { setTechnique(t); setSlideIdx(0); };

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
              📽️ Both Solutions
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
              A short walk through the iterative and recursive approaches
            </p>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 0, background: '#F1F2F6', borderRadius: 100, padding: 3, border: '2px solid var(--line)' }}>
            {['iterative', 'recursive'].map(t => (
              <button key={t} onClick={() => switchTechnique(t)} className="ss-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900,
                padding: '7px 16px', borderRadius: 100, border: 'none', cursor: 'pointer',
                textTransform: 'capitalize', transition: 'all 0.15s',
                background: technique === t ? 'var(--secondary)' : 'transparent',
                color: technique === t ? '#FFF' : 'var(--ink-2)',
                boxShadow: technique === t ? '0 3px 0 var(--secondary-shadow)' : 'none',
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <style>{`.ss-btn-press:active { transform: translateY(2px) !important; }`}</style>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,3fr)', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT: CODE + INFO ────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ background: '#2D3436', borderRadius: 20, overflow: 'hidden', border: '4px solid #1E2528', boxShadow: '0 6px 0 rgba(0,0,0,0.12)' }}>
              <div style={{ background: '#232A2D', padding: '8px 16px', borderBottom: '2px solid #1E2528' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#B2BEC3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {technique === 'iterative' ? 'Iterative' : 'Recursive'} · reverseList.js
                </span>
              </div>
              <div style={{ padding: '14px 18px', fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.9 }}>
                {code.map((text, index) => {
                  const isActive = state.line === index;
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

            <div style={{ background: 'var(--card)', borderRadius: 24, border: `3px solid ${badge.color}33`, padding: '18px 20px', boxShadow: '0 5px 0 var(--shadow-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>{badge.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: badge.color, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {badge.label}
                </span>
                {technique === 'iterative' && state.iter > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 900, color: 'var(--ink-3)', background: '#F1F2F6', padding: '3px 10px', borderRadius: 100 }}>
                    Iteration {state.iter} of {N}
                  </span>
                )}
                {technique === 'recursive' && state.frame > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 900, color: 'var(--ink-3)', background: '#F1F2F6', padding: '3px 10px', borderRadius: 100 }}>
                    {state.badge === 'base' ? `Frame ${state.frame} (deepest)` : `Unwinding frame ${state.frame}`}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                {state.msg}
              </p>
              {isDone && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--easy)', fontWeight: 900, fontSize: 13 }}>
                  <Sparkles size={16} /> List fully reversed: 5 → 4 → 3 → 2 → 1 → null
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
              <button onClick={() => setSlideIdx(i => Math.max(0, i - 1))} disabled={slideIdx === 0} className="ss-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 14px', borderRadius: 100,
                border: '2px solid var(--line)', background: '#F8F9FA', color: 'var(--ink-2)', cursor: 'pointer',
                opacity: slideIdx === 0 ? 0.4 : 1,
              }}>◀ Back</button>
              <button onClick={() => setSlideIdx(i => Math.min(slides.length - 1, i + 1))} disabled={slideIdx === slides.length - 1} className="ss-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 16px', borderRadius: 100,
                border: 'none', background: 'var(--secondary)', color: '#FFF', cursor: 'pointer',
                boxShadow: '0 3px 0 var(--secondary-shadow)',
                opacity: slideIdx === slides.length - 1 ? 0.4 : 1,
              }}>Next ▶</button>
            </div>

            <div style={{
              background: '#F8F9FA', backgroundImage: 'radial-gradient(circle, #DFE6E9 1.5px, transparent 1.5px)', backgroundSize: '22px 22px',
              border: '4px solid var(--line)', borderRadius: 28, boxShadow: 'inset 0 4px 0 rgba(0,0,0,0.03), 0 8px 0 var(--shadow-color)',
              padding: '48px 16px 24px', minHeight: 260, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 14, left: 20, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'rgba(165,94,234,0.55)' }}>
                Current State
              </div>
              <div style={{ overflowX: 'auto' }}>
                <svg width={Math.max(N, chain.length) * 110 + 80} height="220" style={{ display: 'block', margin: '0 auto' }}>
                  <defs>
                    <marker id="ss-ah" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                      <polygon points="0 0,8 3,0 6" fill="#B2BEC3" />
                    </marker>
                    <marker id="ss-ah-flip" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                      <polygon points="0 0,8 3,0 6" fill="#FF5252" />
                    </marker>
                  </defs>

                  <text x="20" y="105" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="16" fill="#B2BEC3">∅</text>
                  <text x={nodeX(chain.length - 1) + 78} y="105" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="16" fill="#B2BEC3">∅</text>

                  {chain.map((origIdx, i) => arrowExists(i) && (
                    <line key={`a-${origIdx}`} x1={nodeX(i) + 52} y1="105" x2={nodeX(i + 1)} y2="105" stroke="#B2BEC3" strokeWidth="3" markerEnd="url(#ss-ah)" style={{ transition: 'all 0.5s' }} />
                  ))}

                  {/* Spell out "curr.next = prev" explicitly — don't rely on the chain reorder alone,
                      since the new link isn't always between physically-adjacent display slots. */}
                  {technique === 'iterative' && state.badge === 'flip' && displayPos(state.curr) !== null && (() => {
                    const x1 = nodeX(displayPos(state.curr)) + 26;
                    const toPos = state.prev !== null ? displayPos(state.prev) : null;
                    if (toPos !== null) {
                      const x2 = nodeX(toPos) + 26;
                      const midX = (x1 + x2) / 2;
                      return (
                        <path d={`M ${x1} 137 Q ${midX} 192 ${x2} 137`} stroke="#FF5252" strokeWidth="3" strokeDasharray="7,5" fill="none" markerEnd="url(#ss-ah-flip)" style={{ transition: 'all 0.5s' }} />
                      );
                    }
                    return (
                      <g style={{ transition: 'transform 0.5s' }}>
                        <path d={`M ${x1} 137 L ${x1} 168`} stroke="#FF5252" strokeWidth="3" strokeDasharray="4 3" fill="none" markerEnd="url(#ss-ah-flip)" />
                        <text x={x1} y="182" textAnchor="middle" fontSize="12" fontWeight="900" fill="#FF5252" fontFamily="var(--mono)">null</text>
                      </g>
                    );
                  })()}

                  {chain.map((origIdx, i) => {
                    const isActive = technique === 'iterative' ? state.curr === origIdx : state.headIdx === origIdx;
                    return (
                      <g key={origIdx} style={{ transition: 'transform 0.5s' }} transform={`translate(${nodeX(i)},0)`}>
                        <rect x="0" y="85" width="52" height="52" rx="18"
                          fill={isActive ? '#FFF3CD' : '#FFF'} stroke={isActive ? '#FECA57' : 'var(--line-heavy)'}
                          strokeWidth={isActive ? 4 : 3} />
                        <text x="26" y="111" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="20" fill="var(--ink)">
                          {VALUES[origIdx]}
                        </text>
                      </g>
                    );
                  })}

                  {technique === 'iterative' ? (
                    <>
                      {displayPos(state.prev) !== null && (
                        <g style={{ transition: 'transform 0.5s' }} transform={`translate(${nodeCx(displayPos(state.prev))},0)`}>
                          <line x1="0" y1="23" x2="0" y2="75" stroke="#FF5252" strokeWidth="2.5" markerEnd="url(#ss-ah)" />
                          <rect x="-24" y="1" width="48" height="22" rx="8" fill="#FF5252" />
                          <text x="0" y="16" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="13" fill="#FFF">prev</text>
                        </g>
                      )}
                      {/* `next` only means something while it's being saved/used — stale once we've slid past it */}
                      {(state.badge === 'save' || state.badge === 'flip') && state.next !== null && state.next !== 'null' && displayPos(state.next) !== null && (
                        <g style={{ transition: 'transform 0.5s' }} transform={`translate(${nodeCx(displayPos(state.next)) + 20},0)`}>
                          <line x1="0" y1="23" x2="0" y2="75" stroke="#FECA57" strokeWidth="2.5" markerEnd="url(#ss-ah)" />
                          <rect x="-22" y="1" width="44" height="22" rx="8" fill="#FECA57" />
                          <text x="0" y="16" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="13" fill="#7A5000">next</text>
                        </g>
                      )}
                      {displayPos(state.curr) !== null && (
                        <g style={{ transition: 'transform 0.5s' }} transform={`translate(${nodeCx(displayPos(state.curr))},0)`}>
                          <line x1="0" y1="53" x2="0" y2="75" stroke="#00D2D3" strokeWidth="2.5" markerEnd="url(#ss-ah)" />
                          <rect x="-24" y="31" width="48" height="22" rx="8" fill="#00D2D3" />
                          <text x="0" y="46" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="13" fill="#FFF">curr</text>
                        </g>
                      )}
                    </>
                  ) : (
                    displayPos(state.p) !== null && (
                      <g style={{ transition: 'transform 0.5s' }} transform={`translate(${nodeCx(displayPos(state.p))},0)`}>
                        <line x1="0" y1="23" x2="0" y2="75" stroke="var(--secondary)" strokeWidth="2.5" markerEnd="url(#ss-ah)" />
                        <rect x="-14" y="1" width="28" height="22" rx="8" fill="var(--secondary)" />
                        <text x="0" y="16" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="13" fill="#FFF">p</text>
                      </g>
                    )
                  )}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
