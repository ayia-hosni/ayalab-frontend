// @ts-nocheck
import React, { useState } from 'react';
import { RotateCcw, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { PALETTE } from './pointer-colors';
import { ArrowMarker, PointerBadge, NodeValueBox } from './game-ui';

// ─── DATA ────────────────────────────────────────────────────────────────────
// Same worked example as the other two tabs: a true palindrome, odd length (N=5),
// so the middle node ends up compared against itself once the halves meet.

const N = 5;
const VALUES = [1, 2, 3, 2, 1];
const NODE_IDS = ['idx0', 'idx1', 'idx2', 'idx3', 'idx4'];
const SLOTS = [...NODE_IDS];
const valueOf = (nodeId) => VALUES[NODE_IDS.indexOf(nodeId)];
const labelOf = (nodeId) => (nodeId === 'null' || nodeId == null) ? 'null' : `node ${valueOf(nodeId)}`;
const labelOfAr = (nodeId) => (nodeId === 'null' || nodeId == null) ? 'null' : `عقدة ${valueOf(nodeId)}`;

const INITIAL_LINKS = { idx0: 'idx1', idx1: 'idx2', idx2: 'idx3', idx3: 'idx4', idx4: 'null' };

// The code, with five fill-in-the-blank challenges.
const CODE_LINES = [
  { text: 'function isPalindrome(head) {', isChallenge: false },
  { text: '  let fast = head;', isChallenge: false },
  { text: '  let slow = head;', isChallenge: false },
  { text: '  while (fast !== null && fast.next !== null) {', isChallenge: false },
  { text: '    fast = fast.next.next;', isChallenge: true,
    correctAnswer: '    fast = fast.next.next;',
    options: ['    fast = fast.next.next;', '    fast = fast.next;', '    fast = slow.next;'] },
  { text: '    slow = slow.next;', isChallenge: false },
  { text: '  }', isChallenge: false },
  { text: '  let prev = null;', isChallenge: false },
  { text: '  while (slow !== null) {', isChallenge: false },
  { text: '    const tmp = slow.next;', isChallenge: false },
  { text: '    slow.next = prev;', isChallenge: true,
    correctAnswer: '    slow.next = prev;',
    options: ['    slow.next = prev;', '    prev.next = slow;', '    slow = prev.next;'] },
  { text: '    prev = slow;', isChallenge: false },
  { text: '    slow = tmp;', isChallenge: true,
    correctAnswer: '    slow = tmp;',
    options: ['    slow = tmp;', '    slow = tmp.next;', '    tmp = slow;'] },
  { text: '  }', isChallenge: false },
  { text: '  let left = head;', isChallenge: false },
  { text: '  let right = prev;', isChallenge: false },
  { text: '  while (right !== null) {', isChallenge: false },
  { text: '    if (left.val !== right.val) return false;', isChallenge: true,
    correctAnswer: '    if (left.val !== right.val) return false;',
    options: ['    if (left.val !== right.val) return false;', '    if (left.val === right.val) return false;', '    if (left !== right) return false;'] },
  { text: '    left = left.next;', isChallenge: false },
  { text: '    right = right.next;', isChallenge: true,
    correctAnswer: '    right = right.next;',
    options: ['    right = right.next;', '    right = right.prev;', '    left = right.next;'] },
  { text: '  }', isChallenge: false },
  { text: '  return true;', isChallenge: false },
  { text: '}', isChallenge: false },
];

const BADGE_INFO = {
  findMiddle: { icon: '🐇', label: 'Find the middle',  labelAr: 'لاقي النص',        color: 'var(--secondary)' },
  reverseInit: { icon: '🔄', label: 'Start reversing', labelAr: 'ابدئي العكس',      color: 'var(--primary)'  },
  reverse:    { icon: '🔄', label: 'Reverse link',      labelAr: 'اعكسي اللينك',    color: '#FF5252'         },
  advance:    { icon: '➡️', label: 'Advance',           labelAr: 'اتقدمي',          color: '#D49B1C'         },
  compare:    { icon: '🔍', label: 'Compare',           labelAr: 'قارني',            color: 'var(--easy)'    },
  done:       { icon: '🏁', label: 'Palindrome confirmed', labelAr: 'اتأكد إنها متناظرة', color: 'var(--secondary)' },
};

// Build the step-by-step trace by actually running the algorithm once — same
// simulate-don't-transcribe approach as Both Solutions, so it can't drift out of
// sync with the hand-verified trace.
function buildSteps() {
  const links = { ...INITIAL_LINKS };
  const steps = [];
  const snap = () => ({ ...links });
  const pt = (fast, slow, prev, tmp, left, right) => ({ fast, slow, prev, tmp, left, right });

  let fast = 'idx0';
  steps.push({ activeLine: 1, badge: 'findMiddle', ...pt(fast, null, null, null, null, null), links: snap(),
    msg: `fast = head — ${labelOf(fast)}.`, msgAr: `fast = head — ${labelOfAr(fast)}.` });

  let slow = 'idx0';
  steps.push({ activeLine: 2, badge: 'findMiddle', ...pt(fast, slow, null, null, null, null), links: snap(),
    msg: `slow = head — ${labelOf(slow)}. Both pointers start together; fast will move twice as fast.`,
    msgAr: `slow = head — ${labelOfAr(slow)}. البؤرتين بيبدأو مع بعض؛ fast هتتحرك ضعف سرعة slow.` });

  while (fast !== 'null' && links[fast] !== 'null') {
    fast = links[links[fast]];
    steps.push({ activeLine: 4, badge: 'findMiddle', ...pt(fast, slow, null, null, null, null), links: snap(),
      msg: `fast jumps two nodes to ${labelOf(fast)}.`, msgAr: `fast بتقفز عقدتين لـ ${labelOfAr(fast)}.` });
    slow = links[slow];
    steps.push({ activeLine: 5, badge: 'findMiddle', ...pt(fast, slow, null, null, null, null), links: snap(),
      msg: `slow steps one node to ${labelOf(slow)}.`, msgAr: `slow بتتقدم عقدة واحدة لـ ${labelOfAr(slow)}.` });
  }
  steps.push({ activeLine: 6, badge: 'findMiddle', ...pt(fast, slow, null, null, null, null), links: snap(),
    msg: `Loop exits — slow rests on ${labelOf(slow)}, the true middle of the list.`,
    msgAr: `الحلقة خلصت — slow واقفة على ${labelOfAr(slow)}، نص القائمة الحقيقي.` });

  let prev = 'null';
  steps.push({ activeLine: 7, badge: 'reverseInit', ...pt(fast, slow, prev, null, null, null), links: snap(),
    msg: 'prev starts at null — reversal of the second half begins from the middle.',
    msgAr: 'prev بتبدأ null — عكس النص التاني بيبدأ من النص.' });

  while (slow !== 'null') {
    const tmp = links[slow];
    steps.push({ activeLine: 9, badge: 'reverse', ...pt(fast, slow, prev, tmp, null, null), links: snap(),
      msg: `Save slow.next before rewiring it: tmp = ${labelOf(tmp)}.`,
      msgAr: `احفظي slow.next قبل ما نغيّرها: tmp = ${labelOfAr(tmp)}.` });

    links[slow] = prev;
    steps.push({ activeLine: 10, badge: 'reverse', ...pt(fast, slow, prev, tmp, null, null), links: snap(),
      msg: `${labelOf(slow)}'s own link now points to ${labelOf(prev)}.`,
      msgAr: `لينك ${labelOfAr(slow)} بقى يشاور على ${labelOfAr(prev)}.` });

    prev = slow;
    steps.push({ activeLine: 11, badge: 'advance', ...pt(fast, slow, prev, tmp, null, null), links: snap(),
      msg: `prev catches up to ${labelOf(prev)}.`, msgAr: `prev بتلحق بـ ${labelOfAr(prev)}.` });

    slow = tmp;
    steps.push({ activeLine: 12, badge: 'advance', ...pt(fast, slow, prev, tmp, null, null), links: snap(),
      msg: slow === 'null' ? 'slow becomes null — the reverse loop exits!' : `slow steps forward to ${labelOf(slow)}.`,
      msgAr: slow === 'null' ? 'slow بقت null — حلقة العكس بتخرج!' : `slow بتتقدم لـ ${labelOfAr(slow)}.` });
  }

  let left = 'idx0';
  steps.push({ activeLine: 14, badge: 'compare', ...pt(fast, slow, prev, null, left, null), links: snap(),
    msg: `left = head — ${labelOf(left)}. Time to compare the two halves.`,
    msgAr: `left = head — ${labelOfAr(left)}. دلوقتي نقارن النصين.` });

  let right = prev;
  steps.push({ activeLine: 15, badge: 'compare', ...pt(fast, slow, prev, null, left, right), links: snap(),
    msg: `right = prev — ${labelOf(right)}, the head of the reversed half.`,
    msgAr: `right = prev — ${labelOfAr(right)}، رأس النص المعكوس.` });

  while (right !== 'null') {
    const lv = valueOf(left), rv = valueOf(right);
    const matched = lv === rv;
    const isMiddleSelfCheck = left === right;
    steps.push({ activeLine: 17, badge: 'compare', ...pt(fast, slow, prev, null, left, right), links: snap(),
      msg: isMiddleSelfCheck
        ? `left and right are both on ${labelOf(left)} — the true middle. It trivially matches itself.`
        : (matched
          ? `${labelOf(left)} (${lv}) matches ${labelOf(right)} (${rv}) — keep going.`
          : `${labelOf(left)} (${lv}) does NOT match ${labelOf(right)} (${rv}) — not a palindrome!`),
      msgAr: isMiddleSelfCheck
        ? `left و right الاتنين على ${labelOfAr(left)} — نص القائمة الحقيقي. بتطابق نفسها بداهة.`
        : (matched
          ? `${labelOfAr(left)} (${lv}) طابقت ${labelOfAr(right)} (${rv}) — كمّلي.`
          : `${labelOfAr(left)} (${lv}) مطابقتش ${labelOfAr(right)} (${rv}) — مش متناظرة!`) });
    if (!matched) break;

    left = links[left];
    steps.push({ activeLine: 18, badge: 'advance', ...pt(fast, slow, prev, null, left, right), links: snap(),
      msg: left === 'null' ? "left's node had no link left (severed during reversal) — left falls off the list." : `left advances to ${labelOf(left)}.`,
      msgAr: left === 'null' ? 'العقدة اللي كانت عليها left معهاش لينك (اتقطع وقت العكس) — left بتقع بره القائمة.' : `left بتتقدم لـ ${labelOfAr(left)}.` });

    right = links[right];
    steps.push({ activeLine: 19, badge: 'advance', ...pt(fast, slow, prev, null, left, right), links: snap(),
      msg: right === 'null' ? 'right becomes null — the loop exits!' : `right advances to ${labelOf(right)}.`,
      msgAr: right === 'null' ? 'right بقت null — الحلقة بتخرج!' : `right بتتقدم لـ ${labelOfAr(right)}.` });
  }

  steps.push({ activeLine: 21, badge: 'done', ...pt(fast, slow, prev, null, left, right), links: snap(),
    msg: "right is null — every pair matched all the way to the middle. It's a palindrome!",
    msgAr: 'right بقت null — كل الأزواج طابقت لحد النص. القائمة متناظرة (palindrome)!' });

  return steps;
}

const STEPS = buildSteps();
const CHALLENGES = CODE_LINES.map((c, i) => ({ ...c, originalIndex: i })).filter(c => c.isChallenge);
const blankUserCode = () => CODE_LINES.map(c => c.isChallenge ? '' : c.text);

const UI_TEXT = {
  title: { en: 'Trace Game', ar: 'لعبة التتبّع' },
  reset: { en: 'Reset', ar: 'إعادة' },
  stepCoding: { en: 'Step 1: Complete the code.', ar: 'الخطوة 1: كمّلي الكود.' },
  stepVisualizing: { en: 'Step 2: Trace the execution, node by node.', ar: 'الخطوة 2: تابعي التنفيذ، عقدة عقدة.' },
  completeMissingLine: { en: 'Complete the missing line', ar: 'كمّلي السطر الناقص' },
  codeCompleted: { en: 'Code completed!', ar: 'الكود اتكمّل!' },
  completeToUnlock: { en: 'Complete the code to unlock the trace.', ar: 'كمّلي الكود عشان تفتحي التتبّع.' },
  back: { en: '◀ Back', ar: '◀ السابق' },
  next: { en: 'Next ▶', ar: 'التالي ▶' },
  currentState: { en: 'Current State', ar: 'الحالة الحالية' },
  correct: { en: 'Correct!', ar: 'صح!' },
  tryAgain: { en: 'Oops! Try again.', ar: 'أوبس! جرّبي تاني.' },
  codeCompleteVisualize: { en: "Code complete! Let's visualize it.", ar: 'الكود خلص! يلا نتابع بالصور.' },
  solvedMsg: { en: "It's a palindrome: 1 → 2 → 3 → 2 → 1", ar: 'القائمة متناظرة: 1 → 2 → 3 → 2 → 1' },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const nodeX = (i) => 40 + i * 110;
const nodeCx = (i) => nodeX(i) + 26;
const posOf = (key) => (key === 'null' || key === null || key === undefined) ? null : SLOTS.indexOf(key);

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function LinkedListGame({ isAr } = {}) {
  const tr = (key) => (isAr ? UI_TEXT[key].ar : UI_TEXT[key].en);

  const [gameState, setGameState] = useState('coding'); // 'coding' | 'visualizing'
  const [userCode, setUserCode] = useState(blankUserCode());
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [visStep, setVisStep] = useState(0);
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });

  const currentChallenge = CHALLENGES[challengeIndex];
  const isCoding = gameState === 'coding';
  const step = STEPS[visStep];

  const handleSelect = (option) => {
    if (!isCoding || !currentChallenge) return;

    if (option === currentChallenge.correctAnswer) {
      setUserCode(prev => {
        const next = [...prev];
        next[currentChallenge.originalIndex] = option;
        return next;
      });
      setFeedback({ show: true, message: tr('correct'), type: 'success' });

      setTimeout(() => {
        setFeedback({ show: false, message: '', type: '' });
        if (challengeIndex < CHALLENGES.length - 1) {
          setChallengeIndex(i => i + 1);
        } else {
          setGameState('visualizing');
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
    setGameState('coding');
    setUserCode(blankUserCode());
    setChallengeIndex(0);
    setVisStep(0);
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
              {isCoding ? tr('stepCoding') : tr('stepVisualizing')}
            </p>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={handleReset} className="llgp-btn-press" style={{
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
          .llgp-btn-press:active { transform: translateY(2px) !important; }
          .llgp-two-col { display: grid; grid-template-columns: minmax(0,2fr) minmax(0,3fr); gap: 20px; align-items: start; }
          @media (max-width: 900px) { .llgp-two-col { grid-template-columns: 1fr; } }
        `}</style>

        <div className="llgp-two-col">

          {/* ── LEFT: CODE + CHALLENGE ──────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ background: '#2D3436', borderRadius: 20, overflow: 'hidden', border: '4px solid #1E2528', boxShadow: '0 6px 0 rgba(0,0,0,0.12)' }}>
              <div style={{ background: '#232A2D', padding: '8px 16px', borderBottom: '2px solid #1E2528' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#B2BEC3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  isPalindrome.js
                </span>
              </div>
              <div style={{ padding: '14px 18px', fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.9 }}>
                {CODE_LINES.map((lineDef, index) => {
                  const isCurrentBlank = isCoding && lineDef.isChallenge && currentChallenge?.originalIndex === index;
                  const isFilled = lineDef.isChallenge && userCode[index] !== '';
                  const isActive = !isCoding && step.activeLine === index;
                  const text = isCurrentBlank ? '  // ← pick the line below' : (isCoding ? userCode[index] : lineDef.text);
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
                      <button key={i} onClick={() => handleSelect(opt)} className="llgp-btn-press" dir="ltr" style={{
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
                  : (isAr ? `خطوة ${visStep + 1} من ${STEPS.length}` : `Step ${visStep + 1} of ${STEPS.length}`)}
              </div>
              <button onClick={() => setVisStep(v => Math.max(0, v - 1))} disabled={isCoding || visStep === 0} className="llgp-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 14px', borderRadius: 100,
                border: '2px solid var(--line)', background: '#F8F9FA', color: 'var(--ink-2)', cursor: 'pointer',
                opacity: (isCoding || visStep === 0) ? 0.4 : 1,
              }}>{tr('back')}</button>
              <button onClick={() => setVisStep(v => Math.min(STEPS.length - 1, v + 1))} disabled={isCoding || visStep >= STEPS.length - 1} className="llgp-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 16px', borderRadius: 100,
                border: 'none', background: 'var(--secondary)', color: '#FFF', cursor: 'pointer',
                boxShadow: '0 3px 0 var(--secondary-shadow)',
                opacity: (isCoding || visStep >= STEPS.length - 1) ? 0.4 : 1,
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
                    <ArrowMarker id="llgp-ah" color="#B2BEC3" />
                    <ArrowMarker id="llgp-ah-back" color="#FF5252" />
                  </defs>

                  <text x={nodeX(SLOTS.length - 1) + 89} y="105" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="16" fill="#B2BEC3">∅</text>

                  {/* arrows — straight for adjacent-forward, dipping curve for skip-forward OR
                      backward (targetPos < i) — this problem introduces backward links once the
                      second half gets reversed. */}
                  {SLOTS.map((slotKey, i) => {
                    const target = step.links[slotKey];
                    if (target === undefined) return null;
                    if (target === 'null') {
                      const x1 = nodeX(i) + 26;
                      return (
                        <g key={`n-${slotKey}`}>
                          <path d={`M ${x1} 137 L ${x1} 168`} stroke="#B2BEC3" strokeWidth="2.5" strokeDasharray="4 3" fill="none" markerEnd="url(#llgp-ah)" />
                          <text x={x1} y="182" textAnchor="middle" fontSize="11" fontWeight="900" fill="#B2BEC3" fontFamily="var(--mono)">null</text>
                        </g>
                      );
                    }
                    const targetPos = posOf(target);
                    if (targetPos === i + 1) {
                      return <line key={`a-${slotKey}`} x1={nodeX(i) + 52} y1="105" x2={nodeX(i + 1)} y2="105" stroke="#B2BEC3" strokeWidth="3" markerEnd="url(#llgp-ah)" style={{ transition: 'all 0.5s' }} />;
                    }
                    if (targetPos !== i) {
                      const x1 = nodeX(i) + 26, x2 = nodeX(targetPos) + 26, midX = (x1 + x2) / 2;
                      return <path key={`s-${slotKey}`} d={`M ${x1} 137 Q ${midX} 192 ${x2} 137`} stroke="#FF5252" strokeWidth="3" strokeDasharray="7,5" fill="none" markerEnd="url(#llgp-ah-back)" style={{ transition: 'all 0.5s' }} />;
                    }
                    return null;
                  })}

                  {NODE_IDS.map((nodeId, i) => {
                    const isActive = step.slow === nodeId || step.left === nodeId || step.right === nodeId;
                    return (
                      <g key={nodeId} transform={`translate(${nodeX(i)},85)`}>
                        <NodeValueBox y={0} value={VALUES[i]} active={isActive} />
                      </g>
                    );
                  })}

                  {posOf(step.fast) !== null && (
                    <PointerBadge cx={nodeCx(posOf(step.fast)) - 30} width={48} label="fast"
                      color={PALETTE.red} textColor="#FFF" markerId="llgp-ah" />
                  )}
                  {posOf(step.slow) !== null && (
                    <PointerBadge cx={nodeCx(posOf(step.slow)) + 30} width={48} label="slow"
                      color={PALETTE.teal} textColor="#FFF" markerId="llgp-ah" />
                  )}
                  {step.prev !== null && step.prev !== 'null' && posOf(step.prev) !== null && (
                    <PointerBadge cx={nodeCx(posOf(step.prev)) - 30} width={48} label="prev" side="below"
                      color={PALETTE.yellow} textColor="#7A5000" markerId="llgp-ah" />
                  )}
                  {step.tmp !== null && step.tmp !== 'null' && posOf(step.tmp) !== null && (
                    <PointerBadge cx={nodeCx(posOf(step.tmp)) + 30} width={44} label="tmp" side="below"
                      color={PALETTE.gray} textColor="#FFF" markerId="llgp-ah" />
                  )}
                  {step.left !== null && posOf(step.left) !== null && (
                    <PointerBadge cx={nodeCx(posOf(step.left)) - 30} width={44} label="left"
                      color="var(--secondary)" textColor="#FFF" markerId="llgp-ah" />
                  )}
                  {step.right !== null && step.right !== 'null' && posOf(step.right) !== null && (
                    <PointerBadge cx={nodeCx(posOf(step.right)) + 30} width={48} label="right"
                      color={PALETTE.orange} textColor="#FFF" markerId="llgp-ah" />
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
