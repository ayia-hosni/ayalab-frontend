// @ts-nocheck
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PALETTE } from './pointer-colors';
import { ArrowMarker, PointerBadge, NodeValueBox } from './game-ui';

// ─── DATA ────────────────────────────────────────────────────────────────────
// Same worked example as Move the Pointer: a true palindrome, odd length (N=5),
// so the middle node ends up compared against itself once the halves meet.

const N = 5;
const VALUES = [1, 2, 3, 2, 1];
const NODE_IDS = ['idx0', 'idx1', 'idx2', 'idx3', 'idx4'];
const SLOTS = [...NODE_IDS];
const valueOf = (nodeId) => VALUES[NODE_IDS.indexOf(nodeId)];
const labelOf = (nodeId) => (nodeId === 'null' || nodeId == null) ? 'null' : `node ${valueOf(nodeId)}`;
const labelOfAr = (nodeId) => (nodeId === 'null' || nodeId == null) ? 'null' : `عقدة ${valueOf(nodeId)}`;

const INITIAL_LINKS = { idx0: 'idx1', idx1: 'idx2', idx2: 'idx3', idx3: 'idx4', idx4: 'null' };

const CODE = [
  'function isPalindrome(head) {',
  '  let fast = head;',
  '  let slow = head;',
  '  while (fast !== null && fast.next !== null) {',
  '    fast = fast.next.next;',
  '    slow = slow.next;',
  '  }',
  '  let prev = null;',
  '  while (slow !== null) {',
  '    const tmp = slow.next;',
  '    slow.next = prev;',
  '    prev = slow;',
  '    slow = tmp;',
  '  }',
  '  let left = head;',
  '  let right = prev;',
  '  while (right !== null) {',
  '    if (left.val !== right.val) return false;',
  '    left = left.next;',
  '    right = right.next;',
  '  }',
  '  return true;',
  '}',
];

const BADGE_INFO = {
  findMiddle: { icon: '🐇', label: 'Find the middle',  labelAr: 'لاقي النص',        color: 'var(--secondary)' },
  reverseInit: { icon: '🔄', label: 'Start reversing', labelAr: 'ابدئي العكس',      color: 'var(--primary)'  },
  reverse:    { icon: '🔄', label: 'Reverse link',      labelAr: 'اعكسي اللينك',    color: '#FF5252'         },
  advance:    { icon: '➡️', label: 'Advance',           labelAr: 'اتقدمي',          color: '#D49B1C'         },
  compare:    { icon: '🔍', label: 'Compare',           labelAr: 'قارني',            color: 'var(--easy)'    },
  done:       { icon: '🏁', label: 'Palindrome confirmed', labelAr: 'اتأكد إنها متناظرة', color: 'var(--secondary)' },
};

// Every intermediate state gets its own slide — computed by actually running the
// algorithm once (fast/slow → reverse second half → compare), not by transcribing
// the hand-verified trace, so this stays consistent by construction.
function buildStates() {
  const links = { ...INITIAL_LINKS };
  const states = [];
  const snap = () => ({ ...links });
  const pt = (fast, slow, prev, tmp, left, right) => ({ fast, slow, prev, tmp, left, right });

  let fast = 'idx0';
  states.push({ line: 1, badge: 'findMiddle', ...pt(fast, null, null, null, null, null), links: snap(),
    msg: `fast = head — ${labelOf(fast)}.`, msgAr: `fast = head — ${labelOfAr(fast)}.` });

  let slow = 'idx0';
  states.push({ line: 2, badge: 'findMiddle', ...pt(fast, slow, null, null, null, null), links: snap(),
    msg: `slow = head — ${labelOf(slow)}. Both pointers start together; fast will move twice as fast.`,
    msgAr: `slow = head — ${labelOfAr(slow)}. البؤرتين بيبدأو مع بعض؛ fast هتتحرك ضعف سرعة slow.` });

  while (fast !== 'null' && links[fast] !== 'null') {
    fast = links[links[fast]];
    states.push({ line: 4, badge: 'findMiddle', ...pt(fast, slow, null, null, null, null), links: snap(),
      msg: `fast jumps two nodes to ${labelOf(fast)}.`, msgAr: `fast بتقفز عقدتين لـ ${labelOfAr(fast)}.` });
    slow = links[slow];
    states.push({ line: 5, badge: 'findMiddle', ...pt(fast, slow, null, null, null, null), links: snap(),
      msg: `slow steps one node to ${labelOf(slow)}.`, msgAr: `slow بتتقدم عقدة واحدة لـ ${labelOfAr(slow)}.` });
  }
  states.push({ line: 6, badge: 'findMiddle', ...pt(fast, slow, null, null, null, null), links: snap(),
    msg: `Loop exits — slow rests on ${labelOf(slow)}, the true middle of the list.`,
    msgAr: `الحلقة خلصت — slow واقفة على ${labelOfAr(slow)}، نص القائمة الحقيقي.` });

  let prev = 'null';
  states.push({ line: 7, badge: 'reverseInit', ...pt(fast, slow, prev, null, null, null), links: snap(),
    msg: 'prev starts at null — reversal of the second half begins from the middle.',
    msgAr: 'prev بتبدأ null — عكس النص التاني بيبدأ من النص.' });

  while (slow !== 'null') {
    const tmp = links[slow];
    states.push({ line: 9, badge: 'reverse', ...pt(fast, slow, prev, tmp, null, null), links: snap(),
      msg: `Save slow.next before rewiring it: tmp = ${labelOf(tmp)}.`,
      msgAr: `احفظي slow.next قبل ما نغيّرها: tmp = ${labelOfAr(tmp)}.` });

    links[slow] = prev;
    states.push({ line: 10, badge: 'reverse', ...pt(fast, slow, prev, tmp, null, null), links: snap(),
      msg: `${labelOf(slow)}'s own link now points to ${labelOf(prev)}.`,
      msgAr: `لينك ${labelOfAr(slow)} بقى يشاور على ${labelOfAr(prev)}.` });

    prev = slow;
    states.push({ line: 11, badge: 'advance', ...pt(fast, slow, prev, tmp, null, null), links: snap(),
      msg: `prev catches up to ${labelOf(prev)}.`, msgAr: `prev بتلحق بـ ${labelOfAr(prev)}.` });

    slow = tmp;
    states.push({ line: 12, badge: 'advance', ...pt(fast, slow, prev, tmp, null, null), links: snap(),
      msg: slow === 'null' ? 'slow becomes null — the reverse loop exits!' : `slow steps forward to ${labelOf(slow)}.`,
      msgAr: slow === 'null' ? 'slow بقت null — حلقة العكس بتخرج!' : `slow بتتقدم لـ ${labelOfAr(slow)}.` });
  }

  let left = 'idx0';
  states.push({ line: 14, badge: 'compare', ...pt(fast, slow, prev, null, left, null), links: snap(),
    msg: `left = head — ${labelOf(left)}. Time to compare the two halves.`,
    msgAr: `left = head — ${labelOfAr(left)}. دلوقتي نقارن النصين.` });

  let right = prev;
  states.push({ line: 15, badge: 'compare', ...pt(fast, slow, prev, null, left, right), links: snap(),
    msg: `right = prev — ${labelOf(right)}, the head of the reversed half.`,
    msgAr: `right = prev — ${labelOfAr(right)}، رأس النص المعكوس.` });

  while (right !== 'null') {
    const lv = valueOf(left), rv = valueOf(right);
    const matched = lv === rv;
    const isMiddleSelfCheck = left === right;
    states.push({ line: 17, badge: 'compare', ...pt(fast, slow, prev, null, left, right), links: snap(),
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
    states.push({ line: 18, badge: 'advance', ...pt(fast, slow, prev, null, left, right), links: snap(),
      msg: left === 'null' ? "left's node had no link left (severed during reversal) — left falls off the list." : `left advances to ${labelOf(left)}.`,
      msgAr: left === 'null' ? 'العقدة اللي كانت عليها left معهاش لينك (اتقطع وقت العكس) — left بتقع بره القائمة.' : `left بتتقدم لـ ${labelOfAr(left)}.` });

    right = links[right];
    states.push({ line: 19, badge: 'advance', ...pt(fast, slow, prev, null, left, right), links: snap(),
      msg: right === 'null' ? 'right becomes null — the loop exits!' : `right advances to ${labelOf(right)}.`,
      msgAr: right === 'null' ? 'right بقت null — الحلقة بتخرج!' : `right بتتقدم لـ ${labelOfAr(right)}.` });
  }

  states.push({ line: 21, badge: 'done', ...pt(fast, slow, prev, null, left, right), links: snap(),
    msg: "right is null — every pair matched all the way to the middle. It's a palindrome!",
    msgAr: 'right بقت null — كل الأزواج طابقت لحد النص. القائمة متناظرة (palindrome)!' });

  return states;
}

const SLIDES = buildStates();

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const nodeX = (i) => 40 + i * 110;
const nodeCx = (i) => nodeX(i) + 26;
const posOf = (key) => (key === 'null' || key === null || key === undefined) ? null : SLOTS.indexOf(key);

const UI_TEXT = {
  title: { en: 'Both Solutions', ar: 'الحلّين مع بعض' },
  subtitle: { en: 'A walk through the two-pointer + in-place reversal approach', ar: 'جولة سريعة على أسلوب البؤرتين مع عكس النص التاني' },
  back: { en: '◀ Back', ar: '◀ السابق' },
  next: { en: 'Next ▶', ar: 'التالي ▶' },
  currentState: { en: 'Current State', ar: 'الحالة الحالية' },
  solvedMsg: { en: "It's a palindrome: 1 → 2 → 3 → 2 → 1", ar: 'القائمة متناظرة: 1 → 2 → 3 → 2 → 1' },
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function SolutionSlides({ isAr } = {}) {
  const tr = (key) => (isAr ? UI_TEXT[key].ar : UI_TEXT[key].en);
  const [slideIdx, setSlideIdx] = useState(0);

  const state = SLIDES[slideIdx];
  const badge = BADGE_INFO[state.badge];
  const isDone = state.badge === 'done';

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
        </div>

        <style>{`
          .ssp-btn-press:active { transform: translateY(2px) !important; }
          .ssp-two-col { display: grid; grid-template-columns: minmax(0,2fr) minmax(0,3fr); gap: 20px; align-items: start; }
          @media (max-width: 900px) { .ssp-two-col { grid-template-columns: 1fr; } }
        `}</style>

        <div className="ssp-two-col">

          {/* ── LEFT: CODE + INFO ────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ background: '#2D3436', borderRadius: 20, overflow: 'hidden', border: '4px solid #1E2528', boxShadow: '0 6px 0 rgba(0,0,0,0.12)' }}>
              <div style={{ background: '#232A2D', padding: '8px 16px', borderBottom: '2px solid #1E2528' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#B2BEC3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  isPalindrome.js
                </span>
              </div>
              <div style={{ padding: '14px 18px', fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.9 }}>
                {CODE.map((text, index) => {
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
                {isAr ? `شريحة ${slideIdx + 1} من ${SLIDES.length}` : `Slide ${slideIdx + 1} of ${SLIDES.length}`}
              </div>
              <button onClick={() => setSlideIdx(i => Math.max(0, i - 1))} disabled={slideIdx === 0} className="ssp-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 14px', borderRadius: 100,
                border: '2px solid var(--line)', background: '#F8F9FA', color: 'var(--ink-2)', cursor: 'pointer',
                opacity: slideIdx === 0 ? 0.4 : 1,
              }}>{tr('back')}</button>
              <button onClick={() => setSlideIdx(i => Math.min(SLIDES.length - 1, i + 1))} disabled={slideIdx === SLIDES.length - 1} className="ssp-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 16px', borderRadius: 100,
                border: 'none', background: 'var(--secondary)', color: '#FFF', cursor: 'pointer',
                boxShadow: '0 3px 0 var(--secondary-shadow)',
                opacity: slideIdx === SLIDES.length - 1 ? 0.4 : 1,
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
                    <ArrowMarker id="ssp-ah" color="#B2BEC3" />
                    <ArrowMarker id="ssp-ah-back" color="#FF5252" />
                  </defs>

                  <text x={nodeX(SLOTS.length - 1) + 89} y="105" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="16" fill="#B2BEC3">∅</text>

                  {/* arrows — straight for adjacent-forward, dipping curve for skip-forward OR
                      backward (targetPos < i) — this problem introduces backward links once the
                      second half gets reversed. */}
                  {SLOTS.map((slotKey, i) => {
                    const target = state.links[slotKey];
                    if (target === undefined) return null;
                    if (target === 'null') {
                      const x1 = nodeX(i) + 26;
                      return (
                        <g key={`n-${slotKey}`}>
                          <path d={`M ${x1} 137 L ${x1} 168`} stroke="#B2BEC3" strokeWidth="2.5" strokeDasharray="4 3" fill="none" markerEnd="url(#ssp-ah)" />
                          <text x={x1} y="182" textAnchor="middle" fontSize="11" fontWeight="900" fill="#B2BEC3" fontFamily="var(--mono)">null</text>
                        </g>
                      );
                    }
                    const targetPos = posOf(target);
                    if (targetPos === i + 1) {
                      return <line key={`a-${slotKey}`} x1={nodeX(i) + 52} y1="105" x2={nodeX(i + 1)} y2="105" stroke="#B2BEC3" strokeWidth="3" markerEnd="url(#ssp-ah)" style={{ transition: 'all 0.5s' }} />;
                    }
                    if (targetPos !== i) {
                      const x1 = nodeX(i) + 26, x2 = nodeX(targetPos) + 26, midX = (x1 + x2) / 2;
                      return <path key={`s-${slotKey}`} d={`M ${x1} 137 Q ${midX} 192 ${x2} 137`} stroke="#FF5252" strokeWidth="3" strokeDasharray="7,5" fill="none" markerEnd="url(#ssp-ah-back)" style={{ transition: 'all 0.5s' }} />;
                    }
                    return null;
                  })}

                  {NODE_IDS.map((nodeId, i) => {
                    const isActive = state.slow === nodeId || state.left === nodeId || state.right === nodeId;
                    return (
                      <g key={nodeId} transform={`translate(${nodeX(i)},85)`}>
                        <NodeValueBox y={0} value={VALUES[i]} active={isActive} />
                      </g>
                    );
                  })}

                  {posOf(state.fast) !== null && (
                    <PointerBadge cx={nodeCx(posOf(state.fast)) - 30} width={48} label="fast"
                      color={PALETTE.red} textColor="#FFF" markerId="ssp-ah" />
                  )}
                  {posOf(state.slow) !== null && (
                    <PointerBadge cx={nodeCx(posOf(state.slow)) + 30} width={48} label="slow"
                      color={PALETTE.teal} textColor="#FFF" markerId="ssp-ah" />
                  )}
                  {state.prev !== null && state.prev !== 'null' && posOf(state.prev) !== null && (
                    <PointerBadge cx={nodeCx(posOf(state.prev)) - 30} width={48} label="prev" side="below"
                      color={PALETTE.yellow} textColor="#7A5000" markerId="ssp-ah" />
                  )}
                  {state.tmp !== null && state.tmp !== 'null' && posOf(state.tmp) !== null && (
                    <PointerBadge cx={nodeCx(posOf(state.tmp)) + 30} width={44} label="tmp" side="below"
                      color={PALETTE.gray} textColor="#FFF" markerId="ssp-ah" />
                  )}
                  {state.left !== null && posOf(state.left) !== null && (
                    <PointerBadge cx={nodeCx(posOf(state.left)) - 30} width={44} label="left"
                      color="var(--secondary)" textColor="#FFF" markerId="ssp-ah" />
                  )}
                  {state.right !== null && state.right !== 'null' && posOf(state.right) !== null && (
                    <PointerBadge cx={nodeCx(posOf(state.right)) + 30} width={48} label="right"
                      color={PALETTE.orange} textColor="#FFF" markerId="ssp-ah" />
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
