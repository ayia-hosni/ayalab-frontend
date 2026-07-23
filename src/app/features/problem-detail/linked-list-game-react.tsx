// @ts-nocheck
import React, { useState } from 'react';
import { RotateCcw, CheckCircle, XCircle, Sparkles } from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────────────────

const N = 5;
const VALUES = [1, 2, 3, 4, 5];

// The code, with five fill-in-the-blank challenges (indices into ITER_CODE_LINES).
const ITER_CODE_LINES = [
  { text: 'function reverseList(head) {', isChallenge: false },
  { text: '  let prev = null, curr = head;', isChallenge: true,
    correctAnswer: '  let prev = null, curr = head;',
    options: ['  let prev = head, curr = null;', '  let curr = null, prev = curr;', '  let prev = null, curr = head;'] },
  { text: '  while (curr !== null) {', isChallenge: false },
  { text: '    let next = curr.next;', isChallenge: true,
    correctAnswer: '    let next = curr.next;',
    options: ['    let next = curr;', '    let next = prev.next;', '    let next = curr.next;'] },
  { text: '    curr.next = prev;', isChallenge: true,
    correctAnswer: '    curr.next = prev;',
    options: ['    prev.next = curr;', '    curr = prev;', '    curr.next = prev;'] },
  { text: '    prev = curr;  curr = next;', isChallenge: true,
    correctAnswer: '    prev = curr;  curr = next;',
    options: ['    curr = prev;  prev = next;', '    prev = next;  curr = prev;', '    prev = curr;  curr = next;'] },
  { text: '  }', isChallenge: false },
  { text: '  return prev;', isChallenge: true,
    correctAnswer: '  return prev;',
    options: ['  return head;', '  return curr;', '  return prev;'] },
  { text: '}', isChallenge: false },
];

const REC_CODE_LINES = [
  { text: 'function reverseList(head) {', isChallenge: false },
  { text: '  if (!head?.next) return head;', isChallenge: true,
    correctAnswer: '  if (!head?.next) return head;',
    options: ['  if (!head) return null;', '  if (head.next) return head;', '  if (!head?.next) return head;'] },
  { text: '  let p = reverseList(head.next);', isChallenge: true,
    correctAnswer: '  let p = reverseList(head.next);',
    options: ['  let p = reverseList(head);', '  let p = head.next;', '  let p = reverseList(head.next);'] },
  { text: '  head.next.next = head;', isChallenge: true,
    correctAnswer: '  head.next.next = head;',
    options: ['  head.next = head;', '  head.next.next = null;', '  head.next.next = head;'] },
  { text: '  head.next = null;', isChallenge: true,
    correctAnswer: '  head.next = null;',
    options: ['  head = null;', '  head.next.next = null;', '  head.next = null;'] },
  { text: '  return p;', isChallenge: true,
    correctAnswer: '  return p;',
    options: ['  return head;', '  return head.next;', '  return p;'] },
  { text: '}', isChallenge: false },
];

const ITER_BADGE_INFO = {
  init: { icon: '🎯', label: 'Initialize',      color: 'var(--secondary)' },
  save: { icon: '💾', label: 'Save the link',    color: 'var(--primary)'  },
  flip: { icon: '🔄', label: 'Reverse the arrow', color: '#FF5252'        },
  slide:{ icon: '➡️', label: 'Slide forward',    color: 'var(--easy)'    },
  done: { icon: '🏁', label: 'Return new head',  color: 'var(--secondary)' },
};

const REC_BADGE_INFO = {
  base: { icon: '🎯', label: 'Base case',        color: 'var(--secondary)' },
  flip: { icon: '🔄', label: 'Reverse the arrow', color: '#FF5252'         },
  brk:  { icon: '✂️', label: 'Clear old link',    color: 'var(--primary)'  },
  done: { icon: '🏁', label: 'Return new head',   color: 'var(--secondary)' },
};

// Build the step-by-step trace once — same reversal algorithm as the actual solution.
function buildIterativeSteps() {
  const links = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 'null' };
  const steps = [];

  steps.push({
    badge: 'init', activeLine: 1, prev: null, curr: 0, next: null, links: { ...links },
    msg: 'Initialize: prev = null, curr = head (node 1).',
  });

  let prev = null, curr = 0;
  while (curr !== null) {
    const next = links[curr];

    steps.push({
      badge: 'save', activeLine: 3, prev, curr, next, links: { ...links },
      msg: `Save curr.next before breaking the link: next = ${next === 'null' ? 'null' : `node ${VALUES[next]}`}.`,
    });

    links[curr] = prev === null ? 'null' : prev;
    steps.push({
      badge: 'flip', activeLine: 4, prev, curr, next, links: { ...links },
      msg: `Flip the arrow: node ${VALUES[curr]} now points ${prev === null ? 'to null' : `back to node ${VALUES[prev]}`}.`,
    });

    prev = curr; curr = next === 'null' ? null : next;
    steps.push({
      badge: 'slide', activeLine: 5, prev, curr, next, links: { ...links },
      msg: `Slide forward: prev = node ${VALUES[prev]}, curr = ${curr === null ? 'null' : `node ${VALUES[curr]}`}.`,
    });
  }

  steps.push({
    badge: 'done', activeLine: 7, prev, curr: null, next: null, links: { ...links },
    msg: `curr is null — the loop ends. Return prev (node ${VALUES[prev]}) as the new head!`,
  });

  return steps;
}

// Build every intermediate state of the recursive unwind (links snapshot each step).
function buildRecursiveSteps() {
  const links = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 'null' };
  const steps = [];
  steps.push({ activeLine: 1, badge: 'base', p: N - 1, headIdx: N - 1, links: { ...links },
    msg: `Base case: node ${VALUES[N - 1]} has no next — return it as p.` });
  for (let headIdx = N - 2; headIdx >= 0; headIdx--) {
    links[headIdx + 1] = headIdx;
    steps.push({ activeLine: 3, badge: 'flip', p: N - 1, headIdx, links: { ...links },
      msg: `Unwinding: node ${VALUES[headIdx + 1]}'s next now points back at node ${VALUES[headIdx]}.` });
    links[headIdx] = 'null';
    steps.push({ activeLine: 4, badge: 'brk', p: N - 1, headIdx, links: { ...links },
      msg: `Node ${VALUES[headIdx]}'s old forward link is cleared to null — for now.` });
  }
  steps.push({ activeLine: 5, badge: 'done', p: N - 1, headIdx: null, links: { ...links },
    msg: `Recursion fully unwound. p points at node ${VALUES[N - 1]} — the new head!` });
  return steps;
}

const ITER_STEPS = buildIterativeSteps();
const REC_STEPS = buildRecursiveSteps();

const CONFIG = {
  iterative: { code: ITER_CODE_LINES, steps: ITER_STEPS, badgeInfo: ITER_BADGE_INFO },
  recursive: { code: REC_CODE_LINES, steps: REC_STEPS, badgeInfo: REC_BADGE_INFO },
};

const CHALLENGES = {
  iterative: ITER_CODE_LINES.map((c, i) => ({ ...c, originalIndex: i })).filter(c => c.isChallenge),
  recursive: REC_CODE_LINES.map((c, i) => ({ ...c, originalIndex: i })).filter(c => c.isChallenge),
};

const blankUserCode = (t) => CONFIG[t].code.map(c => c.isChallenge ? '' : c.text);

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// Physical display order: already-reversed portion (from startHints[0]) leads, the
// untouched remainder (from startHints[1]) follows — nodes slide into place as the
// algorithm runs. Works for both techniques since both snapshot a `links` map.
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

export default function LinkedListGame() {
  const [technique, setTechnique] = useState('iterative');

  const [gameState, setGameState] = useState({ iterative: 'coding', recursive: 'coding' }); // 'coding' | 'visualizing'
  const [userCode, setUserCode] = useState({ iterative: blankUserCode('iterative'), recursive: blankUserCode('recursive') });
  const [challengeIndex, setChallengeIndex] = useState({ iterative: 0, recursive: 0 });
  const [visStep, setVisStep] = useState({ iterative: 0, recursive: 0 });
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });

  const { code: CODE_LINES, steps: STEPS, badgeInfo: BADGE_INFO } = CONFIG[technique];
  const CHALLENGE_LIST = CHALLENGES[technique];
  const currentChallenge = CHALLENGE_LIST[challengeIndex[technique]];
  const isCoding = gameState[technique] === 'coding';

  const step = STEPS[visStep[technique]];
  const startHints = technique === 'iterative' ? [step.prev, step.curr] : [N - 1, 0];
  const chain = displayChain(step.links, startHints);
  const displayPos = (origIdx) => origIdx === null || origIdx === undefined ? null : chain.indexOf(origIdx);
  const arrowExists = (displayIdx) => displayIdx < chain.length - 1 && step.links[chain[displayIdx]] === chain[displayIdx + 1];

  const switchTechnique = (t) => { setTechnique(t); setFeedback({ show: false, message: '', type: '' }); };

  const handleSelect = (option) => {
    if (!isCoding || !currentChallenge) return;

    if (option === currentChallenge.correctAnswer) {
      setUserCode(prev => {
        const next = [...prev[technique]];
        next[currentChallenge.originalIndex] = option;
        return { ...prev, [technique]: next };
      });
      setFeedback({ show: true, message: 'Correct!', type: 'success' });

      setTimeout(() => {
        setFeedback({ show: false, message: '', type: '' });
        if (challengeIndex[technique] < CHALLENGE_LIST.length - 1) {
          setChallengeIndex(prev => ({ ...prev, [technique]: prev[technique] + 1 }));
        } else {
          setGameState(prev => ({ ...prev, [technique]: 'visualizing' }));
          setFeedback({ show: true, message: "Code complete! Let's visualize it.", type: 'info' });
          setTimeout(() => setFeedback({ show: false, message: '', type: '' }), 2800);
        }
      }, 700);
    } else {
      setFeedback({ show: true, message: 'Oops! Try again.', type: 'error' });
      setTimeout(() => setFeedback({ show: false, message: '', type: '' }), 1400);
    }
  };

  const handleReset = () => {
    setGameState(prev => ({ ...prev, [technique]: 'coding' }));
    setUserCode(prev => ({ ...prev, [technique]: blankUserCode(technique) }));
    setChallengeIndex(prev => ({ ...prev, [technique]: 0 }));
    setVisStep(prev => ({ ...prev, [technique]: 0 }));
    setFeedback({ show: false, message: '', type: '' });
  };

  const isDone = step.badge === 'done';
  const badge = BADGE_INFO[step.badge];

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
              🎮 Trace Game
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
              {isCoding ? `Step 1: Complete the ${technique} code.` : 'Step 2: Trace the execution, node by node.'}
            </p>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 0, background: '#F1F2F6', borderRadius: 100, padding: 3, border: '2px solid var(--line)' }}>
              {['iterative', 'recursive'].map(t => (
                <button key={t} onClick={() => switchTechnique(t)} className="llg-btn-press" style={{
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
            <button onClick={handleReset} className="llg-btn-press" style={{
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
          @keyframes llgFadeUp { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .llg-btn-press:active { transform: translateY(2px) !important; }
        `}</style>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,3fr)', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT: CODE + CHALLENGE ──────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ background: '#2D3436', borderRadius: 20, overflow: 'hidden', border: '4px solid #1E2528', boxShadow: '0 6px 0 rgba(0,0,0,0.12)' }}>
              <div style={{ background: '#232A2D', padding: '8px 16px', borderBottom: '2px solid #1E2528' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#B2BEC3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {technique === 'iterative' ? 'Iterative' : 'Recursive'} · reverseList.js
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
                      <button key={i} onClick={() => handleSelect(opt)} className="llg-btn-press" style={{
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>{badge.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: badge.color, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {badge.label}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                    {step.msg}
                  </p>
                  {isDone && (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--easy)', fontWeight: 900, fontSize: 13 }}>
                      <Sparkles size={16} /> List fully reversed: 5 → 4 → 3 → 2 → 1 → null
                    </div>
                  )}
                </div>
              )}

              {/* feedback toast */}
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
                {isCoding ? 'Complete the code to unlock the trace.' : `Step ${visStep[technique] + 1} of ${STEPS.length}`}
              </div>
              <button onClick={() => setVisStep(prev => ({ ...prev, [technique]: Math.max(0, prev[technique] - 1) }))} disabled={isCoding || visStep[technique] === 0} className="llg-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 14px', borderRadius: 100,
                border: '2px solid var(--line)', background: '#F8F9FA', color: 'var(--ink-2)', cursor: 'pointer',
                opacity: (isCoding || visStep[technique] === 0) ? 0.4 : 1,
              }}>◀ Back</button>
              <button onClick={() => setVisStep(prev => ({ ...prev, [technique]: Math.min(STEPS.length - 1, prev[technique] + 1) }))} disabled={isCoding || visStep[technique] >= STEPS.length - 1} className="llg-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 16px', borderRadius: 100,
                border: 'none', background: 'var(--secondary)', color: '#FFF', cursor: 'pointer',
                boxShadow: '0 3px 0 var(--secondary-shadow)',
                opacity: (isCoding || visStep[technique] >= STEPS.length - 1) ? 0.4 : 1,
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
                    <marker id="llg-ah" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                      <polygon points="0 0,8 3,0 6" fill="#B2BEC3" />
                    </marker>
                    <marker id="llg-ah-flip" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                      <polygon points="0 0,8 3,0 6" fill="#FF5252" />
                    </marker>
                  </defs>

                  <text x="20" y="105" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="16" fill="#B2BEC3">∅</text>
                  <text x={nodeX(chain.length - 1) + 78} y="105" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="16" fill="#B2BEC3">∅</text>

                  {chain.map((origIdx, i) => arrowExists(i) && (
                    <line key={`a-${origIdx}`} x1={nodeX(i) + 52} y1="105" x2={nodeX(i + 1)} y2="105" stroke="#B2BEC3" strokeWidth="3" markerEnd="url(#llg-ah)" style={{ transition: 'all 0.5s' }} />
                  ))}

                  {/* Spell out "curr.next = prev" explicitly — don't rely on the chain reorder alone,
                      since the new link isn't always between physically-adjacent display slots. */}
                  {technique === 'iterative' && step.badge === 'flip' && displayPos(step.curr) !== null && (() => {
                    const x1 = nodeX(displayPos(step.curr)) + 26;
                    const toPos = step.prev !== null ? displayPos(step.prev) : null;
                    if (toPos !== null) {
                      const x2 = nodeX(toPos) + 26;
                      const midX = (x1 + x2) / 2;
                      return (
                        <path d={`M ${x1} 137 Q ${midX} 192 ${x2} 137`} stroke="#FF5252" strokeWidth="3" strokeDasharray="7,5" fill="none" markerEnd="url(#llg-ah-flip)" style={{ transition: 'all 0.5s' }} />
                      );
                    }
                    return (
                      <g style={{ transition: 'transform 0.5s' }}>
                        <path d={`M ${x1} 137 L ${x1} 168`} stroke="#FF5252" strokeWidth="3" strokeDasharray="4 3" fill="none" markerEnd="url(#llg-ah-flip)" />
                        <text x={x1} y="182" textAnchor="middle" fontSize="12" fontWeight="900" fill="#FF5252" fontFamily="var(--mono)">null</text>
                      </g>
                    );
                  })()}

                  {chain.map((origIdx, i) => {
                    const isCurr = technique === 'iterative' ? step.curr === origIdx : step.headIdx === origIdx;
                    return (
                      <g key={origIdx} style={{ transition: 'transform 0.5s' }} transform={`translate(${nodeX(i)},0)`}>
                        <rect x="0" y="85" width="52" height="52" rx="18"
                          fill={isCurr ? '#FFF3CD' : '#FFF'} stroke={isCurr ? '#FECA57' : 'var(--line-heavy)'}
                          strokeWidth={isCurr ? 4 : 3} />
                        <text x="26" y="111" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="20" fill="var(--ink)">
                          {VALUES[origIdx]}
                        </text>
                      </g>
                    );
                  })}

                  {technique === 'iterative' ? (
                    <>
                      {displayPos(step.prev) !== null && (
                        <g style={{ transition: 'transform 0.5s' }} transform={`translate(${nodeCx(displayPos(step.prev))},0)`}>
                          <line x1="0" y1="23" x2="0" y2="75" stroke="#FF5252" strokeWidth="2.5" markerEnd="url(#llg-ah)" />
                          <rect x="-24" y="1" width="48" height="22" rx="8" fill="#FF5252" />
                          <text x="0" y="16" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="13" fill="#FFF">prev</text>
                        </g>
                      )}
                      {/* `next` only means something while it's being saved/used — stale once we've slid past it */}
                      {(step.badge === 'save' || step.badge === 'flip') && step.next !== null && step.next !== 'null' && displayPos(step.next) !== null && (
                        <g style={{ transition: 'transform 0.5s' }} transform={`translate(${nodeCx(displayPos(step.next)) + 20},0)`}>
                          <line x1="0" y1="23" x2="0" y2="75" stroke="#FECA57" strokeWidth="2.5" markerEnd="url(#llg-ah)" />
                          <rect x="-22" y="1" width="44" height="22" rx="8" fill="#FECA57" />
                          <text x="0" y="16" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="13" fill="#7A5000">next</text>
                        </g>
                      )}
                      {displayPos(step.curr) !== null && (
                        <g style={{ transition: 'transform 0.5s' }} transform={`translate(${nodeCx(displayPos(step.curr))},0)`}>
                          <line x1="0" y1="53" x2="0" y2="75" stroke="#00D2D3" strokeWidth="2.5" markerEnd="url(#llg-ah)" />
                          <rect x="-24" y="31" width="48" height="22" rx="8" fill="#00D2D3" />
                          <text x="0" y="46" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="13" fill="#FFF">curr</text>
                        </g>
                      )}
                    </>
                  ) : (
                    displayPos(step.p) !== null && (
                      <g style={{ transition: 'transform 0.5s' }} transform={`translate(${nodeCx(displayPos(step.p))},0)`}>
                        <line x1="0" y1="23" x2="0" y2="75" stroke="var(--secondary)" strokeWidth="2.5" markerEnd="url(#llg-ah)" />
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
