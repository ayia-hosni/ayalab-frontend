// @ts-nocheck
import React, { useState, useRef } from 'react';
import { RotateCcw, CheckCircle, XCircle, Sparkles, MousePointer2 } from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────────────────

const N = 5;
const VALUES = [1, 2, 3, 4, 5];
const DATA_NODES = ['1', '2', '3', '4', '5'];

const INITIAL_ITERATIVE = {
  head: 'null', prev: 'null', curr: 'null', next: 'null',
  '1': '2', '2': '3', '3': '4', '4': '5', '5': 'null',
};

const INITIAL_RECURSIVE = {
  head: 'null', p: 'null',
  '1': '2', '2': '3', '3': '4', '4': '5', '5': 'null',
};

// Reuses the exact guided sequence from Pointer Sandbox — one drag per code line.
// head/curr start unattached ("far away") — the player drags them onto node 1 themselves
// before the reversal steps begin, instead of the game pre-wiring them.
const ITERATIVE_STEPS = [
  { from: 'head', to: '1',    code: 'head param',        desc: "head is the given list head — place it on node 1." },
  { from: 'curr', to: '1',    code: 'curr = head',       desc: "Start curr at head, ready to walk the list." },
  { from: 'next', to: '2',    code: 'next = curr.next',  desc: "Save curr's next before breaking the link." },
  { from: '1',    to: 'null', code: 'curr.next = prev',  desc: "Reverse: node 1 now points back to null." },
  { from: 'prev', to: '1',    code: 'prev = curr',       desc: "Step prev forward to node 1." },
  { from: 'curr', to: '2',    code: 'curr = next',       desc: "Step curr forward to node 2." },
  { from: 'next', to: '3',    code: 'next = curr.next',  desc: "Save curr's next before breaking the link." },
  { from: '2',    to: '1',    code: 'curr.next = prev',  desc: "Reverse: node 2 now points to node 1." },
  { from: 'prev', to: '2',    code: 'prev = curr',       desc: "Step prev forward to node 2." },
  { from: 'curr', to: '3',    code: 'curr = next',       desc: "Step curr forward to node 3." },
  { from: 'next', to: '4',    code: 'next = curr.next',  desc: "Save curr's next before breaking the link." },
  { from: '3',    to: '2',    code: 'curr.next = prev',  desc: "Reverse: node 3 now points to node 2." },
  { from: 'prev', to: '3',    code: 'prev = curr',       desc: "Step prev forward to node 3." },
  { from: 'curr', to: '4',    code: 'curr = next',       desc: "Step curr forward to node 4." },
  { from: 'next', to: '5',    code: 'next = curr.next',  desc: "Save curr's next before breaking the link." },
  { from: '4',    to: '3',    code: 'curr.next = prev',  desc: "Reverse: node 4 now points to node 3." },
  { from: 'prev', to: '4',    code: 'prev = curr',       desc: "Step prev forward to node 4." },
  { from: 'curr', to: '5',    code: 'curr = next',       desc: "Step curr forward to node 5." },
  { from: 'next', to: 'null', code: 'next = curr.next',  desc: "curr.next is null — end of list." },
  { from: '5',    to: '4',    code: 'curr.next = prev',  desc: "Reverse: node 5 now points to node 4." },
  { from: 'prev', to: '5',    code: 'prev = curr',       desc: "Step prev to node 5 — the new head!" },
  { from: 'curr', to: 'null', code: 'curr = next',       desc: "curr = null — the loop exits!" },
  { from: 'head', to: '5',    code: 'return prev',       desc: "Set head = prev. The list is reversed!" },
];

const RECURSIVE_STEPS = [
  { from: 'head', to: '1',    code: 'head param',       desc: "head is the given list head — place it on node 1 to begin the dive." },
  { from: 'p',    to: '5',    code: 'base case',        desc: "Deepest call. p points to node 5 (new head)." },
  { from: '5',    to: '4',    code: 'head.next.next = head', desc: "node5.next = node4 — reverse the link." },
  { from: '4',    to: 'null', code: 'head.next = null',      desc: "node4.next = null — break the old forward link." },
  { from: '4',    to: '3',    code: 'head.next.next = head', desc: "node4.next = node3 — reverse the link." },
  { from: '3',    to: 'null', code: 'head.next = null',      desc: "node3.next = null — break the old forward link." },
  { from: '3',    to: '2',    code: 'head.next.next = head', desc: "node3.next = node2 — reverse the link." },
  { from: '2',    to: 'null', code: 'head.next = null',      desc: "node2.next = null — break the old forward link." },
  { from: '2',    to: '1',    code: 'head.next.next = head', desc: "node2.next = node1 — reverse the link." },
  { from: '1',    to: 'null', code: 'head.next = null',      desc: "node1.next = null — break the old forward link." },
  { from: 'head', to: '5',    code: 'return p',              desc: "Return p as the new head — reversal complete!" },
];

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
const ITER_LINE_FOR = { 'head param': 0, 'curr = head': 2, 'next = curr.next': 4, 'curr.next = prev': 5, 'prev = curr': 6, 'curr = next': 7, 'return prev': 9 };
const ITER_PRELUDE = [1, 3];
const ITER_EPILOGUE = [8, 10];

const REC_CODE = [
  'function reverseList(head) {',
  '  if (!head?.next) return head;',
  '  let p = reverseList(head.next);',
  '  head.next.next = head;',
  '  head.next = null;',
  '  return p;',
  '}',
];
const REC_LINE_FOR = { 'head param': 0, 'base case': 1, 'head.next.next = head': 3, 'head.next = null': 4, 'return p': 5 };
const REC_PRELUDE = [1, 2];
const REC_EPILOGUE = [6];

const CONFIG = {
  iterative: { initial: INITIAL_ITERATIVE, steps: ITERATIVE_STEPS, code: ITER_CODE, lineFor: ITER_LINE_FOR, prelude: ITER_PRELUDE, epilogue: ITER_EPILOGUE, preludeAfter: 2 },
  recursive: { initial: INITIAL_RECURSIVE, steps: RECURSIVE_STEPS, code: REC_CODE, lineFor: REC_LINE_FOR, prelude: REC_PRELUDE, epilogue: REC_EPILOGUE, preludeAfter: 2 },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const idxOf = (v) => (v === 'null' || v === null || v === undefined) ? null : Number(v) - 1;

// Live pointers → a 0-based links map, so we can reuse the same chain-reorder logic as Both Solutions.
function pointersToLinks(pointers) {
  const links = {};
  DATA_NODES.forEach((node, i) => { links[i] = pointers[node] === 'null' ? 'null' : idxOf(pointers[node]); });
  return links;
}

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

const VAR_COLORS      = { head: '#8B95A6', prev: '#FF5252', curr: '#00D2D3', next: '#FECA57', p: 'var(--secondary)' };
const VAR_TEXT_COLORS = { head: '#FFF',    prev: '#FFF',    curr: '#FFF',    next: '#7A5000',  p: '#FFF' };

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function MovePointer() {
  const [technique, setTechnique] = useState('iterative');
  const [pointers, setPointers] = useState({ iterative: { ...INITIAL_ITERATIVE }, recursive: { ...INITIAL_RECURSIVE } });
  const [stepIdx, setStepIdx] = useState({ iterative: 0, recursive: 0 });
  const [lastStep, setLastStep] = useState({ iterative: null, recursive: null });
  const [dragging, setDragging] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });
  const svgRef = useRef(null);

  const { initial, steps, code, lineFor, prelude, epilogue, preludeAfter } = CONFIG[technique];
  const pts = pointers[technique];
  const completedCount = stepIdx[technique];
  const currentHint = steps[completedCount] ?? null;
  const isComplete = currentHint === null;
  const activeLine = lastStep[technique] ? lineFor[lastStep[technique].code] : null;

  // The code panel starts empty (just the signature) and is typed in line-by-line as
  // each drag is answered correctly — so the panel reflects only what's been "solved" so far.
  const revealedLines = new Set([0]);
  if (completedCount >= preludeAfter) prelude.forEach(l => revealedLines.add(l));
  for (let i = 0; i < completedCount; i++) revealedLines.add(lineFor[steps[i].code]);
  if (isComplete) epilogue.forEach(l => revealedLines.add(l));

  const links = pointersToLinks(pts);
  // Right after the flip (curr.next = prev) but before `prev` catches up to `curr`, prev is
  // stale — following it first "claims" the node curr just flipped onto, cutting curr's walk
  // short and leaving the display one step behind the reversal that already happened. In that
  // exact window curr's own backward walk already covers everything prev would, so start there.
  const justFlipped = lastStep[technique]?.code === 'curr.next = prev';
  const startHints = technique === 'iterative'
    ? (justFlipped ? [idxOf(pts.curr), idxOf(pts.prev)] : [idxOf(pts.prev), idxOf(pts.curr)])
    : [N - 1, 0];
  const chain = displayChain(links, startHints);
  const arrowExists = (displayIdx) => displayIdx < chain.length - 1 && links[chain[displayIdx]] === chain[displayIdx + 1];

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
      flashFeedback('success', 'Correct!');
    } else {
      flashFeedback('error', 'Not quite — try again.');
    }
    setDragging(null);
  };

  const handleGlobalPointerUp = () => { if (dragging) setDragging(null); };

  const switchTechnique = (t) => { setTechnique(t); setDragging(null); setFeedback({ show: false, message: '', type: '' }); };

  const handleReset = () => {
    setPointers(prev => ({ ...prev, [technique]: { ...CONFIG[technique].initial } }));
    setStepIdx(prev => ({ ...prev, [technique]: 0 }));
    setLastStep(prev => ({ ...prev, [technique]: null }));
    setDragging(null);
    setFeedback({ show: false, message: '', type: '' });
  };

  // A pointer badge floats directly above whatever node it currently targets, sliding there
  // as its value changes — falling back to a fixed "home" slot only while its value is null
  // (so it still always has somewhere to render/grab from). Badges sharing a target fan out
  // side by side instead of overlapping. Positions are then resolved as one group so a parked
  // home-slot badge can never end up coincidentally stacked on a badge that's tracking a node
  // (e.g. a fixed home slot can drift into the same x range as the rightmost tracked node).
  const varList = technique === 'iterative' ? ['head', 'prev', 'curr', 'next'] : ['head', 'p'];
  const varPositions = (() => {
    const raw = varList.map((varName, varIdx) => {
      const value = pts[varName];
      const targetPos = value === 'null' ? null : chain.indexOf(idxOf(value));
      const hasTarget = targetPos !== null && targetPos !== -1;
      if (!hasTarget) return { name: varName, cx: 40 + varIdx * 130 + 28, targetPos: null, hasTarget: false };
      const group = varList.filter(v => {
        const val = pts[v];
        if (val === 'null') return false;
        return chain.indexOf(idxOf(val)) === targetPos;
      });
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

  // Draggable-dot position for a variable flag or a data node (used for both drag-start and the live drag line).
  const dragOrigin = (nodeId) => {
    const varIdx = varList.indexOf(nodeId);
    if (varIdx !== -1) {
      return { x: varInfo(nodeId).cx, y: 50 };
    }
    const i = idxOf(nodeId);
    const pos = chain.indexOf(i);
    if (pos === -1) return null;
    return { x: nodeX(pos) + 52, y: 156 };
  };

  return (
    <div style={{ fontFamily: 'var(--sans)', color: 'var(--ink)', padding: '24px 24px 48px', userSelect: 'none', WebkitUserSelect: 'none' }}
      onPointerMove={handlePointerMove} onPointerUp={handleGlobalPointerUp} onMouseLeave={handleGlobalPointerUp}>
      <div style={{ maxWidth: 1150, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF7F0 0%, #FFF0FF 55%, #F0F4FF 100%)',
          borderRadius: 32, border: '4px solid #FFF', boxShadow: '0 8px 0 var(--shadow-color)',
          padding: '16px 24px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🖱️</span> Move the Pointer
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
              Drag the highlighted pointer yourself — the code lights up once you get it right
            </p>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 0, background: '#F1F2F6', borderRadius: 100, padding: 3, border: '2px solid var(--line)' }}>
              {['iterative', 'recursive'].map(t => (
                <button key={t} onClick={() => switchTechnique(t)} className="mp-btn-press" style={{
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
            <button onClick={handleReset} className="mp-btn-press" style={{
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
          .mp-btn-press:active { transform: translateY(2px) !important; }
          @keyframes mp-line-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
          .mp-line-in { animation: mp-line-in 0.35s ease; }
        `}</style>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,3fr)', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT: CODE + HINT ────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>

            <div style={{ background: '#2D3436', borderRadius: 20, overflow: 'hidden', border: '4px solid #1E2528', boxShadow: '0 6px 0 rgba(0,0,0,0.12)' }}>
              <div style={{ background: '#232A2D', padding: '8px 16px', borderBottom: '2px solid #1E2528' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#B2BEC3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {technique === 'iterative' ? 'Iterative' : 'Recursive'} · reverseList.js
                </span>
              </div>
              <div style={{ padding: '14px 18px', fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.9 }}>
                {code.map((text, index) => {
                  if (!revealedLines.has(index)) return null;
                  const isActive = activeLine === index;
                  return (
                    <div key={index} className="mp-line-in" style={{
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
                    List fully reversed: 5 → 4 → 3 → 2 → 1 → null
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
                    <span style={{ background: currentHint.to === 'null' ? '#FF6B6B' : 'var(--easy)', color: '#FFF', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 900, padding: '3px 10px', borderRadius: 8 }}>
                      {currentHint.to}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                    {currentHint.desc}
                  </p>
                </>
              )}

              {/* feedback toast */}
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
                {isComplete ? `All ${steps.length} steps complete!` : `Step ${stepIdx[technique] + 1} of ${steps.length}`}
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
              <div style={{ position: 'absolute', top: 14, left: 20, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'rgba(165,94,234,0.55)' }}>
                Scope Variables
              </div>
              <div style={{ overflowX: 'auto' }}>
                <svg ref={svgRef} width={Math.max(N, chain.length) * 110 + 80} height="260" style={{ display: 'block', margin: '0 auto' }}>
                  <defs>
                    <marker id="mp-ah" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#B2BEC3" /></marker>
                    <marker id="mp-ah-drag" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#FECA57" /></marker>
                  </defs>

                  {/* null endpoints — also valid drop targets */}
                  <g onPointerUp={(e) => handlePointerUp(e, 'null')}>
                    <rect x="0" y="130" width="40" height="52" fill="transparent" />
                    <text x="20" y="156" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="16" fill="#B2BEC3">∅</text>
                  </g>
                  <g onPointerUp={(e) => handlePointerUp(e, 'null')}>
                    <rect x={nodeX(chain.length - 1) + 58} y="130" width="40" height="52" fill="transparent" />
                    <text x={nodeX(chain.length - 1) + 78} y="156" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="16" fill="#B2BEC3">∅</text>
                  </g>

                  {chain.map((origIdx, i) => arrowExists(i) && (
                    <line key={`a-${origIdx}`} x1={nodeX(i) + 52} y1="156" x2={nodeX(i + 1)} y2="156" stroke="#B2BEC3" strokeWidth="3" markerEnd="url(#mp-ah)" style={{ transition: 'all 0.5s' }} />
                  ))}

                  {/* Explicit flip arrow for the move just made — a long jump can land behind other
                      nodes in the reordered chain, so spell it out rather than rely on adjacency. */}
                  {lastStep[technique]?.code === 'curr.next = prev' && (() => {
                    const s = lastStep[technique];
                    const fromPos = chain.indexOf(idxOf(s.from));
                    if (fromPos === -1) return null;
                    const x1 = nodeX(fromPos) + 26;
                    const toPos = s.to !== 'null' ? chain.indexOf(idxOf(s.to)) : -1;
                    if (toPos !== -1) {
                      const x2 = nodeX(toPos) + 26;
                      const midX = (x1 + x2) / 2;
                      return <path d={`M ${x1} 182 Q ${midX} 237 ${x2} 182`} stroke="#FF5252" strokeWidth="3" strokeDasharray="7,5" fill="none" markerEnd="url(#mp-ah)" style={{ transition: 'all 0.5s' }} />;
                    }
                    return (
                      <g>
                        <path d={`M ${x1} 182 L ${x1} 213`} stroke="#FF5252" strokeWidth="3" strokeDasharray="4 3" fill="none" markerEnd="url(#mp-ah)" />
                        <text x={x1} y="227" textAnchor="middle" fontSize="12" fontWeight="900" fill="#FF5252" fontFamily="var(--mono)">null</text>
                      </g>
                    );
                  })()}

                  {chain.map((origIdx, i) => {
                    const value = VALUES[origIdx];
                    const isActive = idxOf(pts.curr) === origIdx || (technique === 'recursive' && String(value) === currentHint?.from);
                    const draggableHere = canDrag(String(value));
                    return (
                      <g key={origIdx} style={{ transition: 'transform 0.5s' }} transform={`translate(${nodeX(i)},130)`}>
                        <rect x="0" y="0" width="52" height="52" rx="18"
                          onPointerUp={(e) => handlePointerUp(e, String(value))}
                          fill={isActive ? '#FFF3CD' : '#FFF'} stroke={isActive ? '#FECA57' : 'var(--line-heavy)'}
                          strokeWidth={isActive ? 4 : 3} style={{ cursor: 'default' }} />
                        <text x="26" y="26" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="20" fill="var(--ink)" style={{ pointerEvents: 'none' }}>
                          {value}
                        </text>
                        {draggableHere && (
                          <circle cx="52" cy="26" r="8" fill="var(--primary)" stroke="#FFF" strokeWidth="2"
                            onPointerDown={(e) => handlePointerDown(e, String(value))}
                            style={{ cursor: 'grab', filter: 'drop-shadow(0 0 4px rgba(255,159,67,0.6))' }} />
                        )}
                      </g>
                    );
                  })}

                  {/* Scope Variables — each badge floats above its current target and slides there
                      as the pointer moves, falling back to a fixed home slot only while null. */}
                  {varList.map((varName) => {
                    const { cx, hasTarget, targetPos } = varInfo(varName);
                    const varX = cx - 28;
                    const draggableHere = canDrag(varName);
                    return (
                      <g key={varName} style={{ transition: 'transform 0.5s' }} transform={`translate(${varX},0)`}>
                        {hasTarget ? (
                          <line x1="28" y1="42" x2={nodeCx(targetPos) - varX} y2="130"
                            stroke={VAR_COLORS[varName]} strokeWidth="2.5" markerEnd="url(#mp-ah)" style={{ transition: 'all 0.5s' }} />
                        ) : (
                          <g>
                            <path d="M 28 42 L 28 70" stroke={VAR_COLORS[varName]} strokeWidth="2.5" strokeDasharray="4 3" fill="none" markerEnd="url(#mp-ah)" />
                            <text x="28" y="84" textAnchor="middle" fontSize="11" fontWeight="900" fill={VAR_COLORS[varName]} fontFamily="var(--mono)">null</text>
                          </g>
                        )}
                        <rect x="0" y="20" width="56" height="22" rx="8" fill={VAR_COLORS[varName]} />
                        <text x="28" y="35" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="13" fill={VAR_TEXT_COLORS[varName]} style={{ pointerEvents: 'none' }}>{varName}</text>
                        {draggableHere && (
                          <circle cx="28" cy="50" r="9" fill="#FECA57" stroke="#FFF" strokeWidth="2"
                            onPointerDown={(e) => handlePointerDown(e, varName)}
                            style={{ cursor: 'grab', filter: 'drop-shadow(0 0 5px rgba(254,202,87,0.7))' }} />
                        )}
                      </g>
                    );
                  })}

                  {/* live drag line following the cursor */}
                  {dragging && (() => {
                    const origin = dragOrigin(dragging.from);
                    if (!origin) return null;
                    return <line x1={origin.x} y1={origin.y} x2={mousePos.x} y2={mousePos.y} stroke="#FECA57" strokeWidth="2.5" strokeDasharray="6,5" markerEnd="url(#mp-ah-drag)" style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 4px rgba(254,202,87,0.6))' }} />;
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
