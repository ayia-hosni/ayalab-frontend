// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, CheckCircle, XCircle, Sparkles, MousePointer2, Zap } from 'lucide-react';
import { POINTER_COLORS as VAR_COLORS, POINTER_TEXT_COLORS as VAR_TEXT_COLORS } from './pointer-colors';
import { ArrowMarker, ScopeVariableBadge, NodeValueBox } from './game-ui';

// ─── DATA ────────────────────────────────────────────────────────────────────
// dp[0..7]: the classic 0,1,1,2,3,5,8,13 run — long enough to show the pattern,
// short enough to read at a glance next to the code panel.

const N = 8;
const VALUES = [0, 1, 1, 2, 3, 5, 8, 13];
const BASE_COUNT = 2; // dp[0] and dp[1] are given, not computed

// Bottom-up: drag i across the array once per cell, each drop fills dp[i].
const ITERATIVE_STEPS = [
  { from: 'i', to: '2', desc: 'Drag i to index 2 — dp[2] = dp[1] + dp[0] = 1 + 0 = 1.' },
  { from: 'i', to: '3', desc: 'dp[3] = dp[2] + dp[1] = 1 + 1 = 2.' },
  { from: 'i', to: '4', desc: 'dp[4] = dp[3] + dp[2] = 2 + 1 = 3.' },
  { from: 'i', to: '5', desc: 'dp[5] = dp[4] + dp[3] = 3 + 2 = 5.' },
  { from: 'i', to: '6', desc: 'dp[6] = dp[5] + dp[4] = 5 + 3 = 8.' },
  { from: 'i', to: '7', desc: 'dp[7] = dp[6] + dp[5] = 8 + 5 = 13. i > n — loop ends.' },
];

// Top-down memo: dive from fib(7) down to the base cases, then climb back up.
// Every "combine" step reads two already-memoized cells — from index 3 onward
// at least one of those reads is a genuine cache hit on a call that happened
// several steps ago, which is exactly the redundancy naive recursion repeats.
const RECURSIVE_STEPS = [
  { from: 'call', to: '7', phase: 'dive', desc: 'Dive: call fib(7) — not memoized yet, recurse into fib(6).' },
  { from: 'call', to: '6', phase: 'dive', desc: 'Dive: call fib(6) — recurse into fib(5).' },
  { from: 'call', to: '5', phase: 'dive', desc: 'Dive: call fib(5) — recurse into fib(4).' },
  { from: 'call', to: '4', phase: 'dive', desc: 'Dive: call fib(4) — recurse into fib(3).' },
  { from: 'call', to: '3', phase: 'dive', desc: 'Dive: call fib(3) — recurse into fib(2).' },
  { from: 'call', to: '2', phase: 'dive', desc: 'Dive: call fib(2) — recurse into fib(1).' },
  { from: 'call', to: '1', phase: 'base', desc: 'Base case: fib(1) = 1. Store memo[1] = 1 and return.' },
  { from: 'call', to: '0', phase: 'base', desc: 'Base case: fib(0) = 0. Store memo[0] = 0 and return.' },
  { from: 'call', to: '2', phase: 'combine', memoHit: false, desc: 'fib(2) = fib(1) + fib(0) = 1 + 0 = 1. Store memo[2] = 1.' },
  { from: 'call', to: '3', phase: 'combine', memoHit: true, desc: 'fib(3) needs fib(1) again — MEMO HIT! fib(3) = fib(2) + fib(1) = 1 + 1 = 2.' },
  { from: 'call', to: '4', phase: 'combine', memoHit: true, desc: 'fib(4) needs fib(2) again — MEMO HIT! fib(4) = fib(3) + fib(2) = 2 + 1 = 3.' },
  { from: 'call', to: '5', phase: 'combine', memoHit: true, desc: 'fib(5) needs fib(3) again — MEMO HIT! fib(5) = fib(4) + fib(3) = 3 + 2 = 5.' },
  { from: 'call', to: '6', phase: 'combine', memoHit: true, desc: 'fib(6) needs fib(4) again — MEMO HIT! fib(6) = fib(5) + fib(4) = 5 + 3 = 8.' },
  { from: 'call', to: '7', phase: 'combine', memoHit: true, desc: 'fib(7) needs fib(5) again — MEMO HIT! fib(7) = fib(6) + fib(5) = 8 + 5 = 13. Done!' },
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
const ITER_ACTIVE_LINE = { dive: 2, combine: 3 };

const REC_CODE = [
  'function fib(n, memo = {}) {',
  '  if (n < 2) return n;',
  '  if (n in memo) return memo[n];',
  '  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);',
  '  return memo[n];',
  '}',
];

const CONFIG = {
  iterative: { steps: ITERATIVE_STEPS, code: ITER_CODE },
  recursive: { steps: RECURSIVE_STEPS, code: REC_CODE },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const idxOf = (v) => (v === 'start' ? -1 : Number(v));
const nodeX = (i) => 150 + i * 110;
const nodeCx = (i) => nodeX(i) + 26;

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function MovePointer({ initialTechnique, onTechniqueChange } = {}) {
  const [technique, setTechnique] = useState(initialTechnique === 'recursive' ? 'recursive' : 'iterative');
  const [stepIdx, setStepIdx] = useState({ iterative: 0, recursive: 0 });
  const [pointerAt, setPointerAt] = useState({ iterative: 'start', recursive: 'start' });
  const [lastStep, setLastStep] = useState({ iterative: null, recursive: null });
  const [dragging, setDragging] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const draggingRef = useRef(null);
  draggingRef.current = dragging;

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onTouchMove = (e) => { if (draggingRef.current) e.preventDefault(); };
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, []);

  const { steps, code } = CONFIG[technique];
  const varName = technique === 'iterative' ? 'i' : 'call';
  const completedCount = stepIdx[technique];
  const currentHint = steps[completedCount] ?? null;
  const isComplete = currentHint === null;
  const last = lastStep[technique];
  const activeLine = technique === 'iterative'
    ? (last ? 3 : null)
    : (last ? (last.phase === 'combine' ? 3 : last.phase === 'base' ? 1 : 2) : null);

  // Which cells have a value to show yet.
  const revealed = new Set([0, 1]);
  if (technique === 'iterative') {
    for (let s = 0; s < completedCount; s++) revealed.add(Number(ITERATIVE_STEPS[s].to));
  } else {
    for (let s = 0; s < completedCount; s++) {
      const step = RECURSIVE_STEPS[s];
      if (step.phase === 'base' || step.phase === 'combine') revealed.add(Number(step.to));
    }
  }

  // Spotlight the two cells the most recent write just read from — dp[i-1]/dp[i-2]
  // for bottom-up, or the two resolved subcalls for a top-down combine step.
  const readingPair = last && (technique === 'iterative' || last.phase === 'combine')
    ? [Number(last.to) - 1, Number(last.to) - 2]
    : [];
  const writingCell = last ? Number(last.to) : null;
  const writingIsCombine = technique === 'iterative' || last?.phase === 'combine' || last?.phase === 'base';

  const canDrag = !isComplete && currentHint && currentHint.from === varName;

  const flashFeedback = (type, message) => {
    setFeedback({ show: true, type, message });
    setTimeout(() => setFeedback({ show: false, message: '', type: '' }), 900);
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!canDrag) return;
    const rect = svgRef.current.getBoundingClientRect();
    setDragging(true);
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    const rect = svgRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleDrop = (e, targetId) => {
    e.stopPropagation();
    if (!dragging) return;
    if (targetId === currentHint.to) {
      const done = currentHint;
      setPointerAt(prev => ({ ...prev, [technique]: targetId }));
      setLastStep(prev => ({ ...prev, [technique]: done }));
      setStepIdx(prev => ({ ...prev, [technique]: prev[technique] + 1 }));
      flashFeedback('success', 'Correct!');
    } else {
      flashFeedback('error', 'Not quite — try again.');
    }
    setDragging(false);
  };

  const handleGlobalPointerUp = (e) => {
    if (!dragging) return;
    if (e?.pointerType === 'touch') {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const dropEl = el?.closest('[data-drop-id]');
      if (dropEl) { handleDrop(e, dropEl.getAttribute('data-drop-id')); return; }
    }
    setDragging(false);
  };

  const switchTechnique = (t) => { setTechnique(t); setDragging(false); setFeedback({ show: false, message: '', type: '' }); onTechniqueChange?.(t); };

  const handleReset = () => {
    setStepIdx(prev => ({ ...prev, [technique]: 0 }));
    setPointerAt(prev => ({ ...prev, [technique]: 'start' }));
    setLastStep(prev => ({ ...prev, [technique]: null }));
    setDragging(false);
    setFeedback({ show: false, message: '', type: '' });
  };

  const varCx = nodeCx(idxOf(pointerAt[technique]));
  const dragOrigin = { x: varCx, y: 50 };

  return (
    <div ref={wrapperRef} style={{ fontFamily: 'var(--sans)', color: 'var(--ink)', padding: '24px 24px 48px', userSelect: 'none', WebkitUserSelect: 'none' }}
      onPointerMove={handlePointerMove} onPointerUp={handleGlobalPointerUp} onPointerCancel={() => setDragging(false)} onMouseLeave={() => setDragging(false)}>
      <div style={{ maxWidth: 1150, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF7F0 0%, #FFF0FF 55%, #F0F4FF 100%)',
          borderRadius: 32, border: '4px solid #FFF', boxShadow: '0 8px 0 var(--shadow-color)',
          padding: '16px 24px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              Fill the DP Table
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
              Drag the pointer yourself — the code lights up once you get it right
            </p>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 0, background: '#F1F2F6', borderRadius: 100, padding: 3, border: '2px solid var(--line)' }}>
              {['iterative', 'recursive'].map(t => (
                <button key={t} onClick={() => switchTechnique(t)} className="mpf-btn-press" style={{
                  fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900,
                  padding: '7px 16px', borderRadius: 100, border: 'none', cursor: 'pointer',
                  textTransform: 'capitalize', transition: 'all 0.15s',
                  background: technique === t ? 'var(--secondary)' : 'transparent',
                  color: technique === t ? '#FFF' : 'var(--ink-2)',
                  boxShadow: technique === t ? '0 3px 0 var(--secondary-shadow)' : 'none',
                }}>
                  {t === 'iterative' ? 'bottom-up' : 'top-down'}
                </button>
              ))}
            </div>
            <button onClick={handleReset} className="mpf-btn-press" style={{
              fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900,
              padding: '9px 16px', borderRadius: 100,
              border: '3px solid var(--line)', background: 'var(--card)',
              color: 'var(--ink)', cursor: 'pointer', boxShadow: '0 4px 0 var(--shadow-color)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>

        <style>{`
          .mpf-btn-press:active { transform: translateY(2px) !important; }
          .mpf-two-col { display: grid; grid-template-columns: minmax(0,2fr) minmax(0,3fr); gap: 20px; align-items: start; }
          @media (max-width: 900px) { .mpf-two-col { grid-template-columns: 1fr; } }
        `}</style>

        <div className="mpf-two-col">

          {/* ── LEFT: CODE + HINT ────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>

            <div style={{ background: '#2D3436', borderRadius: 20, overflow: 'hidden', border: '4px solid #1E2528', boxShadow: '0 6px 0 rgba(0,0,0,0.12)' }}>
              <div style={{ background: '#232A2D', padding: '8px 16px', borderBottom: '2px solid #1E2528' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#B2BEC3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {technique === 'iterative' ? 'Bottom-Up' : 'Top-Down'} · fib.js
                </span>
              </div>
              <div style={{ padding: '14px 18px', fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.9 }}>
                {code.map((text, index) => {
                  const isActive = activeLine === index;
                  return (
                    <div key={index} style={{
                      display: 'flex', gap: 10, padding: '1px 10px', borderRadius: 6,
                      background: isActive ? 'rgba(72,187,120,0.16)' : 'transparent',
                      borderLeft: `3px solid ${isActive ? 'var(--easy)' : 'transparent'}`,
                      whiteSpace: 'pre', transition: 'all 0.3s',
                    }}>
                      <span style={{ color: '#5A6268', userSelect: 'none', width: 14, textAlign: 'right', flexShrink: 0 }}>{index + 1}</span>
                      <span style={{ color: isActive ? '#7CE0A8' : '#DFE6E9', fontWeight: isActive ? 900 : 500 }}>{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: 'var(--card)', borderRadius: 24, border: `3px solid ${isComplete ? '#A8E6CE' : '#EDD9FF'}`, padding: '18px 20px', boxShadow: '0 5px 0 var(--shadow-color)' }}>
              {isComplete ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--easy)', fontWeight: 900, fontSize: 14, marginBottom: 6 }}>
                    <Sparkles size={18} /> Solved!
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                    {technique === 'iterative'
                      ? 'dp[7] = 13 — the table filled in a single left-to-right pass.'
                      : 'fib(7) = 13 — only 8 unique subproblems were ever computed, each one exactly once.'}
                  </p>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#D49B1C' }}>Drag</span>
                    <span style={{ background: 'var(--primary)', color: '#FFF', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 900, padding: '3px 10px', borderRadius: 8 }}>
                      {currentHint.from}
                    </span>
                    <MousePointer2 size={13} style={{ color: '#D49B1C' }} />
                    <span style={{ background: 'var(--easy)', color: '#FFF', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 900, padding: '3px 10px', borderRadius: 8 }}>
                      {currentHint.to}
                    </span>
                    {currentHint.phase === 'combine' && currentHint.memoHit && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,210,211,0.15)', color: '#00A3A4', fontSize: 11, fontWeight: 900, padding: '3px 10px', borderRadius: 100 }}>
                        <Zap size={12} /> memo hit ahead
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                    {currentHint.desc}
                  </p>
                </>
              )}

              <div style={{
                position: 'absolute', bottom: -8, left: '50%', transform: `translateX(-50%) ${feedback.show ? 'translateY(0)' : 'translateY(10px)'}`,
                opacity: feedback.show ? 1 : 0, transition: 'all 0.25s', pointerEvents: 'none', zIndex: 20,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 100,
                  fontWeight: 900, fontSize: 13, color: '#FFF', whiteSpace: 'nowrap',
                  background: feedback.type === 'success' ? 'var(--easy)' : '#FF6B6B',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
                }}>
                  {feedback.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  {feedback.message}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: CANVAS ───────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--card)', padding: '10px 14px', borderRadius: 20, border: '3px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 0 var(--shadow-color)' }}>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
                {isComplete ? `All ${steps.length} steps complete!` : `Step ${completedCount + 1} of ${steps.length}`}
              </div>
              <div style={{ height: 8, width: 120, background: 'rgba(165,94,234,0.1)', borderRadius: 100, overflow: 'hidden', border: '2px solid rgba(165,94,234,0.12)' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--secondary), var(--easy))', borderRadius: 100, width: `${Math.round((completedCount / steps.length) * 100)}%`, transition: 'width 0.4s' }} />
              </div>
            </div>

            <div style={{
              background: '#F8F9FA', backgroundImage: 'radial-gradient(circle, #DFE6E9 1.5px, transparent 1.5px)', backgroundSize: '22px 22px',
              border: '4px solid var(--line)', borderRadius: 28, boxShadow: 'inset 0 4px 0 rgba(0,0,0,0.03), 0 8px 0 var(--shadow-color)',
              padding: '48px 16px 24px', minHeight: 320, position: 'relative', overflow: 'hidden', touchAction: 'none',
            }}>
              <div style={{ position: 'absolute', top: 14, left: 20, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'rgba(165,94,234,0.55)' }}>
                {technique === 'iterative' ? 'dp[] array' : 'memo{} cache'}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <svg ref={svgRef} width={nodeX(N - 1) + 92} height="260" style={{ display: 'block', margin: '0 auto' }}>
                  <defs>
                    <ArrowMarker id="mpf-ah" color="#B2BEC3" />
                    <ArrowMarker id="mpf-ah-drag" color="#FECA57" />
                  </defs>

                  {/* start flag — the pointer's home before the first drag */}
                  <g>
                    <rect x={nodeX(-1)} y="130" width="52" height="52" rx="14" fill="none" stroke="#B2BEC3" strokeDasharray="4 4" strokeWidth="2.5" />
                    <text x={nodeCx(-1)} y="156" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="11" fill="#B2BEC3">start</text>
                  </g>

                  {/* baseline connecting the cells, like a ruler */}
                  <line x1={nodeX(0) + 26} y1="156" x2={nodeX(N - 1) + 26} y2="156" stroke="#DFE6E9" strokeWidth="3" strokeDasharray="1 9" strokeLinecap="round" />

                  {Array.from({ length: N }, (_, i) => i).map((i) => {
                    const isBase = i < BASE_COUNT;
                    const isWriting = writingCell === i && writingIsCombine;
                    const isReading = readingPair.includes(i);
                    const hasValue = revealed.has(i);
                    return (
                      <g key={i} transform={`translate(${nodeX(i)},130)`}>
                        <NodeValueBox
                          y={0}
                          value={hasValue ? VALUES[i] : ''}
                          active={isWriting || isReading}
                          activeFill={isWriting ? '#FFF3CD' : '#E0F7F5'}
                          activeStroke={isWriting ? '#FECA57' : '#00D2D3'}
                          dropId={String(i)}
                          onPointerUp={(e) => handleDrop(e, String(i))}
                        />
                        <text x="26" y="72" textAnchor="middle" fontSize="10.5" fontWeight="900" fill={isBase ? '#B2BEC3' : 'var(--ink-3)'} fontFamily="var(--mono)">
                          [{i}]{isBase ? ' given' : ''}
                        </text>
                      </g>
                    );
                  })}

                  {/* pointer badge — floats above wherever i/call currently sits */}
                  <ScopeVariableBadge
                    x={varCx - 28} label={varName}
                    color={VAR_COLORS[varName]} textColor={VAR_TEXT_COLORS[varName]}
                    hasTarget targetX={28} targetY={130}
                    draggable={canDrag} onDragStart={handlePointerDown}
                    markerId="mpf-ah" />

                  {dragging && (
                    <line x1={dragOrigin.x} y1={dragOrigin.y} x2={mousePos.x} y2={mousePos.y} stroke="#FECA57" strokeWidth="2.5" strokeDasharray="6,5" markerEnd="url(#mpf-ah-drag)" style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 4px rgba(254,202,87,0.6))' }} />
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
