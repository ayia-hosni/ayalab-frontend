// @ts-nocheck
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PALETTE, POINTER_COLORS, POINTER_TEXT_COLORS } from './pointer-colors';
import { ArrowMarker, PointerBadge } from './game-ui';

// ─── DATA ────────────────────────────────────────────────────────────────────
// Same worked example as the other two tabs: a duplicate value at the head, in
// the middle, and at the tail.

const N = 6;
const VAL = 6;
const VALUES = [6, 1, 2, 6, 3, 6];
const NODE_IDS = ['idx0', 'idx1', 'idx2', 'idx3', 'idx4', 'idx5'];
const SLOTS = ['dummy', ...NODE_IDS];
const valueOf = (nodeId) => VALUES[NODE_IDS.indexOf(nodeId)];
const labelOf = (nodeId) => (nodeId === 'null' || nodeId == null) ? 'null' : `node ${valueOf(nodeId)}`;
const labelOfAr = (nodeId) => (nodeId === 'null' || nodeId == null) ? 'null' : `عقدة ${valueOf(nodeId)}`;

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

const REC_CODE = [
  'function removeElements(head, val) {',
  '  if (head === null) return null;',
  '  head.next = removeElements(head.next, val);',
  '  return head.val === val ? head.next : head;',
  '}',
];

const ITER_BADGE_INFO = {
  init:    { icon: '🎯', label: 'Initialize',     labelAr: 'ابدئي',          color: 'var(--secondary)' },
  inspect: { icon: '🔍', label: 'Compare',         labelAr: 'قارني',          color: 'var(--primary)'  },
  remove:  { icon: '🗑️', label: 'Remove node',     labelAr: 'امسحي العقدة',   color: '#FF5252'         },
  keep:    { icon: '✅', label: 'Keep node',       labelAr: 'احتفظي بالعقدة', color: 'var(--easy)'     },
  advance: { icon: '➡️', label: 'Slide forward',   labelAr: 'اتقدمي',         color: '#D49B1C'         },
  done:    { icon: '🏁', label: 'Return new head', labelAr: 'رجّعي الرأس الجديد', color: 'var(--secondary)' },
};

const REC_BADGE_INFO = {
  base:   { icon: '🎯', label: 'Base case',       labelAr: 'الحالة الأساسية',   color: 'var(--secondary)' },
  rewire: { icon: '🔗', label: 'Link to below',   labelAr: 'وصّلي باللي تحت',   color: 'var(--primary)'  },
  remove: { icon: '🗑️', label: 'Remove node',     labelAr: 'امسحي العقدة',      color: '#FF5252'          },
  keep:   { icon: '✅', label: 'Keep node',       labelAr: 'احتفظي بالعقدة',    color: 'var(--easy)'      },
  done:   { icon: '🏁', label: 'Return new head', labelAr: 'رجّعي الرأس الجديد', color: 'var(--secondary)' },
};

// Every intermediate state gets its own slide — computed by actually running the
// algorithm once, over a fixed physical layout (removal never reorders nodes).
function buildIterativeStates() {
  const links = { dummy: 'idx0', idx0: 'idx1', idx1: 'idx2', idx2: 'idx3', idx3: 'idx4', idx4: 'idx5', idx5: 'null' };
  const states = [];
  states.push({ line: 3, badge: 'init', iter: 0, prev: 'dummy', curr: 'idx0', nxt: null, links: { ...links }, removed: [],
    msg: 'Initialize: dummy.next = head; prev = dummy, curr = head (node 6).',
    msgAr: 'ابدئي: dummy.next = head؛ prev = dummy، curr = head (عقدة 6).' });

  let prev = 'dummy', curr = 'idx0', iter = 0, removed = [];
  while (curr !== 'null') {
    iter++;
    const nxt = links[curr];
    const val = valueOf(curr);
    states.push({ line: 5, badge: 'inspect', iter, prev, curr, nxt, links: { ...links }, removed: [...removed],
      msg: `Save curr.next: nxt = ${labelOf(nxt)}. Is curr.val (${val}) the target value (${VAL})?`,
      msgAr: `احفظي curr.next: nxt = ${labelOfAr(nxt)}. هل curr.val (${val}) بتساوي القيمة المطلوبة (${VAL})؟` });

    if (val === VAL) {
      links[prev] = nxt;
      removed = [...removed, curr];
      states.push({ line: 7, badge: 'remove', iter, prev, curr, nxt, links: { ...links }, removed: [...removed],
        msg: `node ${val} matches — remove it: ${prev === 'dummy' ? 'dummy' : `node ${valueOf(prev)}`}.next now points to ${labelOf(nxt)}.`,
        msgAr: `عقدة ${val} بتساوي القيمة — امسحيها: ${prev === 'dummy' ? 'dummy' : `عقدة ${valueOf(prev)}`}.next بقى يشاور على ${labelOfAr(nxt)}.` });
    } else {
      prev = curr;
      states.push({ line: 9, badge: 'keep', iter, prev, curr, nxt, links: { ...links }, removed: [...removed],
        msg: `node ${val} doesn't match — keep it: prev advances to node ${val}.`,
        msgAr: `عقدة ${val} مش بتساوي القيمة — احتفظي بيها: prev تتقدم لعقدة ${val}.` });
    }

    curr = nxt;
    states.push({ line: 11, badge: 'advance', iter, prev, curr, nxt, links: { ...links }, removed: [...removed],
      msg: curr === 'null' ? 'curr becomes null — the loop ends!' : `curr steps forward to ${labelOf(curr)}.`,
      msgAr: curr === 'null' ? 'curr بقت null — الحلقة بتخرج!' : `curr بتتقدم لـ ${labelOfAr(curr)}.` });
  }

  states.push({ line: 13, badge: 'done', iter: 0, prev, curr: 'null', nxt: null, links: { ...links }, removed: [...removed],
    msg: `Return dummy.next — ${labelOf(links.dummy)} is the final head.`,
    msgAr: `رجّعي dummy.next — ${labelOfAr(links.dummy)} هو الرأس النهائي.` });
  return states;
}

// Recursion dives to the base case instantly; only the unwind (where the
// remove/keep decisions actually happen) gets its own slide.
function buildRecursiveStates() {
  const states = [];
  states.push({ line: 1, badge: 'base', frame: N, headIdx: null, result: 'null', links: {}, removed: [],
    msg: 'Base case: head is null — this frame returns null.',
    msgAr: 'الحالة الأساسية: head بقت null — الفريم ده بيرجع null.' });

  let result = 'null';
  let removed = [];
  const links = {};
  for (let i = N - 1; i >= 0; i--) {
    const nodeId = NODE_IDS[i];
    const val = VALUES[i];
    links[nodeId] = result;
    states.push({ line: 2, badge: 'rewire', frame: i + 1, headIdx: i, result, links: { ...links }, removed: [...removed],
      msg: `node ${val} (frame ${i + 1}): wire its link to whatever the frame below returned (${labelOf(result)}).`,
      msgAr: `عقدة ${val} (فريم ${i + 1}): وصّلي اللينك بتاعها بأي حاجة الفريم اللي تحت رجّعها (${labelOfAr(result)}).` });

    if (val === VAL) {
      removed = [...removed, nodeId];
      states.push({ line: 3, badge: 'remove', frame: i + 1, headIdx: i, result, links: { ...links }, removed: [...removed],
        msg: `node ${val} (frame ${i + 1}): matches val — this frame returns head.next (${labelOf(result)}), dropping node ${val}.`,
        msgAr: `عقدة ${val} (فريم ${i + 1}): بتساوي القيمة — الفريم ده بيرجع head.next (${labelOfAr(result)})، وعقدة ${val} بتتشال.` });
    } else {
      result = nodeId;
      states.push({ line: 3, badge: 'keep', frame: i + 1, headIdx: i, result, links: { ...links }, removed: [...removed],
        msg: `node ${val} (frame ${i + 1}): doesn't match — this frame returns head itself, now linked to ${labelOf(links[nodeId])}.`,
        msgAr: `عقدة ${val} (فريم ${i + 1}): مش بتساوي القيمة — الفريم ده بيرجع head نفسها، بقت متوصّلة بـ ${labelOfAr(links[nodeId])}.` });
    }
  }

  states.push({ line: 3, badge: 'done', frame: 0, headIdx: null, result, links: { ...links }, removed: [...removed],
    msg: `Recursion fully unwound — ${labelOf(result)} is the final head.`,
    msgAr: `الاستدعاء الذاتي اتفكّ بالكامل — ${labelOfAr(result)} هو الرأس النهائي.` });
  return states;
}

const ITER_SLIDES = buildIterativeStates();
const REC_SLIDES = buildRecursiveStates();

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const nodeX = (i) => 40 + i * 110;
const nodeCx = (i) => nodeX(i) + 26;
const posOf = (key) => (key === 'null' || key === null || key === undefined) ? null : SLOTS.indexOf(key);

const UI_TEXT = {
  title: { en: 'Both Solutions', ar: 'الحلّين مع بعض' },
  subtitle: { en: 'A short walk through the iterative and recursive approaches', ar: 'جولة سريعة على الأسلوبين: التكراري والعودي' },
  iterative: { en: 'iterative', ar: 'تكراري' },
  recursive: { en: 'recursive', ar: 'عودي' },
  back: { en: '◀ Back', ar: '◀ السابق' },
  next: { en: 'Next ▶', ar: 'التالي ▶' },
  currentState: { en: 'Current State', ar: 'الحالة الحالية' },
  solvedMsg: { en: "All the 6's are gone: 1 → 2 → 3 → null", ar: 'كل الـ 6 اتمسحوا: 1 → 2 → 3 → null' },
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function SolutionSlides({ initialTechnique, onTechniqueChange, isAr } = {}) {
  const tr = (key) => (isAr ? UI_TEXT[key].ar : UI_TEXT[key].en);
  const [technique, setTechnique] = useState(initialTechnique === 'recursive' ? 'recursive' : 'iterative');
  const [slideIdx, setSlideIdx] = useState(0);

  const slides = technique === 'iterative' ? ITER_SLIDES : REC_SLIDES;
  const code = technique === 'iterative' ? ITER_CODE : REC_CODE;
  const badgeInfo = technique === 'iterative' ? ITER_BADGE_INFO : REC_BADGE_INFO;
  const state = slides[slideIdx];
  const badge = badgeInfo[state.badge];
  const isDone = state.badge === 'done';
  const isIter = technique === 'iterative';
  const removedSet = new Set(state.removed);
  // The node whose removal became visible on *this exact slide* — flashed red with
  // a trash mark for one slide before settling into the calmer grayed-out treatment,
  // so "dropping node 6" reads as something that just happened, not a static fact.
  const prevSlide = slides[slideIdx - 1];
  const prevRemovedSet = new Set(prevSlide ? prevSlide.removed : []);
  const justRemovedId = state.removed.find(id => !prevRemovedSet.has(id)) ?? null;

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
          <div dir={isAr ? 'rtl' : 'ltr'} style={{ textAlign: isAr ? 'right' : 'left' }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              {tr('title')}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
              {tr('subtitle')}
            </p>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 0, background: '#F1F2F6', borderRadius: 100, padding: 3, border: '2px solid var(--line)' }}>
            {['iterative', 'recursive'].map(techName => (
              <button key={techName} onClick={() => switchTechnique(techName)} className="ssr-btn-press" style={{
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
        </div>

        <style>{`
          .ssr-btn-press:active { transform: translateY(2px) !important; }
          @keyframes ssr-just-removed-pop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.25); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
          .ssr-just-removed { animation: ssr-just-removed-pop 0.4s ease; }
          .ssr-two-col { display: grid; grid-template-columns: minmax(0,2fr) minmax(0,3fr); gap: 20px; align-items: start; }
          @media (max-width: 900px) { .ssr-two-col { grid-template-columns: 1fr; } }
        `}</style>

        <div className="ssr-two-col">

          {/* ── LEFT: CODE + INFO ────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ background: '#2D3436', borderRadius: 20, overflow: 'hidden', border: '4px solid #1E2528', boxShadow: '0 6px 0 rgba(0,0,0,0.12)' }}>
              <div style={{ background: '#232A2D', padding: '8px 16px', borderBottom: '2px solid #1E2528' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#B2BEC3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {technique === 'iterative' ? 'Iterative' : 'Recursive'} · removeElements.js
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
                <span style={{ fontSize: 13, fontWeight: 900, color: badge.color, textTransform: isAr ? 'none' : 'uppercase', letterSpacing: '0.4px' }}>
                  {isAr ? badge.labelAr : badge.label}
                </span>
                {isIter && state.iter > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 900, color: 'var(--ink-3)', background: '#F1F2F6', padding: '3px 10px', borderRadius: 100 }}>
                    {isAr ? `تكرارة ${state.iter} من ${N}` : `Iteration ${state.iter} of ${N}`}
                  </span>
                )}
                {!isIter && state.frame > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 900, color: 'var(--ink-3)', background: '#F1F2F6', padding: '3px 10px', borderRadius: 100 }}>
                    {isAr
                      ? (state.badge === 'base' ? `فريم ${state.frame} (الأعمق)` : `فكّ فريم ${state.frame}`)
                      : (state.badge === 'base' ? `Frame ${state.frame} (deepest)` : `Unwinding frame ${state.frame}`)}
                  </span>
                )}
              </div>
              <p dir={isAr ? 'rtl' : 'ltr'} style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)', lineHeight: 1.6, textAlign: isAr ? 'right' : 'left' }}>
                {isAr ? state.msgAr : state.msg}
              </p>
              {isDone && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--easy)', fontWeight: 900, fontSize: 13 }}>
                  <Sparkles size={16} /> {tr('solvedMsg')}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: VISUALIZATION ────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--card)', padding: '10px 14px', borderRadius: 20, border: '3px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 0 var(--shadow-color)' }}>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
                {isAr ? `شريحة ${slideIdx + 1} من ${slides.length}` : `Slide ${slideIdx + 1} of ${slides.length}`}
              </div>
              <button onClick={() => setSlideIdx(i => Math.max(0, i - 1))} disabled={slideIdx === 0} className="ssr-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 14px', borderRadius: 100,
                border: '2px solid var(--line)', background: '#F8F9FA', color: 'var(--ink-2)', cursor: 'pointer',
                opacity: slideIdx === 0 ? 0.4 : 1,
              }}>{tr('back')}</button>
              <button onClick={() => setSlideIdx(i => Math.min(slides.length - 1, i + 1))} disabled={slideIdx === slides.length - 1} className="ssr-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 16px', borderRadius: 100,
                border: 'none', background: 'var(--secondary)', color: '#FFF', cursor: 'pointer',
                boxShadow: '0 3px 0 var(--secondary-shadow)',
                opacity: slideIdx === slides.length - 1 ? 0.4 : 1,
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
                    <ArrowMarker id="ssr-ah" color="#B2BEC3" />
                    <ArrowMarker id="ssr-ah-skip" color="#FF5252" />
                  </defs>

                  <text x={nodeX(SLOTS.length - 1) + 89} y="105" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="16" fill="#B2BEC3">∅</text>

                  {isIter ? SLOTS.map((slotKey, i) => {
                    const target = state.links[slotKey];
                    if (target === undefined) return null;
                    if (target === 'null') {
                      const x1 = nodeX(i) + 26;
                      return (
                        <g key={`n-${slotKey}`}>
                          <path d={`M ${x1} 137 L ${x1} 168`} stroke="#B2BEC3" strokeWidth="2.5" strokeDasharray="4 3" fill="none" markerEnd="url(#ssr-ah)" />
                          <text x={x1} y="182" textAnchor="middle" fontSize="11" fontWeight="900" fill="#B2BEC3" fontFamily="var(--mono)">null</text>
                        </g>
                      );
                    }
                    const targetPos = posOf(target);
                    if (targetPos === i + 1) {
                      return <line key={`a-${slotKey}`} x1={nodeX(i) + 52} y1="105" x2={nodeX(i + 1)} y2="105" stroke="#B2BEC3" strokeWidth="3" markerEnd="url(#ssr-ah)" style={{ transition: 'all 0.5s' }} />;
                    }
                    if (targetPos > i + 1) {
                      const x1 = nodeX(i) + 26, x2 = nodeX(targetPos) + 26, midX = (x1 + x2) / 2;
                      return <path key={`s-${slotKey}`} d={`M ${x1} 137 Q ${midX} 192 ${x2} 137`} stroke="#FF5252" strokeWidth="3" strokeDasharray="7,5" fill="none" markerEnd="url(#ssr-ah-skip)" style={{ transition: 'all 0.5s' }} />;
                    }
                    return null;
                  }) : NODE_IDS.map((nodeId, idx) => {
                    const i = idx + 1;
                    const target = state.links[nodeId];
                    if (target === undefined) return null;
                    if (target === 'null') {
                      const x1 = nodeX(i) + 26;
                      return (
                        <g key={`n-${nodeId}`}>
                          <path d={`M ${x1} 137 L ${x1} 168`} stroke="#B2BEC3" strokeWidth="2.5" strokeDasharray="4 3" fill="none" markerEnd="url(#ssr-ah)" />
                          <text x={x1} y="182" textAnchor="middle" fontSize="11" fontWeight="900" fill="#B2BEC3" fontFamily="var(--mono)">null</text>
                        </g>
                      );
                    }
                    const targetPos = posOf(target);
                    if (targetPos === i + 1) {
                      return <line key={`a-${nodeId}`} x1={nodeX(i) + 52} y1="105" x2={nodeX(i + 1)} y2="105" stroke="#B2BEC3" strokeWidth="3" markerEnd="url(#ssr-ah)" style={{ transition: 'all 0.5s' }} />;
                    }
                    const x1 = nodeX(i) + 26, x2 = nodeX(targetPos) + 26, midX = (x1 + x2) / 2;
                    return <path key={`s-${nodeId}`} d={`M ${x1} 137 Q ${midX} 192 ${x2} 137`} stroke="#FF5252" strokeWidth="3" strokeDasharray="7,5" fill="none" markerEnd="url(#ssr-ah-skip)" style={{ transition: 'all 0.5s' }} />;
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
                    const isCurr = isIter ? state.curr === nodeId : state.headIdx === idx;
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
                          <g className="ssr-just-removed" style={{ transformOrigin: '48px 4px' }}>
                            <circle cx="48" cy="4" r="11" fill="#FF5252" stroke="#FFF" strokeWidth="2" />
                            <text x="48" y="5" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="900" fill="#FFF">🗑️</text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {isIter ? (
                    <>
                      {posOf(state.prev) !== null && (
                        <PointerBadge cx={nodeCx(posOf(state.prev))} width={48} label="prev"
                          color={POINTER_COLORS.prev} textColor={POINTER_TEXT_COLORS.prev} markerId="ssr-ah" />
                      )}
                      {state.nxt != null && state.nxt !== 'null' && posOf(state.nxt) !== null && (
                        <PointerBadge cx={nodeCx(posOf(state.nxt)) + 20} width={40} label="nxt"
                          color={POINTER_COLORS.nxt} textColor={POINTER_TEXT_COLORS.nxt} markerId="ssr-ah" />
                      )}
                      {state.curr !== 'null' && posOf(state.curr) !== null && (
                        <PointerBadge cx={nodeCx(posOf(state.curr))} width={48} label="curr" side="below"
                          color={POINTER_COLORS.curr} textColor={POINTER_TEXT_COLORS.curr} markerId="ssr-ah" />
                      )}
                    </>
                  ) : (
                    <>
                      {/* head — the current frame's own parameter, i.e. which node this call is examining */}
                      {state.headIdx !== null && posOf(NODE_IDS[state.headIdx]) !== null && (
                        <PointerBadge cx={nodeCx(posOf(NODE_IDS[state.headIdx]))} width={48} label="head" side="below"
                          color={PALETTE.teal} textColor="#FFF" markerId="ssr-ah" />
                      )}
                      {/* result — the pointer this frame (or a deeper one) has returned so far */}
                      {posOf(state.result) !== null && (
                        <PointerBadge cx={nodeCx(posOf(state.result))} width={60} label="result" fontSize={12}
                          color={POINTER_COLORS.result} textColor="#FFF" markerId="ssr-ah" />
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
