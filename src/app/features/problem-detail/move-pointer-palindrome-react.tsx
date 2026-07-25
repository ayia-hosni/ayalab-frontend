// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, CheckCircle, XCircle, Sparkles, MousePointer2 } from 'lucide-react';
import { PALETTE } from './pointer-colors';
import { ArrowMarker, ScopeVariableBadge, NodeValueBox } from './game-ui';

// This game's pointer roles (fast/slow/prev/tmp/left/right) don't map 1:1 onto the
// shared POINTER_COLORS naming (e.g. "prev" here is yellow, not red), so colors are
// composed from the shared PALETTE instead of importing POINTER_COLORS directly.
const VAR_COLORS = { fast: PALETTE.red, slow: PALETTE.teal, prev: PALETTE.yellow, tmp: PALETTE.gray, left: 'var(--secondary)', right: PALETTE.orange };
const VAR_TEXT_COLORS = { fast: '#FFF', slow: '#FFF', prev: '#7A5000', tmp: '#FFF', left: '#FFF', right: '#FFF' };

// ─── DATA ────────────────────────────────────────────────────────────────────
// Worked example: a true palindrome, odd length (N=5) — chosen deliberately so the
// middle node (idx2) ends up compared against *itself* once the halves meet, which
// is the nice payoff moment of this whole trace (see steps 24-26 below).
// No dummy node here (unlike remove-elements) — palindrome check needs none.

const N = 5;
const VALUES = [1, 2, 3, 2, 1];
const NODE_IDS = ['idx0', 'idx1', 'idx2', 'idx3', 'idx4'];
const SLOTS = [...NODE_IDS];

const INITIAL_LINKS = { idx0: 'idx1', idx1: 'idx2', idx2: 'idx3', idx3: 'idx4', idx4: 'null' };
const INITIAL_POINTERS = { fast: 'null', slow: 'null', prev: 'null', tmp: 'null', left: 'null', right: 'null', ...INITIAL_LINKS };

// One drag per meaningful action. "from" is whatever is physically dragged — a
// pointer badge (fast/slow/prev/tmp/left/right) or a node's own outgoing link
// (its slot id) when an assignment rewrites *that node's* next pointer — exactly
// like remove-elements' recursive mode lets you drag a node id as `from`.
const STEPS = [
  // ── Phase A: find the middle (fast/slow) ──────────────────────────────────
  { from: 'fast', to: 'idx0', code: 'fast = head', desc: 'fast starts at head — place it on node 1 (value 1).',
    descAr: 'fast تبدأ عند head — حطيها على أول عقدة (القيمة 1).' },
  { from: 'slow', to: 'idx0', code: 'slow = head', desc: 'slow also starts at head, on the same node.',
    descAr: 'slow كمان تبدأ عند head، على نفس العقدة.' },
  { from: 'fast', to: 'idx2', code: 'fast = fast.next.next', desc: "fast.next (node 2) wasn't null, so fast jumps two nodes forward to node 3.",
    descAr: 'fast.next (عقدة 2) مكنتش null، يبقى fast بتقفز عقدتين لقدام لعقدة 3.' },
  { from: 'slow', to: 'idx1', code: 'slow = slow.next', desc: 'slow steps forward one node, to node 2.',
    descAr: 'slow بتتقدم عقدة واحدة، لعقدة 2.' },
  { from: 'fast', to: 'idx4', code: 'fast = fast.next.next', desc: "fast.next (node 4) wasn't null either, so fast jumps again to node 5.",
    descAr: 'fast.next (عقدة 4) برضو مكنتش null، فـ fast بتقفز تاني لعقدة 5.' },
  { from: 'slow', to: 'idx2', code: 'slow = slow.next', desc: 'slow steps forward to node 3 — the loop now exits, since fast (node 5) has no next. slow rests exactly on the middle.',
    descAr: 'slow بتتقدم لعقدة 3 — الحلقة دلوقتي بتخرج، لأن fast (عقدة 5) معهاش next. slow واقفة بالظبط في نص القائمة.' },

  // ── Phase B: reverse the second half, starting at slow (the middle) ──────
  { from: 'tmp', to: 'idx3', code: 'tmp = slow.next', desc: "Before reversing, save slow's next: tmp = node 4.",
    descAr: 'قبل ما نعكس، احفظي next بتاع slow: tmp = عقدة 4.' },
  { from: 'idx2', to: 'null', code: 'slow.next = prev', desc: "Reverse: node 3's own link now points to prev (still null) — it becomes the tail of the reversed half.",
    descAr: 'اعكسي: لينك عقدة 3 بقى يشاور على prev (لسه null) — بقت آخر عقدة في النص المعكوس.' },
  { from: 'prev', to: 'idx2', code: 'prev = slow', desc: 'prev catches up to node 3.',
    descAr: 'prev بتلحق بعقدة 3.' },
  { from: 'slow', to: 'idx3', code: 'slow = tmp', desc: 'slow steps forward to node 4 (the saved tmp).',
    descAr: 'slow بتتقدم لعقدة 4 (اللي كانت متحفوظة في tmp).' },

  { from: 'tmp', to: 'idx4', code: 'tmp = slow.next', desc: "Save slow's next again: tmp = node 5.",
    descAr: 'احفظي next بتاع slow تاني: tmp = عقدة 5.' },
  { from: 'idx3', to: 'idx2', code: 'slow.next = prev', desc: "Reverse: node 4's own link now points backward to node 3 — the first reversed arrow!",
    descAr: 'اعكسي: لينك عقدة 4 بقى يشاور لورا على عقدة 3 — أول سهم معكوس!' },
  { from: 'prev', to: 'idx3', code: 'prev = slow', desc: 'prev catches up to node 4.',
    descAr: 'prev بتلحق بعقدة 4.' },
  { from: 'slow', to: 'idx4', code: 'slow = tmp', desc: 'slow steps forward to node 5.',
    descAr: 'slow بتتقدم لعقدة 5.' },

  { from: 'tmp', to: 'null', code: 'tmp = slow.next', desc: 'node 5 has no next — tmp becomes null.',
    descAr: 'عقدة 5 معهاش next — tmp بقت null.' },
  { from: 'idx4', to: 'idx3', code: 'slow.next = prev', desc: "Reverse: node 5's own link now points backward to node 4 — the second half is fully reversed.",
    descAr: 'اعكسي: لينك عقدة 5 بقى يشاور لورا على عقدة 4 — النص التاني بقى معكوس بالكامل.' },
  { from: 'prev', to: 'idx4', code: 'prev = slow', desc: 'prev catches up to node 5 — the new head of the reversed half.',
    descAr: 'prev بتلحق بعقدة 5 — رأس النص المعكوس الجديد.' },
  { from: 'slow', to: 'null', code: 'slow = tmp', desc: 'slow becomes null — the reverse loop exits!',
    descAr: 'slow بقت null — حلقة العكس بتخرج!' },

  // ── Phase C: compare the two halves ───────────────────────────────────────
  { from: 'left', to: 'idx0', code: 'left = head', desc: 'left starts back at head, node 1.',
    descAr: 'left بترجع تبدأ من head، عقدة 1.' },
  { from: 'right', to: 'idx4', code: 'right = prev', desc: 'right starts at prev (node 5) — the head of the reversed half.',
    descAr: 'right بتبدأ عند prev (عقدة 5) — رأس النص المعكوس.' },
  { from: 'left', to: 'idx1', code: 'left = left.next', desc: 'left (val 1) matched right (val 1) — advance left to node 2.',
    descAr: 'left (القيمة 1) طابقت right (القيمة 1) — left بتتقدم لعقدة 2.' },
  { from: 'right', to: 'idx3', code: 'right = right.next', desc: "Follow node 5's reversed link — right advances to node 4.",
    descAr: 'امشي على لينك عقدة 5 المعكوس — right بتتقدم لعقدة 4.' },
  { from: 'left', to: 'idx2', code: 'left = left.next', desc: 'left (val 2) matched right (val 2) — advance left to node 3, the middle.',
    descAr: 'left (القيمة 2) طابقت right (القيمة 2) — left بتتقدم لعقدة 3، النص.' },
  { from: 'right', to: 'idx2', code: 'right = right.next', desc: "Follow node 4's reversed link — right lands on node 3 too. left and right are now on the exact same node: the true middle!",
    descAr: 'امشي على لينك عقدة 4 المعكوس — right بتوصل لعقدة 3 هي كمان. left و right بقوا على نفس العقدة بالظبط: نص القائمة الحقيقي!' },
  { from: 'left', to: 'null', code: 'left = left.next', desc: "Node 3's own link is null (we severed it while reversing) — left falls off the end. The middle node trivially matches itself, no real comparison needed.",
    descAr: 'لينك عقدة 3 بقى null (قطعناه وإحنا بنعكس) — left بتقع بره القائمة. العقدة النص بتطابق نفسها بداهة، مفيش داعي لمقارنة حقيقية.' },
  { from: 'right', to: 'null', code: 'right = right.next', desc: 'Same link, same result — right becomes null too. The loop exits because right is null → the list is a palindrome!',
    descAr: 'نفس اللينك، نفس النتيجة — right بقت null هي كمان. الحلقة بتخرج لأن right بقت null → القائمة متناظرة (palindrome)!' },
];

const CODE = [
  'function isPalindrome(head) {',                      // 0
  '  let fast = head;',                                 // 1
  '  let slow = head;',                                 // 2
  '  while (fast !== null && fast.next !== null) {',    // 3
  '    fast = fast.next.next;',                         // 4
  '    slow = slow.next;',                               // 5
  '  }',                                                  // 6
  '  let prev = null;',                                 // 7
  '  while (slow !== null) {',                          // 8
  '    const tmp = slow.next;',                          // 9
  '    slow.next = prev;',                               // 10
  '    prev = slow;',                                    // 11
  '    slow = tmp;',                                     // 12
  '  }',                                                  // 13
  '  let left = head;',                                 // 14
  '  let right = prev;',                                // 15
  '  while (right !== null) {',                          // 16
  '    if (left.val !== right.val) return false;',      // 17
  '    left = left.next;',                               // 18
  '    right = right.next;',                             // 19
  '  }',                                                  // 20
  '  return true;',                                      // 21
  '}',                                                     // 22
];

const LINE_FOR = {
  'fast = head': 1,
  'slow = head': 2,
  'fast = fast.next.next': 4,
  'slow = slow.next': 5,
  'tmp = slow.next': 9,
  'slow.next = prev': 10,
  'prev = slow': 11,
  'slow = tmp': 12,
  'left = head': 14,
  'right = prev': 15,
  'left = left.next': 18,
  'right = right.next': 19,
};

// Generalized version of the single-preludeAfter mechanic — this problem has three
// loop phases, each needing its own structural-line reveal once it begins.
const PRELUDE_SCHEDULE = [
  { after: 1, lines: [3] },
  { after: 6, lines: [6, 7, 8] },
  { after: 18, lines: [13, 14, 15, 16, 17] },
];
const EPILOGUE_LINES = [20, 21, 22];

const UI_TEXT = {
  title: { en: 'Move the Pointer', ar: 'حرّكي المؤشر' },
  subtitle: { en: 'Drag the highlighted pointer yourself — the code lights up once you get it right', ar: 'اسحبي المؤشر المضيء بنفسك — الكود هيضوّي أول ما تجاوبي صح' },
  reset: { en: 'Reset', ar: 'إعادة' },
  solved: { en: 'Solved!', ar: 'اتحلّت!' },
  solvedMsg: { en: 'All checks passed — it\'s a palindrome! 🎉 Both halves matched all the way to the middle.', ar: 'كل المقارنات ظبطت — القائمة متناظرة (palindrome)! 🎉 النص التاني اتطابق مع الأول لحد النص.' },
  drag: { en: 'Drag', ar: 'اسحبي' },
  scopeVars: { en: 'Scope Variables', ar: 'متغيرات النطاق' },
  correct: { en: 'Correct!', ar: 'صح!' },
  tryAgain: { en: 'Not quite — try again.', ar: 'مش كده — جرّبي تاني.' },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const posOf = (key) => (key === 'null' || key === null || key === undefined) ? null : SLOTS.indexOf(key);
const nodeX = (i) => 40 + i * 110;
const nodeCx = (i) => nodeX(i) + 26;

const VAR_LIST = ['fast', 'slow', 'prev', 'tmp', 'left', 'right'];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function MovePointer({ isAr } = {}) {
  const tr = (key) => (isAr ? UI_TEXT[key].ar : UI_TEXT[key].en);
  const [pointers, setPointers] = useState({ ...INITIAL_POINTERS });
  const [stepIdx, setStepIdx] = useState(0);
  const [lastStep, setLastStep] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const draggingRef = useRef(null);
  draggingRef.current = dragging;

  // touch-action:none keeps most browsers from panning while a drag is in progress, but it
  // isn't reliably honored everywhere — React also attaches touchmove listeners passively by
  // default, so a synthetic onTouchMove handler couldn't preventDefault anyway. A native,
  // non-passive listener is the belt-and-suspenders fix that actually stops the page from
  // scrolling out from under a finger mid-drag.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onTouchMove = (e) => { if (draggingRef.current) e.preventDefault(); };
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, []);

  const completedCount = stepIdx;
  const currentHint = STEPS[completedCount] ?? null;
  const isComplete = currentHint === null;
  const activeLine = lastStep ? LINE_FOR[lastStep.code] : null;
  const currentDesc = currentHint ? (isAr ? currentHint.descAr : currentHint.desc) : null;

  const revealedLines = new Set([0]);
  PRELUDE_SCHEDULE.forEach(({ after, lines }) => { if (completedCount >= after) lines.forEach(l => revealedLines.add(l)); });
  for (let i = 0; i < completedCount; i++) revealedLines.add(LINE_FOR[STEPS[i].code]);
  if (isComplete) EPILOGUE_LINES.forEach(l => revealedLines.add(l));

  const canDrag = (nodeId) => !isComplete && currentHint && nodeId === currentHint.from;

  const flashFeedback = (type, message) => {
    setFeedback({ show: true, type, message });
    setTimeout(() => setFeedback({ show: false, message: '', type: '' }), 900);
  };

  const handlePointerDown = (e, nodeId) => {
    e.stopPropagation();
    e.preventDefault();
    if (!canDrag(nodeId)) return;
    const rect = svgRef.current.getBoundingClientRect();
    setDragging({ from: nodeId });
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    const rect = svgRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handlePointerUp = (e, targetId) => {
    e.stopPropagation();
    if (!dragging) return;
    if (targetId === currentHint.to) {
      const done = currentHint;
      setPointers(prev => ({ ...prev, [dragging.from]: targetId }));
      setLastStep(done);
      setStepIdx(prev => prev + 1);
      flashFeedback('success', tr('correct'));
    } else {
      flashFeedback('error', tr('tryAgain'));
    }
    setDragging(null);
  };

  // Touch-originated pointer events keep targeting wherever the drag *started* (the handle),
  // never wherever the finger currently is — unlike mouse, there's no automatic retargeting
  // to the element under the pointer. So the per-target onPointerUp handlers below (which
  // work fine for mouse) never fire on touch; this bubbled-up fallback does the same hit-test
  // manually via elementFromPoint against the drop targets' data-drop-id.
  const handleGlobalPointerUp = (e) => {
    if (!dragging) return;
    if (e?.pointerType === 'touch') {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const dropEl = el?.closest('[data-drop-id]');
      if (dropEl) { handlePointerUp(e, dropEl.getAttribute('data-drop-id')); return; }
    }
    setDragging(null);
  };
  const handleGlobalPointerCancel = () => setDragging(null);

  const handleReset = () => {
    setPointers({ ...INITIAL_POINTERS });
    setStepIdx(0);
    setLastStep(null);
    setDragging(null);
    setFeedback({ show: false, message: '', type: '' });
  };

  // Six pointer variables share this canvas (one more than the node count), so their
  // "no target yet" resting spots use a narrower stride than the 110px node spacing —
  // otherwise the last badge or two would land past the visible edge of the
  // horizontally-scrollable canvas.
  const NO_TARGET_STRIDE = (SLOTS.length * 110) / VAR_LIST.length;

  const varPositions = (() => {
    const raw = VAR_LIST.map((varName, varIdx) => {
      const value = pointers[varName];
      const targetPos = value === 'null' ? null : posOf(value);
      const hasTarget = targetPos !== null && targetPos !== -1;
      if (!hasTarget) return { name: varName, cx: 40 + varIdx * NO_TARGET_STRIDE + 28, targetPos: null, hasTarget: false };
      const group = VAR_LIST.filter(v => pointers[v] !== 'null' && posOf(pointers[v]) === targetPos);
      const idxInGroup = group.indexOf(varName);
      const cx = nodeCx(targetPos) + (idxInGroup - (group.length - 1) / 2) * 58;
      return { name: varName, cx, targetPos, hasTarget: true };
    });
    const sorted = [...raw].sort((a, b) => a.cx - b.cx);
    const MIN_GAP = 60;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].cx < sorted[i - 1].cx + MIN_GAP) sorted[i].cx = sorted[i - 1].cx + MIN_GAP;
    }
    const byName = {};
    sorted.forEach(s => { byName[s.name] = s; });
    return byName;
  })();
  const varInfo = (varName) => varPositions[varName];

  const dragOrigin = (nodeId) => {
    const varIdx = VAR_LIST.indexOf(nodeId);
    if (varIdx !== -1) return { x: varInfo(nodeId).cx, y: 50 };
    const pos = posOf(nodeId);
    if (pos === null) return null;
    return { x: nodeX(pos) + 52, y: 156 };
  };

  // Any node currently held by slow (phases A/B) or left/right (phase C) gets the
  // "in-focus" highlight — the badges themselves already show exact positions.
  const isNodeActive = (nodeId) => pointers.slow === nodeId || pointers.left === nodeId || pointers.right === nodeId;

  return (
    <div ref={wrapperRef} style={{ fontFamily: 'var(--sans)', color: 'var(--ink)', padding: '24px 24px 48px', userSelect: 'none', WebkitUserSelect: 'none' }}
      onPointerMove={handlePointerMove} onPointerUp={handleGlobalPointerUp} onPointerCancel={handleGlobalPointerCancel} onMouseLeave={handleGlobalPointerCancel}>
      <div style={{ maxWidth: 1150, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF7F0 0%, #FFF0FF 55%, #F0F4FF 100%)',
          borderRadius: 32, border: '4px solid #FFF', boxShadow: '0 8px 0 var(--shadow-color)',
          padding: '16px 24px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14,
        }}>
          <div dir={isAr ? 'rtl' : 'ltr'} style={{ textAlign: isAr ? 'right' : 'left' }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
              {tr('title')}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
              {tr('subtitle')}
            </p>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={handleReset} className="mpp-btn-press" style={{
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
          .mpp-btn-press:active { transform: translateY(2px) !important; }
          @keyframes mpp-line-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
          .mpp-line-in { animation: mpp-line-in 0.35s ease; }
          .mpp-two-col { display: grid; grid-template-columns: minmax(0,2fr) minmax(0,3fr); gap: 20px; align-items: start; }
          @media (max-width: 900px) { .mpp-two-col { grid-template-columns: 1fr; } }
        `}</style>

        <div className="mpp-two-col">

          {/* ── LEFT: CODE + HINT ────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>

            <div style={{ background: '#2D3436', borderRadius: 20, overflow: 'hidden', border: '4px solid #1E2528', boxShadow: '0 6px 0 rgba(0,0,0,0.12)' }}>
              <div style={{ background: '#232A2D', padding: '8px 16px', borderBottom: '2px solid #1E2528' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#B2BEC3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  isPalindrome.js
                </span>
              </div>
              <div style={{ padding: '14px 18px', fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.9 }}>
                {CODE.map((text, index) => {
                  if (!revealedLines.has(index)) return null;
                  const isActive = activeLine === index;
                  return (
                    <div key={index} className="mpp-line-in" style={{
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
                    <Sparkles size={18} /> {tr('solved')}
                  </div>
                  <p dir={isAr ? 'rtl' : 'ltr'} style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)', lineHeight: 1.6, textAlign: isAr ? 'right' : 'left' }}>
                    {tr('solvedMsg')}
                  </p>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 900, textTransform: isAr ? 'none' : 'uppercase', letterSpacing: '0.6px', color: '#D49B1C' }}>{tr('drag')}</span>
                    <span dir="ltr" style={{ background: 'var(--primary)', color: '#FFF', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 900, padding: '3px 10px', borderRadius: 8 }}>
                      {currentHint.from}
                    </span>
                    <MousePointer2 size={13} style={{ color: '#D49B1C', transform: isAr ? 'scaleX(-1)' : 'none' }} />
                    <span dir="ltr" style={{ background: currentHint.to === 'null' ? '#FF6B6B' : 'var(--easy)', color: '#FFF', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 900, padding: '3px 10px', borderRadius: 8 }}>
                      {currentHint.to}
                    </span>
                  </div>
                  <p dir={isAr ? 'rtl' : 'ltr'} style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)', lineHeight: 1.6, textAlign: isAr ? 'right' : 'left' }}>
                    {currentDesc}
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
                {isComplete
                  ? (isAr ? `خلّصنا كل الـ ${STEPS.length} خطوة!` : `All ${STEPS.length} steps complete!`)
                  : (isAr ? `خطوة ${stepIdx + 1} من ${STEPS.length}` : `Step ${stepIdx + 1} of ${STEPS.length}`)}
              </div>
              <div style={{ height: 8, width: 120, background: 'rgba(165,94,234,0.1)', borderRadius: 100, overflow: 'hidden', border: '2px solid rgba(165,94,234,0.12)' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--secondary), var(--easy))', borderRadius: 100, width: `${Math.round((stepIdx / STEPS.length) * 100)}%`, transition: 'width 0.4s' }} />
              </div>
            </div>

            <div style={{
              background: '#F8F9FA', backgroundImage: 'radial-gradient(circle, #DFE6E9 1.5px, transparent 1.5px)', backgroundSize: '22px 22px',
              border: '4px solid var(--line)', borderRadius: 28, boxShadow: 'inset 0 4px 0 rgba(0,0,0,0.03), 0 8px 0 var(--shadow-color)',
              padding: '48px 16px 24px', minHeight: 320, position: 'relative', overflow: 'hidden', touchAction: 'none',
            }}>
              <div style={{ position: 'absolute', top: 14, left: 20, fontSize: 11, fontWeight: 900, textTransform: isAr ? 'none' : 'uppercase', letterSpacing: '0.6px', color: 'rgba(165,94,234,0.55)' }}>
                {tr('scopeVars')}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <svg ref={svgRef} width={SLOTS.length * 110 + 120} height="260" style={{ display: 'block', margin: '0 auto' }}>
                  <defs>
                    <ArrowMarker id="mpp-ah" color="#B2BEC3" />
                    <ArrowMarker id="mpp-ah-back" color="#FF5252" />
                    <ArrowMarker id="mpp-ah-drag" color="#FECA57" />
                  </defs>

                  {/* always-live "null" drop target */}
                  <g onPointerUp={(e) => handlePointerUp(e, 'null')} data-drop-id="null">
                    <rect x={nodeX(SLOTS.length - 1) + 66} y="130" width="46" height="52" fill="transparent" style={{ cursor: 'default' }} />
                    <text x={nodeX(SLOTS.length - 1) + 89} y="156" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="18" fill="#B2BEC3">∅</text>
                  </g>

                  {/* arrows — straight for adjacent-forward links, dipping curve for anything
                      non-adjacent (a skip-forward OR a backward/reversed link — targetPos < i),
                      stub for null. This problem introduces backward links (targetPos < i) once
                      the second half gets reversed, unlike remove-elements which never has them. */}
                  {SLOTS.map((slotKey, i) => {
                    const target = pointers[slotKey];
                    if (target === undefined) return null;
                    if (target === 'null') {
                      const x1 = nodeX(i) + 26;
                      return (
                        <g key={`n-${slotKey}`}>
                          <path d={`M ${x1} 182 L ${x1} 213`} stroke="#B2BEC3" strokeWidth="2.5" strokeDasharray="4 3" fill="none" markerEnd="url(#mpp-ah)" />
                          <text x={x1} y="227" textAnchor="middle" fontSize="11" fontWeight="900" fill="#B2BEC3" fontFamily="var(--mono)">null</text>
                        </g>
                      );
                    }
                    const targetPos = posOf(target);
                    if (targetPos === i + 1) {
                      return <line key={`a-${slotKey}`} x1={nodeX(i) + 52} y1="156" x2={nodeX(i + 1)} y2="156" stroke="#B2BEC3" strokeWidth="3" markerEnd="url(#mpp-ah)" style={{ transition: 'all 0.5s' }} />;
                    }
                    if (targetPos !== i) {
                      const x1 = nodeX(i) + 26, x2 = nodeX(targetPos) + 26, midX = (x1 + x2) / 2;
                      return <path key={`s-${slotKey}`} d={`M ${x1} 182 Q ${midX} 237 ${x2} 182`} stroke="#FF5252" strokeWidth="3" strokeDasharray="7,5" fill="none" markerEnd="url(#mpp-ah-back)" style={{ transition: 'all 0.5s' }} />;
                    }
                    return null;
                  })}

                  {/* data nodes — no removal in this problem, so every node stays fully opaque */}
                  {NODE_IDS.map((nodeId, i) => {
                    const value = VALUES[i];
                    const isActive = isNodeActive(nodeId);
                    const draggableHere = canDrag(nodeId);
                    return (
                      <g key={nodeId} transform={`translate(${nodeX(i)},130)`}>
                        <NodeValueBox y={0} value={value} active={isActive} dropId={nodeId} onPointerUp={(e) => handlePointerUp(e, nodeId)} />
                        {draggableHere && (
                          <circle cx="52" cy="26" r="8" fill="var(--primary)" stroke="#FFF" strokeWidth="2"
                            onPointerDown={(e) => handlePointerDown(e, nodeId)}
                            style={{ cursor: 'grab', touchAction: 'none', filter: 'drop-shadow(0 0 4px rgba(255,159,67,0.6))' }} />
                        )}
                      </g>
                    );
                  })}

                  {/* Scope Variables — floating badges above their current target. All six shown
                      throughout, each rendered as a dashed "null" badge until it has a real target. */}
                  {VAR_LIST.map((varName) => {
                    const { cx, hasTarget, targetPos } = varInfo(varName);
                    const varX = cx - 28;
                    return (
                      <ScopeVariableBadge key={varName}
                        x={varX} label={varName}
                        color={VAR_COLORS[varName]} textColor={VAR_TEXT_COLORS[varName]}
                        hasTarget={hasTarget} targetX={nodeCx(targetPos) - varX}
                        draggable={canDrag(varName)} onDragStart={(e) => handlePointerDown(e, varName)}
                        markerId="mpp-ah" />
                    );
                  })}

                  {dragging && (() => {
                    const origin = dragOrigin(dragging.from);
                    if (!origin) return null;
                    return <line x1={origin.x} y1={origin.y} x2={mousePos.x} y2={mousePos.y} stroke="#FECA57" strokeWidth="2.5" strokeDasharray="6,5" markerEnd="url(#mpp-ah-drag)" style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 4px rgba(254,202,87,0.6))' }} />;
                  })()}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
