// @ts-nocheck
import React, { useState } from 'react';
import { RotateCcw, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { PALETTE, POINTER_COLORS, POINTER_TEXT_COLORS } from './pointer-colors';
import { ArrowMarker, PointerBadge } from './game-ui';

// ─── DATA ────────────────────────────────────────────────────────────────────
// Same worked example as Move the Pointer: a duplicate value at the head, in
// the middle, and at the tail — the three cases removeElements has to handle.

const N = 6;
const VAL = 6;
const VALUES = [6, 1, 2, 6, 3, 6];
const NODE_IDS = ['idx0', 'idx1', 'idx2', 'idx3', 'idx4', 'idx5'];
const SLOTS = ['dummy', ...NODE_IDS];
const valueOf = (nodeId) => VALUES[NODE_IDS.indexOf(nodeId)];
const labelOf = (nodeId) => (nodeId === 'null' || nodeId == null) ? 'null' : `node ${valueOf(nodeId)}`;
const labelOfAr = (nodeId) => (nodeId === 'null' || nodeId == null) ? 'null' : `عقدة ${valueOf(nodeId)}`;

const ITER_CODE_LINES = [
  { text: 'function removeElements(head, val) {', isChallenge: false },
  { text: '  const dummy = new ListNode(0, head);', isChallenge: true,
    correctAnswer: '  const dummy = new ListNode(0, head);',
    options: ['  const dummy = new ListNode(0, head.next);', '  const dummy = head;', '  const dummy = new ListNode(0, head);'] },
  { text: '  let prev = dummy, curr = head;', isChallenge: false },
  { text: '  while (curr !== null) {', isChallenge: false },
  { text: '    const nxt = curr.next;', isChallenge: true,
    correctAnswer: '    const nxt = curr.next;',
    options: ['    const nxt = curr;', '    const nxt = prev.next;', '    const nxt = curr.next;'] },
  { text: '    if (curr.val === val) prev.next = nxt;', isChallenge: true,
    correctAnswer: '    if (curr.val === val) prev.next = nxt;',
    options: ['    if (curr.val === val) curr.next = nxt;', '    if (curr.val === val) prev = nxt;', '    if (curr.val === val) prev.next = nxt;'] },
  { text: '    else prev = curr;', isChallenge: true,
    correctAnswer: '    else prev = curr;',
    options: ['    else curr = prev;', '    else nxt = curr;', '    else prev = curr;'] },
  { text: '    curr = nxt;', isChallenge: false },
  { text: '  }', isChallenge: false },
  { text: '  return dummy.next;', isChallenge: true,
    correctAnswer: '  return dummy.next;',
    options: ['  return prev.next;', '  return head;', '  return dummy.next;'] },
  { text: '}', isChallenge: false },
];

const REC_CODE_LINES = [
  { text: 'function removeElements(head, val) {', isChallenge: false },
  { text: '  if (head === null) return null;', isChallenge: true,
    correctAnswer: '  if (head === null) return null;',
    options: ['  if (!head) return head;', '  if (head === null) return head;', '  if (head === null) return null;'] },
  { text: '  head.next = removeElements(head.next, val);', isChallenge: true,
    correctAnswer: '  head.next = removeElements(head.next, val);',
    options: ['  head.next = removeElements(head, val);', '  head = removeElements(head.next, val);', '  head.next = removeElements(head.next, val);'] },
  { text: '  return head.val === val ? head.next : head;', isChallenge: true,
    correctAnswer: '  return head.val === val ? head.next : head;',
    options: ['  return head.val === val ? head : head.next;', '  return head.next === val ? head.next : head;', '  return head.val === val ? head.next : head;'] },
  { text: '}', isChallenge: false },
];

const ITER_BADGE_INFO = {
  init:    { icon: '🎯', label: 'Initialize',     labelAr: 'ابدئي',        color: 'var(--secondary)' },
  inspect: { icon: '🔍', label: 'Compare',        labelAr: 'قارني',        color: 'var(--primary)'  },
  remove:  { icon: '🗑️', label: 'Remove node',    labelAr: 'امسحي العقدة', color: '#FF5252'         },
  keep:    { icon: '✅', label: 'Keep node',      labelAr: 'احتفظي بالعقدة', color: 'var(--easy)'     },
  advance: { icon: '➡️', label: 'Slide forward',  labelAr: 'اتقدمي',       color: '#D49B1C'         },
  done:    { icon: '🏁', label: 'Return new head', labelAr: 'رجّعي الرأس الجديد', color: 'var(--secondary)' },
};

const REC_BADGE_INFO = {
  base:   { icon: '🎯', label: 'Base case',       labelAr: 'الحالة الأساسية', color: 'var(--secondary)' },
  rewire: { icon: '🔗', label: 'Link to below',   labelAr: 'وصّلي باللي تحت', color: 'var(--primary)'  },
  remove: { icon: '🗑️', label: 'Remove node',     labelAr: 'امسحي العقدة',   color: '#FF5252'          },
  keep:   { icon: '✅', label: 'Keep node',       labelAr: 'احتفظي بالعقدة', color: 'var(--easy)'      },
  done:   { icon: '🏁', label: 'Return new head', labelAr: 'رجّعي الرأس الجديد', color: 'var(--secondary)' },
};

// Build the step-by-step trace by actually running the algorithm once, over a
// fixed physical layout — removal never reorders nodes, so slot positions
// (unlike Reverse Linked List) never change; only the links between them do.
function buildIterativeSteps() {
  const links = { dummy: 'idx0', idx0: 'idx1', idx1: 'idx2', idx2: 'idx3', idx3: 'idx4', idx4: 'idx5', idx5: 'null' };
  const steps = [];
  steps.push({ badge: 'init', activeLine: 2, prev: 'dummy', curr: 'idx0', nxt: null, links: { ...links }, removed: [],
    msg: 'Initialize: dummy.next = head; prev = dummy, curr = head (node 6).',
    msgAr: 'ابدئي: dummy.next = head؛ prev = dummy، curr = head (عقدة 6).' });

  let prev = 'dummy', curr = 'idx0', removed = [];
  while (curr !== 'null') {
    const nxt = links[curr];
    const val = valueOf(curr);
    steps.push({ badge: 'inspect', activeLine: 4, prev, curr, nxt, links: { ...links }, removed: [...removed],
      msg: `Save curr.next: nxt = ${labelOf(nxt)}. Is curr.val (${val}) the target value (${VAL})?`,
      msgAr: `احفظي curr.next: nxt = ${labelOfAr(nxt)}. هل curr.val (${val}) بتساوي القيمة المطلوبة (${VAL})؟` });

    if (val === VAL) {
      links[prev] = nxt;
      removed = [...removed, curr];
      steps.push({ badge: 'remove', activeLine: 5, prev, curr, nxt, links: { ...links }, removed: [...removed],
        msg: `node ${val} matches — remove it: ${prev === 'dummy' ? 'dummy' : `node ${valueOf(prev)}`}.next now points to ${labelOf(nxt)}.`,
        msgAr: `عقدة ${val} بتساوي القيمة — امسحيها: ${prev === 'dummy' ? 'dummy' : `عقدة ${valueOf(prev)}`}.next بقى يشاور على ${labelOfAr(nxt)}.` });
    } else {
      prev = curr;
      steps.push({ badge: 'keep', activeLine: 6, prev, curr, nxt, links: { ...links }, removed: [...removed],
        msg: `node ${val} doesn't match — keep it: prev advances to node ${val}.`,
        msgAr: `عقدة ${val} مش بتساوي القيمة — احتفظي بيها: prev تتقدم لعقدة ${val}.` });
    }

    curr = nxt;
    steps.push({ badge: 'advance', activeLine: 7, prev, curr, nxt, links: { ...links }, removed: [...removed],
      msg: curr === 'null' ? 'curr becomes null — the loop ends!' : `curr steps forward to ${labelOf(curr)}.`,
      msgAr: curr === 'null' ? 'curr بقت null — الحلقة بتخرج!' : `curr بتتقدم لـ ${labelOfAr(curr)}.` });
  }

  steps.push({ badge: 'done', activeLine: 9, prev, curr: 'null', nxt: null, links: { ...links }, removed: [...removed],
    msg: `Return dummy.next — ${labelOf(links.dummy)} is the final head.`,
    msgAr: `رجّعي dummy.next — ${labelOfAr(links.dummy)} هو الرأس النهائي.` });
  return steps;
}

// Recursion dives to the base case instantly; only the unwind (where the
// remove/keep decisions actually happen) is stepped through.
function buildRecursiveSteps() {
  const steps = [];
  steps.push({ badge: 'base', activeLine: 1, headIdx: null, result: 'null', links: {}, removed: [],
    msg: 'Base case: head is null — this frame returns null.',
    msgAr: 'الحالة الأساسية: head بقت null — الفريم ده بيرجع null.' });

  let result = 'null';
  let removed = [];
  const links = {};
  for (let i = N - 1; i >= 0; i--) {
    const nodeId = NODE_IDS[i];
    const val = VALUES[i];
    links[nodeId] = result; // head.next = removeElements(head.next, val)
    steps.push({ badge: 'rewire', activeLine: 2, headIdx: i, result, links: { ...links }, removed: [...removed],
      msg: `node ${val}: wire its link to whatever the frame below returned (${labelOf(result)}).`,
      msgAr: `عقدة ${val}: وصّلي اللينك بتاعها بأي حاجة الفريم اللي تحت رجّعها (${labelOfAr(result)}).` });

    if (val === VAL) {
      removed = [...removed, nodeId];
      steps.push({ badge: 'remove', activeLine: 3, headIdx: i, result, links: { ...links }, removed: [...removed],
        msg: `node ${val}: matches val — this frame returns head.next (${labelOf(result)}), dropping node ${val}.`,
        msgAr: `عقدة ${val}: بتساوي القيمة — الفريم ده بيرجع head.next (${labelOfAr(result)})، وعقدة ${val} بتتشال.` });
      // result (the returned pointer) is unchanged — the node itself is dropped.
    } else {
      result = nodeId;
      steps.push({ badge: 'keep', activeLine: 3, headIdx: i, result, links: { ...links }, removed: [...removed],
        msg: `node ${val}: doesn't match — this frame returns head itself, now linked to ${labelOf(links[nodeId])}.`,
        msgAr: `عقدة ${val}: مش بتساوي القيمة — الفريم ده بيرجع head نفسها، بقت متوصّلة بـ ${labelOfAr(links[nodeId])}.` });
    }
  }

  steps.push({ badge: 'done', activeLine: 3, headIdx: null, result, links: { ...links }, removed: [...removed],
    msg: `Recursion fully unwound — ${labelOf(result)} is the final head.`,
    msgAr: `الاستدعاء الذاتي اتفكّ بالكامل — ${labelOfAr(result)} هو الرأس النهائي.` });
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

const UI_TEXT = {
  title: { en: 'Trace Game', ar: 'لعبة التتبّع' },
  iterative: { en: 'iterative', ar: 'تكراري' },
  recursive: { en: 'recursive', ar: 'عودي' },
  reset: { en: 'Reset', ar: 'إعادة' },
  completeMissingLine: { en: 'Complete the missing line', ar: 'كمّلي السطر الناقص' },
  codeCompleted: { en: 'Code completed!', ar: 'الكود اتكمّل!' },
  completeToUnlock: { en: 'Complete the code to unlock the trace.', ar: 'كمّلي الكود عشان تفتحي التتبّع.' },
  back: { en: '◀ Back', ar: '◀ السابق' },
  next: { en: 'Next ▶', ar: 'التالي ▶' },
  currentState: { en: 'Current State', ar: 'الحالة الحالية' },
  correct: { en: 'Correct!', ar: 'صح!' },
  tryAgain: { en: 'Oops! Try again.', ar: 'أوبس! جرّبي تاني.' },
  codeCompleteVisualize: { en: "Code complete! Let's visualize it.", ar: 'الكود خلص! يلا نتابع بالصور.' },
  solvedMsg: { en: "All the 6's are gone: 1 → 2 → 3 → null", ar: 'كل الـ 6 اتمسحوا: 1 → 2 → 3 → null' },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const nodeX = (i) => 40 + i * 110;
const nodeCx = (i) => nodeX(i) + 26;
const posOf = (key) => (key === 'null' || key === null || key === undefined) ? null : SLOTS.indexOf(key);

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function LinkedListGame({ initialTechnique, onTechniqueChange, isAr } = {}) {
  const tr = (key) => (isAr ? UI_TEXT[key].ar : UI_TEXT[key].en);
  const [technique, setTechnique] = useState(initialTechnique === 'recursive' ? 'recursive' : 'iterative');

  const [gameState, setGameState] = useState({ iterative: 'coding', recursive: 'coding' });
  const [userCode, setUserCode] = useState({ iterative: blankUserCode('iterative'), recursive: blankUserCode('recursive') });
  const [challengeIndex, setChallengeIndex] = useState({ iterative: 0, recursive: 0 });
  const [visStep, setVisStep] = useState({ iterative: 0, recursive: 0 });
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });

  const { code: CODE_LINES, steps: STEPS, badgeInfo: BADGE_INFO } = CONFIG[technique];
  const CHALLENGE_LIST = CHALLENGES[technique];
  const currentChallenge = CHALLENGE_LIST[challengeIndex[technique]];
  const isCoding = gameState[technique] === 'coding';

  const step = STEPS[visStep[technique]];
  const isIter = technique === 'iterative';
  const removedSet = new Set(step.removed);
  // The node whose removal became visible *this exact step* — flashed red with a
  // trash mark for one step before settling into the calmer grayed-out treatment,
  // so "dropping node 6" reads as something that just happened, not a static fact.
  const prevStep = STEPS[visStep[technique] - 1];
  const prevRemovedSet = new Set(prevStep ? prevStep.removed : []);
  const justRemovedId = step.removed.find(id => !prevRemovedSet.has(id)) ?? null;

  const switchTechnique = (t) => { setTechnique(t); setFeedback({ show: false, message: '', type: '' }); onTechniqueChange?.(t); };

  const handleSelect = (option) => {
    if (!isCoding || !currentChallenge) return;

    if (option === currentChallenge.correctAnswer) {
      setUserCode(prev => {
        const next = [...prev[technique]];
        next[currentChallenge.originalIndex] = option;
        return { ...prev, [technique]: next };
      });
      setFeedback({ show: true, message: tr('correct'), type: 'success' });

      setTimeout(() => {
        setFeedback({ show: false, message: '', type: '' });
        if (challengeIndex[technique] < CHALLENGE_LIST.length - 1) {
          setChallengeIndex(prev => ({ ...prev, [technique]: prev[technique] + 1 }));
        } else {
          setGameState(prev => ({ ...prev, [technique]: 'visualizing' }));
          setFeedback({ show: true, message: tr('codeCompleteVisualize'), type: 'info' });
          setTimeout(() => setFeedback({ show: false, message: '', type: '' }), 2800);
        }
      }, 700);
    } else {
      setFeedback({ show: true, message: tr('tryAgain'), type: 'error' });
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
          <div dir={isAr ? 'rtl' : 'ltr'} style={{ textAlign: isAr ? 'right' : 'left' }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              {tr('title')}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
              {isAr
                ? (isCoding ? `الخطوة 1: كمّلي الكود ${isIter ? 'التكراري' : 'العودي'}.` : 'الخطوة 2: تابعي التنفيذ، عقدة عقدة.')
                : (isCoding ? `Step 1: Complete the ${technique} code.` : 'Step 2: Trace the execution, node by node.')}
            </p>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 0, background: '#F1F2F6', borderRadius: 100, padding: 3, border: '2px solid var(--line)' }}>
              {['iterative', 'recursive'].map(techName => (
                <button key={techName} onClick={() => switchTechnique(techName)} className="llgr-btn-press" style={{
                  fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900,
                  padding: '7px 16px', borderRadius: 100, border: 'none', cursor: 'pointer',
                  textTransform: isAr ? 'none' : 'capitalize', transition: 'all 0.15s',
                  background: technique === techName ? 'var(--secondary)' : 'transparent',
                  color: technique === techName ? '#FFF' : 'var(--ink-2)',
                  boxShadow: technique === techName ? '0 3px 0 var(--secondary-shadow)' : 'none',
                }}>
                  {isAr ? UI_TEXT[techName].ar : UI_TEXT[techName].en}
                </button>
              ))}
            </div>
            <button onClick={handleReset} className="llgr-btn-press" style={{
              fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900,
              padding: '9px 16px', borderRadius: 100,
              border: '3px solid var(--line)', background: 'var(--card)',
              color: 'var(--ink)', cursor: 'pointer', boxShadow: '0 4px 0 var(--shadow-color)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <RotateCcw size={14} /> {tr('reset')}
            </button>
          </div>
        </div>

        <style>{`
          .llgr-btn-press:active { transform: translateY(2px) !important; }
          @keyframes llgr-just-removed-pop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.25); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
          .llgr-just-removed { animation: llgr-just-removed-pop 0.4s ease; }
          .llgr-two-col { display: grid; grid-template-columns: minmax(0,2fr) minmax(0,3fr); gap: 20px; align-items: start; }
          @media (max-width: 900px) { .llgr-two-col { grid-template-columns: 1fr; } }
        `}</style>

        <div className="llgr-two-col">

          {/* ── LEFT: CODE + CHALLENGE ──────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ background: '#2D3436', borderRadius: 20, overflow: 'hidden', border: '4px solid #1E2528', boxShadow: '0 6px 0 rgba(0,0,0,0.12)' }}>
              <div style={{ background: '#232A2D', padding: '8px 16px', borderBottom: '2px solid #1E2528' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#B2BEC3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {technique === 'iterative' ? 'Iterative' : 'Recursive'} · removeElements.js
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
                    {tr('completeMissingLine')}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {currentChallenge.options.map((opt, i) => (
                      <button key={i} onClick={() => handleSelect(opt)} className="llgr-btn-press" dir="ltr" style={{
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
                  {tr('codeCompleted')}
                </div>
              ) : (
                <div style={{ background: 'var(--card)', borderRadius: 24, border: `3px solid ${badge.color}33`, padding: '18px 20px', boxShadow: '0 5px 0 var(--shadow-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>{badge.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: badge.color, textTransform: isAr ? 'none' : 'uppercase', letterSpacing: '0.4px' }}>
                      {isAr ? badge.labelAr : badge.label}
                    </span>
                  </div>
                  <p dir={isAr ? 'rtl' : 'ltr'} style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)', lineHeight: 1.6, textAlign: isAr ? 'right' : 'left' }}>
                    {isAr ? step.msgAr : step.msg}
                  </p>
                  {isDone && (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--easy)', fontWeight: 900, fontSize: 13 }}>
                      <Sparkles size={16} /> {tr('solvedMsg')}
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
                {isCoding
                  ? tr('completeToUnlock')
                  : (isAr ? `خطوة ${visStep[technique] + 1} من ${STEPS.length}` : `Step ${visStep[technique] + 1} of ${STEPS.length}`)}
              </div>
              <button onClick={() => setVisStep(prev => ({ ...prev, [technique]: Math.max(0, prev[technique] - 1) }))} disabled={isCoding || visStep[technique] === 0} className="llgr-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 14px', borderRadius: 100,
                border: '2px solid var(--line)', background: '#F8F9FA', color: 'var(--ink-2)', cursor: 'pointer',
                opacity: (isCoding || visStep[technique] === 0) ? 0.4 : 1,
              }}>{tr('back')}</button>
              <button onClick={() => setVisStep(prev => ({ ...prev, [technique]: Math.min(STEPS.length - 1, prev[technique] + 1) }))} disabled={isCoding || visStep[technique] >= STEPS.length - 1} className="llgr-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 16px', borderRadius: 100,
                border: 'none', background: 'var(--secondary)', color: '#FFF', cursor: 'pointer',
                boxShadow: '0 3px 0 var(--secondary-shadow)',
                opacity: (isCoding || visStep[technique] >= STEPS.length - 1) ? 0.4 : 1,
              }}>{tr('next')}</button>
            </div>

            <div style={{
              background: '#F8F9FA', backgroundImage: 'radial-gradient(circle, #DFE6E9 1.5px, transparent 1.5px)', backgroundSize: '22px 22px',
              border: '4px solid var(--line)', borderRadius: 28, boxShadow: 'inset 0 4px 0 rgba(0,0,0,0.03), 0 8px 0 var(--shadow-color)',
              padding: '48px 16px 24px', minHeight: 260, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 14, left: 20, fontSize: 11, fontWeight: 900, textTransform: isAr ? 'none' : 'uppercase', letterSpacing: '0.6px', color: 'rgba(165,94,234,0.55)' }}>
                {tr('currentState')}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <svg width={SLOTS.length * 110 + 120} height="220" style={{ display: 'block', margin: '0 auto' }}>
                  <defs>
                    <ArrowMarker id="llgr-ah" color="#B2BEC3" />
                    <ArrowMarker id="llgr-ah-skip" color="#FF5252" />
                  </defs>

                  <text x={nodeX(SLOTS.length - 1) + 89} y="105" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="16" fill="#B2BEC3">∅</text>

                  {isIter ? SLOTS.map((slotKey, i) => {
                    const target = step.links[slotKey];
                    if (target === undefined) return null;
                    if (target === 'null') {
                      const x1 = nodeX(i) + 26;
                      return (
                        <g key={`n-${slotKey}`}>
                          <path d={`M ${x1} 137 L ${x1} 168`} stroke="#B2BEC3" strokeWidth="2.5" strokeDasharray="4 3" fill="none" markerEnd="url(#llgr-ah)" />
                          <text x={x1} y="182" textAnchor="middle" fontSize="11" fontWeight="900" fill="#B2BEC3" fontFamily="var(--mono)">null</text>
                        </g>
                      );
                    }
                    const targetPos = posOf(target);
                    if (targetPos === i + 1) {
                      return <line key={`a-${slotKey}`} x1={nodeX(i) + 52} y1="105" x2={nodeX(i + 1)} y2="105" stroke="#B2BEC3" strokeWidth="3" markerEnd="url(#llgr-ah)" style={{ transition: 'all 0.5s' }} />;
                    }
                    if (targetPos > i + 1) {
                      const x1 = nodeX(i) + 26, x2 = nodeX(targetPos) + 26, midX = (x1 + x2) / 2;
                      return <path key={`s-${slotKey}`} d={`M ${x1} 137 Q ${midX} 192 ${x2} 137`} stroke="#FF5252" strokeWidth="3" strokeDasharray="7,5" fill="none" markerEnd="url(#llgr-ah-skip)" style={{ transition: 'all 0.5s' }} />;
                    }
                    return null;
                  }) : NODE_IDS.map((nodeId, idx) => {
                    const i = idx + 1;
                    const target = step.links[nodeId];
                    if (target === undefined) return null;
                    if (target === 'null') {
                      const x1 = nodeX(i) + 26;
                      return (
                        <g key={`n-${nodeId}`}>
                          <path d={`M ${x1} 137 L ${x1} 168`} stroke="#B2BEC3" strokeWidth="2.5" strokeDasharray="4 3" fill="none" markerEnd="url(#llgr-ah)" />
                          <text x={x1} y="182" textAnchor="middle" fontSize="11" fontWeight="900" fill="#B2BEC3" fontFamily="var(--mono)">null</text>
                        </g>
                      );
                    }
                    const targetPos = posOf(target);
                    if (targetPos === i + 1) {
                      return <line key={`a-${nodeId}`} x1={nodeX(i) + 52} y1="105" x2={nodeX(i + 1)} y2="105" stroke="#B2BEC3" strokeWidth="3" markerEnd="url(#llgr-ah)" style={{ transition: 'all 0.5s' }} />;
                    }
                    const x1 = nodeX(i) + 26, x2 = nodeX(targetPos) + 26, midX = (x1 + x2) / 2;
                    return <path key={`s-${nodeId}`} d={`M ${x1} 137 Q ${midX} 192 ${x2} 137`} stroke="#FF5252" strokeWidth="3" strokeDasharray="7,5" fill="none" markerEnd="url(#llgr-ah-skip)" style={{ transition: 'all 0.5s' }} />;
                  })}

                  {isIter && (
                    <g transform={`translate(${nodeX(0)},85)`}>
                      <rect x="0" y="0" width="52" height="52" rx="18" fill="#F3ECFF" stroke="var(--secondary)" strokeWidth="3" strokeDasharray="5,3" />
                      <text x="26" y="26" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="10" fill="var(--secondary)">dummy</text>
                    </g>
                  )}

                  {NODE_IDS.map((nodeId, idx) => {
                    const i = idx + 1;
                    const isRemoved = removedSet.has(nodeId);
                    const isJustRemoved = nodeId === justRemovedId;
                    const isCurr = isIter ? step.curr === nodeId : step.headIdx === idx;
                    return (
                      <g key={nodeId} transform={`translate(${nodeX(i)},85)`} opacity={isRemoved && !isJustRemoved ? 0.35 : 1} style={{ transition: 'opacity 0.5s' }}>
                        <rect x="0" y="0" width="52" height="52" rx="18"
                          fill={isJustRemoved ? '#FFE3E3' : (isCurr && !isRemoved ? '#FFF3CD' : '#FFF')}
                          stroke={isJustRemoved ? '#FF5252' : (isCurr && !isRemoved ? '#FECA57' : 'var(--line-heavy)')}
                          strokeWidth={isJustRemoved || (isCurr && !isRemoved) ? 4 : 3} />
                        <text x="26" y="26" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="20" fill={isRemoved && !isJustRemoved ? 'var(--ink-3)' : 'var(--ink)'} style={{ textDecoration: isRemoved && !isJustRemoved ? 'line-through' : 'none' }}>
                          {VALUES[idx]}
                        </text>
                        {isJustRemoved && (
                          <g className="llgr-just-removed" style={{ transformOrigin: '48px 4px' }}>
                            <circle cx="48" cy="4" r="11" fill="#FF5252" stroke="#FFF" strokeWidth="2" />
                            <text x="48" y="5" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="900" fill="#FFF">🗑️</text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {isIter ? (
                    <>
                      {posOf(step.prev) !== null && (
                        <PointerBadge cx={nodeCx(posOf(step.prev))} width={48} label="prev"
                          color={POINTER_COLORS.prev} textColor={POINTER_TEXT_COLORS.prev} markerId="llgr-ah" />
                      )}
                      {step.nxt != null && step.nxt !== 'null' && posOf(step.nxt) !== null && (
                        <PointerBadge cx={nodeCx(posOf(step.nxt)) + 20} width={40} label="nxt"
                          color={POINTER_COLORS.nxt} textColor={POINTER_TEXT_COLORS.nxt} markerId="llgr-ah" />
                      )}
                      {step.curr !== 'null' && posOf(step.curr) !== null && (
                        <PointerBadge cx={nodeCx(posOf(step.curr))} width={48} label="curr" side="below"
                          color={POINTER_COLORS.curr} textColor={POINTER_TEXT_COLORS.curr} markerId="llgr-ah" />
                      )}
                    </>
                  ) : (
                    <>
                      {/* head — the current frame's own parameter, i.e. which node this call is examining */}
                      {step.headIdx !== null && posOf(NODE_IDS[step.headIdx]) !== null && (
                        <PointerBadge cx={nodeCx(posOf(NODE_IDS[step.headIdx]))} width={48} label="head" side="below"
                          color={PALETTE.teal} textColor="#FFF" markerId="llgr-ah" />
                      )}
                      {/* result — the pointer this frame (or a deeper one) has returned so far */}
                      {posOf(step.result) !== null && (
                        <PointerBadge cx={nodeCx(posOf(step.result))} width={60} label="result" fontSize={12}
                          color={POINTER_COLORS.result} textColor="#FFF" markerId="llgr-ah" />
                      )}
                    </>
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
