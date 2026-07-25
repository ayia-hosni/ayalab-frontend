// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, CheckCircle, XCircle, Sparkles, MousePointer2 } from 'lucide-react';
import { POINTER_COLORS as VAR_COLORS, POINTER_TEXT_COLORS as VAR_TEXT_COLORS } from './pointer-colors';
import { ArrowMarker, ScopeVariableBadge } from './game-ui';

// ─── DATA ────────────────────────────────────────────────────────────────────
// Worked example includes a duplicate value at the head, in the middle, and at
// the tail — the three cases removeElements has to get right. Because values
// repeat (6 appears three times), nodes are identified by a stable slot id
// ('idx0'…'idx5'), never by their displayed value.

const N = 6;
const VAL = 6;
const VALUES = [6, 1, 2, 6, 3, 6];
const NODE_IDS = ['idx0', 'idx1', 'idx2', 'idx3', 'idx4', 'idx5'];
const SLOTS = ['dummy', ...NODE_IDS]; // fixed left-to-right layout — removal never reorders nodes

const INITIAL_LINKS = { dummy: 'null', idx0: 'idx1', idx1: 'idx2', idx2: 'idx3', idx3: 'idx4', idx4: 'idx5', idx5: 'null' };

const INITIAL_ITERATIVE = { head: 'null', prev: 'null', curr: 'null', nxt: 'null', ...INITIAL_LINKS };
const INITIAL_RECURSIVE = { head: 'null', result: 'null', ...INITIAL_LINKS };

// One drag per meaningful action. "from" is whatever is physically dragged —
// a pointer badge (head/prev/curr/nxt/result) or a node's own outgoing link
// (its slot id) when an assignment rewrites *that node's* next pointer.
const ITERATIVE_STEPS = [
  { from: 'head', to: 'idx0', code: 'head param',        desc: 'head is the given list head — place it on the first node (6).' },
  { from: 'dummy', to: 'idx0', code: 'dummy.next = head', desc: 'Point the new dummy node at head, so the real head always has a node in front of it.' },
  { from: 'prev', to: 'dummy', code: 'prev = dummy',      desc: 'prev starts at dummy — it will track the last node we decide to keep.' },
  { from: 'curr', to: 'idx0', code: 'curr = head',        desc: 'curr starts at head (node 6) and walks the list.' },

  { from: 'nxt',  to: 'idx1', code: 'nxt = curr.next',   desc: "Save curr's next before it might change: nxt = node 1." },
  { from: 'dummy', to: 'idx1', code: 'prev.next = nxt',  desc: 'node 6 matches val — bypass it: dummy.next now points to node 1.' },
  { from: 'curr', to: 'idx1', code: 'curr = nxt',         desc: 'Step curr forward to node 1.' },

  { from: 'nxt',  to: 'idx2', code: 'nxt = curr.next',   desc: 'Save curr.next: nxt = node 2.' },
  { from: 'prev', to: 'idx1', code: 'prev = curr',        desc: "node 1 doesn't match — keep it: prev advances to node 1." },
  { from: 'curr', to: 'idx2', code: 'curr = nxt',         desc: 'Step curr forward to node 2.' },

  { from: 'nxt',  to: 'idx3', code: 'nxt = curr.next',   desc: 'Save curr.next: nxt = node 6 (third node).' },
  { from: 'prev', to: 'idx2', code: 'prev = curr',        desc: "node 2 doesn't match — keep it: prev advances to node 2." },
  { from: 'curr', to: 'idx3', code: 'curr = nxt',         desc: 'Step curr forward to node 6.' },

  { from: 'nxt',  to: 'idx4', code: 'nxt = curr.next',   desc: 'Save curr.next: nxt = node 3.' },
  { from: 'idx2', to: 'idx4', code: 'prev.next = nxt',    desc: "node 6 matches val — bypass it: node 2's link now points to node 3." },
  { from: 'curr', to: 'idx4', code: 'curr = nxt',         desc: 'Step curr forward to node 3.' },

  { from: 'nxt',  to: 'idx5', code: 'nxt = curr.next',   desc: 'Save curr.next: nxt = node 6 (last node).' },
  { from: 'prev', to: 'idx4', code: 'prev = curr',        desc: "node 3 doesn't match — keep it: prev advances to node 3." },
  { from: 'curr', to: 'idx5', code: 'curr = nxt',         desc: 'Step curr forward to node 6.' },

  { from: 'nxt',  to: 'null', code: 'nxt = curr.next',   desc: 'Save curr.next: nxt = null — end of list.' },
  { from: 'idx4', to: 'null', code: 'prev.next = nxt',    desc: "node 6 matches val — bypass it: node 3's link now points to null." },
  { from: 'curr', to: 'null', code: 'curr = nxt',         desc: 'curr becomes null — the loop exits!' },

  { from: 'head', to: 'idx1', code: 'return dummy.next', desc: 'Return dummy.next (node 1) — the true new head, whether or not the original head was removed.' },
];

// Diving to the base case happens instantly (as it does in your head when you read
// recursive code) — only the unwind, where the actual decisions happen, is stepped.
// Each unwind frame is now two drags, mirroring iterative's inspect → act
// granularity: first rewire this node's own link to whatever the frame below
// returned, then decide whether the frame keeps head or forwards head.next.
const RECURSIVE_STEPS = [
  { from: 'head',   to: 'idx0', code: 'head param',  desc: 'head is the given list head — place it on the first node (6) to begin the dive.' },
  { from: 'result', to: 'null', code: 'base case',   desc: 'Deepest call: head is null, so this frame returns null immediately.' },

  { from: 'head',   to: 'idx5', code: 'unwind frame', desc: 'Unwinding begins at the deepest frame: head now refers to node 6 (last).' },
  { from: 'idx5',   to: 'null', code: 'head.next = removeElements(head.next, val)', desc: 'node 6 (last): wire its link to whatever the frame below returned (null).' },
  { from: 'result', to: 'null', code: 'return decision', desc: 'node 6 matches val — this frame returns head.next (null), dropping node 6.' },

  { from: 'head',   to: 'idx4', code: 'unwind frame', desc: 'Unwinding: head now refers to node 3.' },
  { from: 'idx4',   to: 'null', code: 'head.next = removeElements(head.next, val)', desc: "node 3: wire its link to what's below (null) — its old neighbor was just removed." },
  { from: 'result', to: 'idx4', code: 'return decision', desc: "node 3 doesn't match — this frame returns head itself. result becomes node 3." },

  { from: 'head',   to: 'idx3', code: 'unwind frame', desc: 'Unwinding: head now refers to node 6 (third).' },
  { from: 'idx3',   to: 'idx4', code: 'head.next = removeElements(head.next, val)', desc: 'node 6 (third): wire its link to node 3 below.' },
  { from: 'result', to: 'idx4', code: 'return decision', desc: 'node 6 matches val — this frame returns head.next (node 3), dropping node 6.' },

  { from: 'head',   to: 'idx2', code: 'unwind frame', desc: 'Unwinding: head now refers to node 2.' },
  { from: 'idx2',   to: 'idx4', code: 'head.next = removeElements(head.next, val)', desc: 'node 2: wire its link to node 3 below.' },
  { from: 'result', to: 'idx2', code: 'return decision', desc: "node 2 doesn't match — this frame returns head itself. result becomes node 2." },

  { from: 'head',   to: 'idx1', code: 'unwind frame', desc: 'Unwinding: head now refers to node 1.' },
  { from: 'idx1',   to: 'idx2', code: 'head.next = removeElements(head.next, val)', desc: 'node 1: wire its link to node 2 below.' },
  { from: 'result', to: 'idx1', code: 'return decision', desc: "node 1 doesn't match — this frame returns head itself. result becomes node 1." },

  { from: 'head',   to: 'idx0', code: 'unwind frame', desc: 'Unwinding: head now refers to node 6 (first) — the outermost call.' },
  { from: 'idx0',   to: 'idx1', code: 'head.next = removeElements(head.next, val)', desc: 'node 6 (first): wire its link to node 1 below.' },
  { from: 'result', to: 'idx1', code: 'return decision', desc: 'node 6 matches val — this frame returns head.next (node 1), dropping node 6.' },

  { from: 'head', to: 'idx1', code: 'return result', desc: 'The recursion fully unwinds — result (node 1) is the final head.' },
];

// Node whose link becomes stale (nothing points at it anymore) the moment a given
// step completes — used to gray the node out. Index = step index in *_STEPS above.
const ITER_REMOVED_AT = { 5: 'idx0', 14: 'idx3', 20: 'idx5' };
const REC_REMOVED_AT = { 4: 'idx5', 10: 'idx3', 19: 'idx0' };

// Arabic translations, positionally matched 1:1 to ITERATIVE_STEPS / RECURSIVE_STEPS
// above — kept as a parallel array (rather than folded into each step object) so the
// already-verified from/to/code/badge trace logic can't be disturbed by edits here.
const ITER_DESC_AR = [
  'head هو رأس القائمة المُعطى — حطيه على أول عقدة (6).',
  'خلّي dummy.next تشاور على head، عشان الرأس الحقيقي يكون دايمًا وراه عقدة.',
  'prev تبدأ عند dummy — هتفضل متابعة آخر عقدة قررنا نحتفظ بيها.',
  'curr تبدأ عند head (عقدة 6) وتمشي في القائمة.',
  "احفظي next بتاع curr قبل ما يتغيّر: nxt = عقدة 1.",
  'عقدة 6 بتساوي val — تخطّيها: dummy.next بقى يشاور على عقدة 1.',
  'curr تتقدم لعقدة 1.',
  'احفظي curr.next: nxt = عقدة 2.',
  'عقدة 1 مش بتساوي val — احتفظي بيها: prev تتقدم لعقدة 1.',
  'curr تتقدم لعقدة 2.',
  'احفظي curr.next: nxt = عقدة 6 (العقدة التالتة).',
  'عقدة 2 مش بتساوي val — احتفظي بيها: prev تتقدم لعقدة 2.',
  'curr تتقدم لعقدة 6.',
  'احفظي curr.next: nxt = عقدة 3.',
  "عقدة 6 بتساوي val — تخطّيها: لينك عقدة 2 بقى يشاور على عقدة 3.",
  'curr تتقدم لعقدة 3.',
  'احفظي curr.next: nxt = عقدة 6 (آخر عقدة).',
  'عقدة 3 مش بتساوي val — احتفظي بيها: prev تتقدم لعقدة 3.',
  'curr تتقدم لعقدة 6.',
  'احفظي curr.next: nxt = null — نهاية القائمة.',
  "عقدة 6 بتساوي val — تخطّيها: لينك عقدة 3 بقى يشاور على null.",
  'curr بقت null — الحلقة بتخرج!',
  'رجّعي dummy.next (عقدة 1) — الرأس الجديد الحقيقي، سواء اتمسح الرأس الأصلي أو لأ.',
];

const REC_DESC_AR = [
  'head هو رأس القائمة المُعطى — حطيه على أول عقدة (6) عشان نبدأ الغطس.',
  'أعمق استدعاء: head بقت null، فالفريم ده بيرجع null على طول.',
  'الفكّ بيبدأ من أعمق فريم: head بقت تشاور على عقدة 6 (آخر عقدة).',
  'عقدة 6 (آخر عقدة): وصّلي اللينك بتاعها بأي حاجة الفريم اللي تحت رجّعها (null).',
  'عقدة 6 بتساوي val — الفريم ده بيرجع head.next (null)، وعقدة 6 بتتشال.',
  'الفكّ مستمر: head بقت تشاور على عقدة 3.',
  'عقدة 3: وصّلي اللينك بتاعها باللي تحت (null) — الجار القديم بتاعها اتشال لسه.',
  'عقدة 3 مش بتساوي val — الفريم ده بيرجع head نفسها. result بقت عقدة 3.',
  'الفكّ مستمر: head بقت تشاور على عقدة 6 (التالتة).',
  'عقدة 6 (التالتة): وصّلي اللينك بتاعها بعقدة 3 اللي تحت.',
  'عقدة 6 بتساوي val — الفريم ده بيرجع head.next (عقدة 3)، وعقدة 6 بتتشال.',
  'الفكّ مستمر: head بقت تشاور على عقدة 2.',
  'عقدة 2: وصّلي اللينك بتاعها بعقدة 3 اللي تحت.',
  'عقدة 2 مش بتساوي val — الفريم ده بيرجع head نفسها. result بقت عقدة 2.',
  'الفكّ مستمر: head بقت تشاور على عقدة 1.',
  'عقدة 1: وصّلي اللينك بتاعها بعقدة 2 اللي تحت.',
  'عقدة 1 مش بتساوي val — الفريم ده بيرجع head نفسها. result بقت عقدة 1.',
  'الفكّ مستمر: head بقت تشاور على عقدة 6 (الأولى) — أول استدعاء.',
  'عقدة 6 (الأولى): وصّلي اللينك بتاعها بعقدة 1 اللي تحت.',
  'عقدة 6 بتساوي val — الفريم ده بيرجع head.next (عقدة 1)، وعقدة 6 بتتشال.',
  'الاستدعاء الذاتي اتفكّ بالكامل — result (عقدة 1) هو الرأس النهائي.',
];

const ITER_CODE = [
  'function removeElements(head, val) {',
  '  const dummy = new ListNode(0, head);',
  '  let prev = dummy;',
  '  let curr = head;',
  '  while (curr !== null) {',
  '    const nxt = curr.next;',
  '    if (curr.val === val) {',
  '      prev.next = nxt;',
  '    } else {',
  '      prev = curr;',
  '    }',
  '    curr = nxt;',
  '  }',
  '  return dummy.next;',
  '}',
];
const ITER_LINE_FOR = {
  'head param': 0, 'dummy.next = head': 1, 'prev = dummy': 2, 'curr = head': 3,
  'nxt = curr.next': 5, 'prev.next = nxt': 7, 'prev = curr': 9, 'curr = nxt': 11,
  'return dummy.next': 13,
};
const ITER_PRELUDE = [4, 6, 8, 10];
const ITER_EPILOGUE = [12, 14];

const REC_CODE = [
  'function removeElements(head, val) {',
  '  if (head === null) return null;',
  '  head.next = removeElements(head.next, val);',
  '  return head.val === val ? head.next : head;',
  '}',
];
const REC_LINE_FOR = {
  'head param': 0, 'base case': 1, 'unwind frame': 2,
  'head.next = removeElements(head.next, val)': 2,
  'return decision': 3, 'return result': 3,
};
const REC_PRELUDE = [];
const REC_EPILOGUE = [4];

const CONFIG = {
  iterative: { initial: INITIAL_ITERATIVE, steps: ITERATIVE_STEPS, descAr: ITER_DESC_AR, code: ITER_CODE, lineFor: ITER_LINE_FOR, prelude: ITER_PRELUDE, epilogue: ITER_EPILOGUE, preludeAfter: 4, removedAt: ITER_REMOVED_AT },
  recursive: { initial: INITIAL_RECURSIVE, steps: RECURSIVE_STEPS, descAr: REC_DESC_AR, code: REC_CODE, lineFor: REC_LINE_FOR, prelude: REC_PRELUDE, epilogue: REC_EPILOGUE, preludeAfter: 2, removedAt: REC_REMOVED_AT },
};

const UI_TEXT = {
  title: { en: 'Move the Pointer', ar: 'حرّكي المؤشر' },
  subtitle: { en: 'Drag the highlighted pointer yourself — the code lights up once you get it right', ar: 'اسحبي المؤشر المضيء بنفسك — الكود هيضوّي أول ما تجاوبي صح' },
  iterative: { en: 'iterative', ar: 'تكراري' },
  recursive: { en: 'recursive', ar: 'عودي' },
  reset: { en: 'Reset', ar: 'إعادة' },
  solved: { en: 'Solved!', ar: 'اتحلّت!' },
  solvedMsg: { en: "All the 6's are gone: 1 → 2 → 3 → null", ar: 'كل الـ 6 اتمسحوا: 1 → 2 → 3 → null' },
  drag: { en: 'Drag', ar: 'اسحبي' },
  scopeVars: { en: 'Scope Variables', ar: 'متغيرات النطاق' },
  correct: { en: 'Correct!', ar: 'صح!' },
  tryAgain: { en: 'Not quite — try again.', ar: 'مش كده — جرّبي تاني.' },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const posOf = (key) => (key === 'null' || key === null || key === undefined) ? null : SLOTS.indexOf(key);
const nodeX = (i) => 40 + i * 110;
const nodeCx = (i) => nodeX(i) + 26;


// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function MovePointer({ initialTechnique, onTechniqueChange, isAr } = {}) {
  const tr = (key) => (isAr ? UI_TEXT[key].ar : UI_TEXT[key].en);
  const [technique, setTechnique] = useState(initialTechnique === 'recursive' ? 'recursive' : 'iterative');
  const [pointers, setPointers] = useState({ iterative: { ...INITIAL_ITERATIVE }, recursive: { ...INITIAL_RECURSIVE } });
  const [stepIdx, setStepIdx] = useState({ iterative: 0, recursive: 0 });
  const [lastStep, setLastStep] = useState({ iterative: null, recursive: null });
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

  const { initial, steps, descAr, code, lineFor, prelude, epilogue, preludeAfter, removedAt } = CONFIG[technique];
  const pts = pointers[technique];
  const completedCount = stepIdx[technique];
  const currentHint = steps[completedCount] ?? null;
  const isComplete = currentHint === null;
  const activeLine = lastStep[technique] ? lineFor[lastStep[technique].code] : null;
  const currentDesc = currentHint ? (isAr ? descAr[completedCount] : currentHint.desc) : null;

  const revealedLines = new Set([0]);
  if (completedCount >= preludeAfter) prelude.forEach(l => revealedLines.add(l));
  for (let i = 0; i < completedCount; i++) revealedLines.add(lineFor[steps[i].code]);
  if (isComplete) epilogue.forEach(l => revealedLines.add(l));

  const removedSet = new Set();
  for (let i = 0; i < completedCount; i++) if (removedAt[i]) removedSet.add(removedAt[i]);
  // The node dropped by the drag that *just* completed — flashed red with a trash
  // mark for one step before settling into the calmer grayed-out treatment.
  const justRemovedId = completedCount > 0 ? (removedAt[completedCount - 1] ?? null) : null;

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
      setPointers(prev => ({ ...prev, [technique]: { ...prev[technique], [dragging.from]: targetId } }));
      setLastStep(prev => ({ ...prev, [technique]: done }));
      setStepIdx(prev => ({ ...prev, [technique]: prev[technique] + 1 }));
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

  const switchTechnique = (t) => { setTechnique(t); setDragging(null); setFeedback({ show: false, message: '', type: '' }); onTechniqueChange?.(t); };

  const handleReset = () => {
    setPointers(prev => ({ ...prev, [technique]: { ...CONFIG[technique].initial } }));
    setStepIdx(prev => ({ ...prev, [technique]: 0 }));
    setLastStep(prev => ({ ...prev, [technique]: null }));
    setDragging(null);
    setFeedback({ show: false, message: '', type: '' });
  };

  const varList = technique === 'iterative' ? ['head', 'prev', 'curr', 'nxt'] : ['head', 'result'];
  const varPositions = (() => {
    const raw = varList.map((varName, varIdx) => {
      const value = pts[varName];
      const targetPos = value === 'null' ? null : posOf(value);
      const hasTarget = targetPos !== null && targetPos !== -1;
      if (!hasTarget) return { name: varName, cx: 40 + varIdx * 130 + 28, targetPos: null, hasTarget: false };
      const group = varList.filter(v => pts[v] !== 'null' && posOf(pts[v]) === targetPos);
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
    const varIdx = varList.indexOf(nodeId);
    if (varIdx !== -1) return { x: varInfo(nodeId).cx, y: 50 };
    const pos = posOf(nodeId);
    if (pos === null) return null;
    return { x: nodeX(pos) + 52, y: 156 };
  };

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
            <div style={{ display: 'flex', gap: 0, background: '#F1F2F6', borderRadius: 100, padding: 3, border: '2px solid var(--line)' }}>
              {['iterative', 'recursive'].map(techName => (
                <button key={techName} onClick={() => switchTechnique(techName)} className="mpr-btn-press" style={{
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
            <button onClick={handleReset} className="mpr-btn-press" style={{
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
          .mpr-btn-press:active { transform: translateY(2px) !important; }
          @keyframes mpr-line-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
          .mpr-line-in { animation: mpr-line-in 0.35s ease; }
          @keyframes mpr-just-removed-pop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.25); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
          .mpr-just-removed { animation: mpr-just-removed-pop 0.4s ease; }
          .mpr-two-col { display: grid; grid-template-columns: minmax(0,2fr) minmax(0,3fr); gap: 20px; align-items: start; }
          @media (max-width: 900px) { .mpr-two-col { grid-template-columns: 1fr; } }
        `}</style>

        <div className="mpr-two-col">

          {/* ── LEFT: CODE + HINT ────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>

            <div style={{ background: '#2D3436', borderRadius: 20, overflow: 'hidden', border: '4px solid #1E2528', boxShadow: '0 6px 0 rgba(0,0,0,0.12)' }}>
              <div style={{ background: '#232A2D', padding: '8px 16px', borderBottom: '2px solid #1E2528' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#B2BEC3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {technique === 'iterative' ? 'Iterative' : 'Recursive'} · removeElements.js
                </span>
              </div>
              <div style={{ padding: '14px 18px', fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.9 }}>
                {code.map((text, index) => {
                  if (!revealedLines.has(index)) return null;
                  const isActive = activeLine === index;
                  return (
                    <div key={index} className="mpr-line-in" style={{
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
                  ? (isAr ? `خلّصنا كل الـ ${steps.length} خطوة!` : `All ${steps.length} steps complete!`)
                  : (isAr ? `خطوة ${stepIdx[technique] + 1} من ${steps.length}` : `Step ${stepIdx[technique] + 1} of ${steps.length}`)}
              </div>
              <div style={{ height: 8, width: 120, background: 'rgba(165,94,234,0.1)', borderRadius: 100, overflow: 'hidden', border: '2px solid rgba(165,94,234,0.12)' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--secondary), var(--easy))', borderRadius: 100, width: `${Math.round((stepIdx[technique] / steps.length) * 100)}%`, transition: 'width 0.4s' }} />
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
                    <ArrowMarker id="mpr-ah" color="#B2BEC3" />
                    <ArrowMarker id="mpr-ah-skip" color="#FF5252" />
                    <ArrowMarker id="mpr-ah-drag" color="#FECA57" />
                  </defs>

                  {/* always-live "null" drop target — every step that ends at null (nxt/curr/prev.next
                      going off the end of the list) drops here, regardless of visual state elsewhere */}
                  <g onPointerUp={(e) => handlePointerUp(e, 'null')} data-drop-id="null">
                    <rect x={nodeX(SLOTS.length - 1) + 66} y="130" width="46" height="52" fill="transparent" style={{ cursor: 'default' }} />
                    <text x={nodeX(SLOTS.length - 1) + 89} y="156" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="18" fill="#B2BEC3">∅</text>
                  </g>

                  {/* arrows — straight for adjacent links, curved skip for a bypass, stub for null */}
                  {SLOTS.map((slotKey, i) => {
                    const target = pts[slotKey];
                    if (target === undefined) return null;
                    if (target === 'null') {
                      const x1 = nodeX(i) + 26;
                      return (
                        <g key={`n-${slotKey}`}>
                          <path d={`M ${x1} 182 L ${x1} 213`} stroke="#B2BEC3" strokeWidth="2.5" strokeDasharray="4 3" fill="none" markerEnd="url(#mpr-ah)" />
                          <text x={x1} y="227" textAnchor="middle" fontSize="11" fontWeight="900" fill="#B2BEC3" fontFamily="var(--mono)">null</text>
                        </g>
                      );
                    }
                    const targetPos = posOf(target);
                    if (targetPos === i + 1) {
                      return <line key={`a-${slotKey}`} x1={nodeX(i) + 52} y1="156" x2={nodeX(i + 1)} y2="156" stroke="#B2BEC3" strokeWidth="3" markerEnd="url(#mpr-ah)" style={{ transition: 'all 0.5s' }} />;
                    }
                    if (targetPos > i + 1) {
                      const x1 = nodeX(i) + 26, x2 = nodeX(targetPos) + 26, midX = (x1 + x2) / 2;
                      return <path key={`s-${slotKey}`} d={`M ${x1} 182 Q ${midX} 237 ${x2} 182`} stroke="#FF5252" strokeWidth="3" strokeDasharray="7,5" fill="none" markerEnd="url(#mpr-ah-skip)" style={{ transition: 'all 0.5s' }} />;
                    }
                    return null;
                  })}

                  {/* dummy node */}
                  <g transform={`translate(${nodeX(0)},130)`}>
                    <rect x="0" y="0" width="52" height="52" rx="18" fill="#F3ECFF" stroke="var(--secondary)" strokeWidth="3" strokeDasharray="5,3"
                      onPointerUp={(e) => handlePointerUp(e, 'dummy')} data-drop-id="dummy" style={{ cursor: 'default' }} />
                    <text x="26" y="26" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="10" fill="var(--secondary)" style={{ pointerEvents: 'none' }}>dummy</text>
                    {canDrag('dummy') && (
                      <circle cx="52" cy="26" r="8" fill="var(--primary)" stroke="#FFF" strokeWidth="2"
                        onPointerDown={(e) => handlePointerDown(e, 'dummy')}
                        style={{ cursor: 'grab', touchAction: 'none', filter: 'drop-shadow(0 0 4px rgba(255,159,67,0.6))' }} />
                    )}
                  </g>

                  {/* data nodes */}
                  {NODE_IDS.map((nodeId, idx) => {
                    const i = idx + 1; // slot position (0 = dummy)
                    const value = VALUES[idx];
                    const isRemoved = removedSet.has(nodeId);
                    const isJustRemoved = nodeId === justRemovedId;
                    const isActive = technique === 'iterative'
                      ? pts.curr === nodeId
                      : pts.head === nodeId;
                    const draggableHere = canDrag(nodeId);
                    return (
                      <g key={nodeId} transform={`translate(${nodeX(i)},130)`} style={{ transition: 'opacity 0.5s' }} opacity={isRemoved && !isJustRemoved ? 0.35 : 1}>
                        <rect x="0" y="0" width="52" height="52" rx="18"
                          onPointerUp={(e) => handlePointerUp(e, nodeId)} data-drop-id={nodeId}
                          fill={isJustRemoved ? '#FFE3E3' : (isActive && !isRemoved ? '#FFF3CD' : '#FFF')}
                          stroke={isJustRemoved ? '#FF5252' : (isActive && !isRemoved ? '#FECA57' : 'var(--line-heavy)')}
                          strokeWidth={isJustRemoved || (isActive && !isRemoved) ? 4 : 3} style={{ cursor: 'default' }} />
                        <text x="26" y="26" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="20" fill={isRemoved && !isJustRemoved ? 'var(--ink-3)' : 'var(--ink)'} style={{ pointerEvents: 'none', textDecoration: isRemoved && !isJustRemoved ? 'line-through' : 'none' }}>
                          {value}
                        </text>
                        {isJustRemoved && (
                          <g className="mpr-just-removed" style={{ transformOrigin: '48px 4px' }}>
                            <circle cx="48" cy="4" r="11" fill="#FF5252" stroke="#FFF" strokeWidth="2" />
                            <text x="48" y="5" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="900" fill="#FFF">🗑️</text>
                          </g>
                        )}
                        {draggableHere && (
                          <circle cx="52" cy="26" r="8" fill="var(--primary)" stroke="#FFF" strokeWidth="2"
                            onPointerDown={(e) => handlePointerDown(e, nodeId)}
                            style={{ cursor: 'grab', touchAction: 'none', filter: 'drop-shadow(0 0 4px rgba(255,159,67,0.6))' }} />
                        )}
                      </g>
                    );
                  })}

                  {/* Scope Variables — floating badges above their current target */}
                  {varList.map((varName) => {
                    const { cx, hasTarget, targetPos } = varInfo(varName);
                    const varX = cx - 28;
                    return (
                      <ScopeVariableBadge key={varName}
                        x={varX} label={varName}
                        color={VAR_COLORS[varName]} textColor={VAR_TEXT_COLORS[varName]}
                        hasTarget={hasTarget} targetX={nodeCx(targetPos) - varX}
                        draggable={canDrag(varName)} onDragStart={(e) => handlePointerDown(e, varName)}
                        markerId="mpr-ah" />
                    );
                  })}

                  {dragging && (() => {
                    const origin = dragOrigin(dragging.from);
                    if (!origin) return null;
                    return <line x1={origin.x} y1={origin.y} x2={mousePos.x} y2={mousePos.y} stroke="#FECA57" strokeWidth="2.5" strokeDasharray="6,5" markerEnd="url(#mpr-ah-drag)" style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 4px rgba(254,202,87,0.6))' }} />;
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
