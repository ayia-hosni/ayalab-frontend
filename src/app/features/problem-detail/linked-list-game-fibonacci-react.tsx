// @ts-nocheck
import React, { useState } from 'react';
import { RotateCcw, CheckCircle, XCircle, Sparkles, Zap } from 'lucide-react';
import { POINTER_COLORS as VAR_COLORS, POINTER_TEXT_COLORS as VAR_TEXT_COLORS } from './pointer-colors';
import { ArrowMarker, ScopeVariableBadge, NodeValueBox } from './game-ui';

// ─── DATA ────────────────────────────────────────────────────────────────────

const N = 8;
const VALUES = [0, 1, 1, 2, 3, 5, 8, 13];

// Phase 1: fill-in-the-blank code, three options per blank.
const ITER_CODE_LINES = [
  { text: 'function fib(n) {', isChallenge: false },
  { text: '  const dp = [0, 1];', isChallenge: true,
    correctAnswer: '  const dp = [0, 1];',
    options: ['  const dp = [];', '  const dp = [1, 1];', '  const dp = [0, 1];'] },
  { text: '  for (let i = 2; i <= n; i++) {', isChallenge: true,
    correctAnswer: '  for (let i = 2; i <= n; i++) {',
    options: ['  for (let i = 0; i <= n; i++) {', '  for (let i = 2; i < n; i++) {', '  for (let i = 2; i <= n; i++) {'] },
  { text: '    dp[i] = dp[i - 1] + dp[i - 2];', isChallenge: true,
    correctAnswer: '    dp[i] = dp[i - 1] + dp[i - 2];',
    options: ['    dp[i] = dp[i - 1];', '    dp[i] = dp[i] + dp[i - 1];', '    dp[i] = dp[i - 1] + dp[i - 2];'] },
  { text: '  }', isChallenge: false },
  { text: '  return dp[n];', isChallenge: true,
    correctAnswer: '  return dp[n];',
    options: ['  return dp[n - 1];', '  return dp.length;', '  return dp[n];'] },
  { text: '}', isChallenge: false },
];

const REC_CODE_LINES = [
  { text: 'function fib(n, memo = {}) {', isChallenge: false },
  { text: '  if (n < 2) return n;', isChallenge: true,
    correctAnswer: '  if (n < 2) return n;',
    options: ['  if (n <= 0) return 0;', '  if (n < 1) return n;', '  if (n < 2) return n;'] },
  { text: '  if (n in memo) return memo[n];', isChallenge: true,
    correctAnswer: '  if (n in memo) return memo[n];',
    options: ['  if (memo[n]) return n;', '  if (n in memo) return n;', '  if (n in memo) return memo[n];'] },
  { text: '  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);', isChallenge: true,
    correctAnswer: '  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);',
    options: ['  memo[n] = fib(n - 1) + fib(n - 2);', '  memo[n] = fib(n - 2, memo) + fib(n - 2, memo);', '  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);'] },
  { text: '  return memo[n];', isChallenge: true,
    correctAnswer: '  return memo[n];',
    options: ['  return n;', '  return memo[n - 1];', '  return memo[n];'] },
  { text: '}', isChallenge: false },
];

// Phase 2: step-by-step trace, unlocked once the code is complete.
const ITER_BADGE_INFO = {
  init: { icon: '🎯', label: 'Base cases', color: 'var(--secondary)' },
  compute: { icon: '🧮', label: 'Compute dp[i]', color: 'var(--primary)' },
  done: { icon: '🏁', label: 'Return dp[n]', color: 'var(--secondary)' },
};
const REC_BADGE_INFO = {
  dive: { icon: '🔻', label: 'Dive deeper', color: 'var(--primary)' },
  base: { icon: '🎯', label: 'Base case', color: 'var(--secondary)' },
  combine: { icon: '🧮', label: 'Combine & store', color: '#FF5252' },
  memohit: { icon: '⚡', label: 'Memo hit!', color: '#00A3A4' },
  done: { icon: '🏁', label: 'Done', color: 'var(--easy)' },
};

const ITER_STEPS = [
  { badge: 'init', activeLine: 1, at: 'start', writing: null, reads: [], msg: 'dp[0] = 0 and dp[1] = 1 — the base cases.' },
  { badge: 'compute', activeLine: 3, at: '2', writing: 2, reads: [1, 0], msg: 'dp[2] = dp[1] + dp[0] = 1 + 0 = 1.' },
  { badge: 'compute', activeLine: 3, at: '3', writing: 3, reads: [2, 1], msg: 'dp[3] = dp[2] + dp[1] = 1 + 1 = 2.' },
  { badge: 'compute', activeLine: 3, at: '4', writing: 4, reads: [3, 2], msg: 'dp[4] = dp[3] + dp[2] = 2 + 1 = 3.' },
  { badge: 'compute', activeLine: 3, at: '5', writing: 5, reads: [4, 3], msg: 'dp[5] = dp[4] + dp[3] = 3 + 2 = 5.' },
  { badge: 'compute', activeLine: 3, at: '6', writing: 6, reads: [5, 4], msg: 'dp[6] = dp[5] + dp[4] = 5 + 3 = 8.' },
  { badge: 'compute', activeLine: 3, at: '7', writing: 7, reads: [6, 5], msg: 'dp[7] = dp[6] + dp[5] = 8 + 5 = 13.' },
  { badge: 'done', activeLine: 5, at: '7', writing: null, reads: [], msg: 'i > n — loop ends. Return dp[7] = 13.' },
];

const REC_STEPS = [
  { badge: 'dive', activeLine: 2, at: '7', writing: null, reads: [], msg: 'Dive: call fib(7) — not memoized yet, recurse into fib(6).' },
  { badge: 'dive', activeLine: 2, at: '6', writing: null, reads: [], msg: 'Dive: call fib(6) — recurse into fib(5).' },
  { badge: 'dive', activeLine: 2, at: '5', writing: null, reads: [], msg: 'Dive: call fib(5) — recurse into fib(4).' },
  { badge: 'dive', activeLine: 2, at: '4', writing: null, reads: [], msg: 'Dive: call fib(4) — recurse into fib(3).' },
  { badge: 'dive', activeLine: 2, at: '3', writing: null, reads: [], msg: 'Dive: call fib(3) — recurse into fib(2).' },
  { badge: 'dive', activeLine: 2, at: '2', writing: null, reads: [], msg: 'Dive: call fib(2) — recurse into fib(1).' },
  { badge: 'base', activeLine: 1, at: '1', writing: 1, reads: [], msg: 'Base case: fib(1) = 1. Store memo[1] = 1 and return.' },
  { badge: 'base', activeLine: 1, at: '0', writing: 0, reads: [], msg: 'Base case: fib(0) = 0. Store memo[0] = 0 and return.' },
  { badge: 'combine', activeLine: 3, at: '2', writing: 2, reads: [1, 0], msg: 'fib(2) = fib(1) + fib(0) = 1 + 0 = 1. Store memo[2] = 1.' },
  { badge: 'memohit', activeLine: 3, at: '3', writing: 3, reads: [2, 1], msg: 'fib(3) needs fib(1) again — MEMO HIT! fib(3) = fib(2) + fib(1) = 1 + 1 = 2.' },
  { badge: 'memohit', activeLine: 3, at: '4', writing: 4, reads: [3, 2], msg: 'fib(4) needs fib(2) again — MEMO HIT! fib(4) = fib(3) + fib(2) = 2 + 1 = 3.' },
  { badge: 'memohit', activeLine: 3, at: '5', writing: 5, reads: [4, 3], msg: 'fib(5) needs fib(3) again — MEMO HIT! fib(5) = fib(4) + fib(3) = 3 + 2 = 5.' },
  { badge: 'memohit', activeLine: 3, at: '6', writing: 6, reads: [5, 4], msg: 'fib(6) needs fib(4) again — MEMO HIT! fib(6) = fib(5) + fib(4) = 5 + 3 = 8.' },
  { badge: 'done', activeLine: 4, at: '7', writing: 7, reads: [6, 5], msg: 'fib(7) needs fib(5) again — MEMO HIT! fib(7) = fib(6) + fib(5) = 8 + 5 = 13. Done!' },
];

const CONFIG = {
  iterative: { code: ITER_CODE_LINES, steps: ITER_STEPS, badgeInfo: ITER_BADGE_INFO, varName: 'i' },
  recursive: { code: REC_CODE_LINES, steps: REC_STEPS, badgeInfo: REC_BADGE_INFO, varName: 'call' },
};

const CHALLENGES = {
  iterative: ITER_CODE_LINES.map((c, i) => ({ ...c, originalIndex: i })).filter((c) => c.isChallenge),
  recursive: REC_CODE_LINES.map((c, i) => ({ ...c, originalIndex: i })).filter((c) => c.isChallenge),
};

const blankUserCode = (t) => CONFIG[t].code.map((c) => (c.isChallenge ? '' : c.text));

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const idxOf = (v) => (v === 'start' ? -1 : Number(v));
const nodeX = (i) => 150 + i * 110;
const nodeCx = (i) => nodeX(i) + 26;

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function LinkedListGame({ initialTechnique, onTechniqueChange } = {}) {
  const [technique, setTechnique] = useState(initialTechnique === 'recursive' ? 'recursive' : 'iterative');
  const [gameState, setGameState] = useState({ iterative: 'coding', recursive: 'coding' });
  const [userCode, setUserCode] = useState({ iterative: blankUserCode('iterative'), recursive: blankUserCode('recursive') });
  const [challengeIndex, setChallengeIndex] = useState({ iterative: 0, recursive: 0 });
  const [visStep, setVisStep] = useState({ iterative: 0, recursive: 0 });
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });

  const { code: CODE_LINES, steps: STEPS, badgeInfo: BADGE_INFO, varName } = CONFIG[technique];
  const CHALLENGE_LIST = CHALLENGES[technique];
  const currentChallenge = CHALLENGE_LIST[challengeIndex[technique]];
  const isCoding = gameState[technique] === 'coding';

  const stepN = visStep[technique];
  const step = STEPS[stepN];
  const isDone = step.badge === 'done';

  // Every cell that's had a "writing" step happen at or before the current step is revealed.
  const revealed = new Set([0, 1]);
  for (let s = 0; s <= stepN; s++) { if (STEPS[s].writing !== null) revealed.add(STEPS[s].writing); }

  const switchTechnique = (t) => { setTechnique(t); setFeedback({ show: false, message: '', type: '' }); onTechniqueChange?.(t); };

  const handleSelect = (option) => {
    if (!isCoding || !currentChallenge) return;

    if (option === currentChallenge.correctAnswer) {
      setUserCode((prev) => {
        const next = [...prev[technique]];
        next[currentChallenge.originalIndex] = option;
        return { ...prev, [technique]: next };
      });
      setFeedback({ show: true, message: 'Correct!', type: 'success' });

      setTimeout(() => {
        setFeedback({ show: false, message: '', type: '' });
        if (challengeIndex[technique] < CHALLENGE_LIST.length - 1) {
          setChallengeIndex((prev) => ({ ...prev, [technique]: prev[technique] + 1 }));
        } else {
          setGameState((prev) => ({ ...prev, [technique]: 'visualizing' }));
          setFeedback({ show: true, message: "Code complete! Let's trace it.", type: 'info' });
          setTimeout(() => setFeedback({ show: false, message: '', type: '' }), 2800);
        }
      }, 700);
    } else {
      setFeedback({ show: true, message: 'Oops! Try again.', type: 'error' });
      setTimeout(() => setFeedback({ show: false, message: '', type: '' }), 1400);
    }
  };

  const handleReset = () => {
    setGameState((prev) => ({ ...prev, [technique]: 'coding' }));
    setUserCode((prev) => ({ ...prev, [technique]: blankUserCode(technique) }));
    setChallengeIndex((prev) => ({ ...prev, [technique]: 0 }));
    setVisStep((prev) => ({ ...prev, [technique]: 0 }));
    setFeedback({ show: false, message: '', type: '' });
  };

  const badge = BADGE_INFO[step.badge];
  const pointerCx = nodeCx(idxOf(step.at));

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
              Trace Game
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
              {isCoding ? `Step 1: Complete the ${technique === 'iterative' ? 'bottom-up' : 'top-down'} code.` : 'Step 2: Trace the execution, cell by cell.'}
            </p>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 0, background: '#F1F2F6', borderRadius: 100, padding: 3, border: '2px solid var(--line)' }}>
              {['iterative', 'recursive'].map((t) => (
                <button key={t} onClick={() => switchTechnique(t)} className="llgf-btn-press" style={{
                  fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900,
                  padding: '7px 16px', borderRadius: 100, border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: technique === t ? 'var(--secondary)' : 'transparent',
                  color: technique === t ? '#FFF' : 'var(--ink-2)',
                  boxShadow: technique === t ? '0 3px 0 var(--secondary-shadow)' : 'none',
                }}>
                  {t === 'iterative' ? 'bottom-up' : 'top-down'}
                </button>
              ))}
            </div>
            <button onClick={handleReset} className="llgf-btn-press" style={{
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
          .llgf-btn-press:active { transform: translateY(2px) !important; }
          .llgf-two-col { display: grid; grid-template-columns: minmax(0,2fr) minmax(0,3fr); gap: 20px; align-items: start; }
          @media (max-width: 900px) { .llgf-two-col { grid-template-columns: 1fr; } }
        `}</style>

        <div className="llgf-two-col">

          {/* ── LEFT: CODE + CHALLENGE ──────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ background: '#2D3436', borderRadius: 20, overflow: 'hidden', border: '4px solid #1E2528', boxShadow: '0 6px 0 rgba(0,0,0,0.12)' }}>
              <div style={{ background: '#232A2D', padding: '8px 16px', borderBottom: '2px solid #1E2528' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#B2BEC3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {technique === 'iterative' ? 'Bottom-Up' : 'Top-Down'} · fib.js
                </span>
              </div>
              <div style={{ padding: '14px 18px', fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.9 }}>
                {CODE_LINES.map((lineDef, index) => {
                  const isCurrentBlank = isCoding && lineDef.isChallenge && currentChallenge?.originalIndex === index;
                  const isFilled = lineDef.isChallenge && userCode[technique][index] !== '';
                  const isActive = !isCoding && step.activeLine === index;
                  const text = isCurrentBlank ? '  // ← pick the line below' : (isCoding ? userCode[technique][index] : lineDef.text);
                  return (
                    <div key={index} style={{
                      display: 'flex', gap: 10, padding: '1px 10px', borderRadius: 6,
                      background: isActive ? 'rgba(254,202,87,0.14)' : isCurrentBlank ? 'rgba(165,94,234,0.14)' : 'transparent',
                      borderLeft: `3px solid ${isActive ? '#FECA57' : isCurrentBlank ? 'var(--secondary)' : 'transparent'}`,
                      whiteSpace: 'pre',
                    }}>
                      <span style={{ color: '#5A6268', userSelect: 'none', width: 14, textAlign: 'right', flexShrink: 0 }}>{index + 1}</span>
                      <span style={{
                        color: isCurrentBlank ? '#C9A0F7' : isFilled ? '#7CE0A8' : '#DFE6E9',
                        fontStyle: isCurrentBlank ? 'italic' : 'normal',
                        fontWeight: isActive ? 900 : 500,
                      }}>
                        {text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ position: 'relative', minHeight: 180 }}>
              {isCoding && currentChallenge ? (
                <div style={{ background: 'var(--card)', borderRadius: 24, border: '3px solid #EDD9FF', padding: '18px 20px', boxShadow: '0 5px 0 rgba(165,94,234,0.12)' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 900, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ background: '#F3ECFF', color: 'var(--secondary)', borderRadius: 10, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                      {currentChallenge.originalIndex + 1}
                    </span>
                    Complete the missing line
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {currentChallenge.options.map((opt, i) => (
                      <button key={i} onClick={() => handleSelect(opt)} className="llgf-btn-press" style={{
                        textAlign: 'left', fontFamily: 'var(--mono)', fontSize: 12.5,
                        background: '#F8F9FA', border: '2px solid var(--line)', borderRadius: 12,
                        padding: '10px 14px', cursor: 'pointer', color: 'var(--ink-2)',
                        whiteSpace: 'pre',
                      }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : isCoding ? (
                <div style={{ background: '#F8F9FA', borderRadius: 24, border: '3px solid var(--line)', padding: 24, textAlign: 'center', color: 'var(--ink-3)', fontWeight: 700 }}>
                  Code completed!
                </div>
              ) : (
                <div style={{ background: 'var(--card)', borderRadius: 24, border: `3px solid ${badge.color}33`, padding: '18px 20px', boxShadow: '0 5px 0 var(--shadow-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 20 }}>{badge.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: badge.color, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {badge.label}
                    </span>
                    {step.badge === 'memohit' && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,210,211,0.15)', color: '#00A3A4', fontSize: 11, fontWeight: 900, padding: '3px 10px', borderRadius: 100 }}>
                        <Zap size={12} /> cache lookup
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                    {step.msg}
                  </p>
                  {isDone && (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--easy)', fontWeight: 900, fontSize: 13 }}>
                      <Sparkles size={16} /> {technique === 'iterative' ? 'dp[7] = 13' : 'fib(7) = 13'}
                    </div>
                  )}
                </div>
              )}

              <div style={{
                position: 'absolute', bottom: -8, left: '50%', transform: `translateX(-50%) ${feedback.show ? 'translateY(0)' : 'translateY(10px)'}`,
                opacity: feedback.show ? 1 : 0, transition: 'all 0.25s', pointerEvents: 'none', zIndex: 20,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 100,
                  fontWeight: 900, fontSize: 13, color: '#FFF', whiteSpace: 'nowrap',
                  background: feedback.type === 'success' ? 'var(--easy)' : feedback.type === 'error' ? '#FF6B6B' : 'var(--secondary)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
                }}>
                  {feedback.type === 'success' && <CheckCircle size={16} />}
                  {feedback.type === 'error' && <XCircle size={16} />}
                  {feedback.message}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: VISUALIZATION ────────────────────────────────────────── */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 16,
            opacity: isCoding ? 0.45 : 1,
            filter: isCoding ? 'grayscale(40%)' : 'none',
            pointerEvents: isCoding ? 'none' : 'auto',
            transition: 'all 0.4s',
          }}>
            <div style={{ background: 'var(--card)', padding: '10px 14px', borderRadius: 20, border: '3px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 0 var(--shadow-color)' }}>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
                {isCoding ? 'Complete the code to unlock the trace.' : `Step ${stepN + 1} of ${STEPS.length}`}
              </div>
              <button onClick={() => setVisStep((prev) => ({ ...prev, [technique]: Math.max(0, prev[technique] - 1) }))} disabled={isCoding || stepN === 0} className="llgf-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 14px', borderRadius: 100,
                border: '2px solid var(--line)', background: '#F8F9FA', color: 'var(--ink-2)', cursor: 'pointer',
                opacity: (isCoding || stepN === 0) ? 0.4 : 1,
              }}>◀ Back</button>
              <button onClick={() => setVisStep((prev) => ({ ...prev, [technique]: Math.min(STEPS.length - 1, prev[technique] + 1) }))} disabled={isCoding || stepN >= STEPS.length - 1} className="llgf-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 16px', borderRadius: 100,
                border: 'none', background: 'var(--secondary)', color: '#FFF', cursor: 'pointer',
                boxShadow: '0 3px 0 var(--secondary-shadow)',
                opacity: (isCoding || stepN >= STEPS.length - 1) ? 0.4 : 1,
              }}>Next ▶</button>
            </div>

            <div style={{
              background: '#F8F9FA', backgroundImage: 'radial-gradient(circle, #DFE6E9 1.5px, transparent 1.5px)', backgroundSize: '22px 22px',
              border: '4px solid var(--line)', borderRadius: 28, boxShadow: 'inset 0 4px 0 rgba(0,0,0,0.03), 0 8px 0 var(--shadow-color)',
              padding: '48px 16px 24px', minHeight: 260, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 14, left: 20, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'rgba(165,94,234,0.55)' }}>
                {technique === 'iterative' ? 'dp[] array' : 'memo{} cache'}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <svg width={nodeX(N - 1) + 92} height="260" style={{ display: 'block', margin: '0 auto' }}>
                  <defs>
                    <ArrowMarker id="llgf-ah" color="#B2BEC3" />
                  </defs>

                  <g>
                    <rect x={nodeX(-1)} y="130" width="52" height="52" rx="14" fill="none" stroke="#B2BEC3" strokeDasharray="4 4" strokeWidth="2.5" />
                    <text x={nodeCx(-1)} y="156" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="11" fill="#B2BEC3">start</text>
                  </g>

                  <line x1={nodeX(0) + 26} y1="156" x2={nodeX(N - 1) + 26} y2="156" stroke="#DFE6E9" strokeWidth="3" strokeDasharray="1 9" strokeLinecap="round" />

                  {Array.from({ length: N }, (_, i) => i).map((i) => {
                    const isBase = i < 2;
                    const isWriting = step.writing === i;
                    const isReading = step.reads.includes(i);
                    return (
                      <g key={i} transform={`translate(${nodeX(i)},130)`}>
                        <NodeValueBox
                          y={0}
                          value={revealed.has(i) ? VALUES[i] : ''}
                          active={isWriting || isReading}
                          activeFill={isWriting ? '#FFF3CD' : '#E0F7F5'}
                          activeStroke={isWriting ? '#FECA57' : '#00D2D3'}
                        />
                        <text x="26" y="72" textAnchor="middle" fontSize="10.5" fontWeight="900" fill={isBase ? '#B2BEC3' : 'var(--ink-3)'} fontFamily="var(--mono)">
                          [{i}]{isBase ? ' given' : ''}
                        </text>
                      </g>
                    );
                  })}

                  <ScopeVariableBadge
                    x={pointerCx - 28} label={varName}
                    color={VAR_COLORS[varName]} textColor={VAR_TEXT_COLORS[varName]}
                    hasTarget targetX={28} targetY={130}
                    draggable={false} markerId="llgf-ah" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
