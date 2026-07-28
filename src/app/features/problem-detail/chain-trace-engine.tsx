// @ts-nocheck
// Generic, config-driven engine for the "trace-game" (challenge/fill-in-the-blank) and
// "solution-slides" (free-scroll) tabs, for any problem whose visualization is a row of
// nodes optionally linked into a chain. Replaces what used to be one hand-written React
// component per problem per tab — all problem-specific content (values, code lines,
// badges, and the precomputed step trace) now comes from `config`, loaded from the
// database. See ChainTraceConfig shape below.
import React, { useState } from 'react';
import { RotateCcw, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { POINTER_COLORS, POINTER_TEXT_COLORS } from './pointer-colors';
import { ArrowMarker, PointerBadge, NodeValueBox, makeNodeLayout, buildDisplayChain } from './game-ui';

// ─── ChainTraceConfig shape ────────────────────────────────────────────────
// {
//   mode: 'challenge' | 'slides',
//   title: string, titleAr?: string,
//   subtitle?: string, subtitleAr?: string,        // slides mode only (fixed subtitle)
//   fileLabel: string,                              // e.g. 'reverseList.js'
//   values: number[],                                // node values, index = origIdx
//   techniques: {
//     [key: string]: {                               // e.g. 'iterative' | 'recursive' | 'default'
//       label?: string, labelAr?: string,
//       codeLines: { text: string, isChallenge?: boolean, correctAnswer?: string, options?: string[] }[],
//       badgeInfo: { [badgeKey: string]: { icon: string, label: string, labelAr?: string, color: string } },
//       steps: {
//         badge: string, activeLine: number,
//         links: Record<number, number|'null'> | null,   // null => plain array, no arrows
//         pointers: { name: string, origIdx: number|null, dx?: number, side?: 'above'|'below' }[],
//         activeNode: number | null,
//         displayHints: number[],                          // chain-follow seed order
//         linkAnnotation?: { from: number, to: number|null }, // extra curved/dashed arrow overlay
//         progressLabel?: string, progressLabelAr?: string,   // e.g. "Iteration 2 of 5" (slides only)
//         msg: string, msgAr?: string,
//         doneNote?: string, doneNoteAr?: string,
//       }[],
//     }
//   }
// }

const UI = {
  reset:          { en: 'Reset',                                  ar: 'إعادة تعيين' },
  back:           { en: '◀ Back',                                 ar: '◀ السابق' },
  next:           { en: 'Next ▶',                                 ar: 'التالي ▶' },
  currentState:   { en: 'Current State',                          ar: 'الحالة الحالية' },
  completeMissing:{ en: 'Complete the missing line',               ar: 'كمّلي السطر الناقص' },
  codeCompleted:  { en: 'Code completed!',                        ar: 'الكود اتكمّل!' },
  completeToUnlock:{ en: 'Complete the code to unlock the trace.', ar: 'كمّلي الكود عشان تفتحي التتبّع.' },
  correct:        { en: 'Correct!',                                ar: 'صح!' },
  tryAgain:       { en: 'Oops! Try again.',                        ar: 'أوبس! جرّبي تاني.' },
  codeCompleteViz:{ en: "Code complete! Let's visualize it.",      ar: 'الكود خلص! يلا نتابع بالصور.' },
  step1:          { en: 'Step 1: Complete the __TECH__code.',      ar: 'الخطوة 1: كمّلي __TECH__الكود.' },
  step2:          { en: 'Step 2: Trace the execution, node by node.', ar: 'الخطوة 2: تابعي التنفيذ، عقدة عقدة.' },
};
const t = (key, isAr) => (isAr ? UI[key].ar : UI[key].en);

const { nodeX, nodeCx } = makeNodeLayout();

export default function ChainTraceEngine({ config, initialTechnique, onTechniqueChange, isAr } = {}) {
  const techniqueKeys = Object.keys(config.techniques);
  const multiTechnique = techniqueKeys.length > 1;
  const [technique, setTechnique] = useState(
    initialTechnique && config.techniques[initialTechnique] ? initialTechnique : techniqueKeys[0]
  );

  const isChallenge = config.mode === 'challenge';

  const blankUserCode = (techKey) => config.techniques[techKey].codeLines.map(c => (c.isChallenge ? '' : c.text));
  const challengesFor = (techKey) => config.techniques[techKey].codeLines
    .map((c, i) => ({ ...c, originalIndex: i }))
    .filter(c => c.isChallenge);

  const [gameState, setGameState] = useState(() => Object.fromEntries(techniqueKeys.map(k => [k, 'coding'])));
  const [userCode, setUserCode] = useState(() => Object.fromEntries(techniqueKeys.map(k => [k, blankUserCode(k)])));
  const [challengeIndex, setChallengeIndex] = useState(() => Object.fromEntries(techniqueKeys.map(k => [k, 0])));
  const [visStep, setVisStep] = useState(() => Object.fromEntries(techniqueKeys.map(k => [k, 0])));
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });
  const [slideIdx, setSlideIdx] = useState(() => Object.fromEntries(techniqueKeys.map(k => [k, 0])));

  const { codeLines: CODE_LINES, steps: STEPS, badgeInfo: BADGE_INFO } = config.techniques[technique];
  const CHALLENGE_LIST = challengesFor(technique);
  const currentChallenge = CHALLENGE_LIST[challengeIndex[technique]];
  const isCoding = isChallenge && gameState[technique] === 'coding';

  const stepIdx = isChallenge ? visStep[technique] : slideIdx[technique];
  const step = STEPS[stepIdx];
  const badge = BADGE_INFO[step.badge];
  const isDone = !!(step.doneNote || step.doneNoteAr);

  const chain = buildDisplayChain(step.links, step.displayHints, config.values.length);
  const displayPos = (origIdx) => (origIdx === null || origIdx === undefined ? null : chain.indexOf(origIdx));
  const arrowExists = (displayIdx) => displayIdx < chain.length - 1 && step.links && step.links[chain[displayIdx]] === chain[displayIdx + 1];

  const switchTechnique = (tech) => {
    setTechnique(tech);
    if (isChallenge) setFeedback({ show: false, message: '', type: '' });
    onTechniqueChange?.(tech);
  };

  const handleSelect = (option) => {
    if (!isCoding || !currentChallenge) return;
    if (option === currentChallenge.correctAnswer) {
      setUserCode(prev => {
        const next = [...prev[technique]];
        next[currentChallenge.originalIndex] = option;
        return { ...prev, [technique]: next };
      });
      setFeedback({ show: true, message: t('correct', isAr), type: 'success' });
      setTimeout(() => {
        setFeedback({ show: false, message: '', type: '' });
        if (challengeIndex[technique] < CHALLENGE_LIST.length - 1) {
          setChallengeIndex(prev => ({ ...prev, [technique]: prev[technique] + 1 }));
        } else {
          setGameState(prev => ({ ...prev, [technique]: 'visualizing' }));
          setFeedback({ show: true, message: t('codeCompleteViz', isAr), type: 'info' });
          setTimeout(() => setFeedback({ show: false, message: '', type: '' }), 2800);
        }
      }, 700);
    } else {
      setFeedback({ show: true, message: t('tryAgain', isAr), type: 'error' });
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

  const techLabel = (key) => {
    const tech = config.techniques[key];
    if (isAr && tech.labelAr) return tech.labelAr;
    return tech.label || key;
  };

  const stepSubtitle = isCoding
    ? t('step1', isAr).replace('__TECH__', multiTechnique ? `${techLabel(technique)} ` : '')
    : t('step2', isAr);

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: 'var(--sans)', color: 'var(--ink)', padding: '24px 24px 48px' }}>
      <div style={{ maxWidth: 1150, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--secondary-light) 100%)',
          borderRadius: 32, border: '4px solid var(--card)', boxShadow: '0 8px 0 var(--shadow-color)',
          padding: '16px 24px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              {isAr && config.titleAr ? config.titleAr : config.title}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
              {isChallenge ? stepSubtitle : (isAr && config.subtitleAr ? config.subtitleAr : config.subtitle)}
            </p>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {multiTechnique && (
              <div style={{ display: 'flex', gap: 0, background: 'var(--surface-3)', borderRadius: 100, padding: 3, border: '2px solid var(--line)' }}>
                {techniqueKeys.map(k => (
                  <button key={k} onClick={() => switchTechnique(k)} className="cte-btn-press" style={{
                    fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900,
                    padding: '7px 16px', borderRadius: 100, border: 'none', cursor: 'pointer',
                    textTransform: isAr ? 'none' : 'capitalize', transition: 'all 0.15s',
                    background: technique === k ? 'var(--secondary)' : 'transparent',
                    color: technique === k ? '#FFF' : 'var(--ink-2)',
                    boxShadow: technique === k ? '0 3px 0 var(--secondary-shadow)' : 'none',
                  }}>
                    {techLabel(k)}
                  </button>
                ))}
              </div>
            )}
            {isChallenge && (
              <button onClick={handleReset} className="cte-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900,
                padding: '9px 16px', borderRadius: 100,
                border: '3px solid var(--line)', background: 'var(--card)',
                color: 'var(--ink)', cursor: 'pointer', boxShadow: '0 4px 0 var(--shadow-color)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <RotateCcw size={14} /> {t('reset', isAr)}
              </button>
            )}
          </div>
        </div>

        <style>{`
          @keyframes cteFadeUp { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .cte-btn-press:active { transform: translateY(2px) !important; }
          .cte-two-col { display: grid; grid-template-columns: minmax(0,2fr) minmax(0,3fr); gap: 20px; align-items: start; }
          @media (max-width: 900px) { .cte-two-col { grid-template-columns: 1fr; } }
        `}</style>

        <div className="cte-two-col">

          {/* ── LEFT: CODE + CHALLENGE/INFO ─────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ background: 'var(--editor-bg)', borderRadius: 20, overflow: 'hidden', border: '4px solid var(--editor-border)', boxShadow: '0 6px 0 rgba(0,0,0,0.12)' }}>
              <div style={{ background: 'var(--editor-bg-2)', padding: '8px 16px', borderBottom: '2px solid var(--editor-border)' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--editor-ink-2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {multiTechnique ? `${techLabel(technique)} · ` : ''}{config.fileLabel}
                </span>
              </div>
              <div style={{ padding: '14px 18px', fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.9 }}>
                {CODE_LINES.map((lineDef, index) => {
                  const isCurrentBlank = isChallenge && isCoding && lineDef.isChallenge && currentChallenge?.originalIndex === index;
                  const isFilled = isChallenge && lineDef.isChallenge && userCode[technique][index] !== '';
                  const isActive = (!isChallenge || !isCoding) && step.activeLine === index;
                  const text = isCurrentBlank
                    ? '  // ← pick the line below'
                    : (isChallenge && isCoding ? userCode[technique][index] : lineDef.text);
                  return (
                    <div key={index} style={{
                      display: 'flex', gap: 10, padding: '1px 10px', borderRadius: 6,
                      background: isActive ? 'color-mix(in srgb, var(--medium) 14%, transparent)' : isCurrentBlank ? 'color-mix(in srgb, var(--secondary) 14%, transparent)' : 'transparent',
                      borderLeft: `3px solid ${isActive ? 'var(--medium)' : isCurrentBlank ? 'var(--secondary)' : 'transparent'}`,
                      whiteSpace: 'pre',
                    }}>
                      <span style={{ color: 'var(--editor-ink-2)', userSelect: 'none', width: 14, textAlign: 'right', flexShrink: 0 }}>{index + 1}</span>
                      <span style={{
                        color: isCurrentBlank ? 'var(--secondary)' : isFilled ? 'var(--easy)' : 'var(--editor-ink)',
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
                <div style={{ background: 'var(--card)', borderRadius: 24, border: '3px solid var(--secondary-border)', padding: '18px 20px', boxShadow: '0 5px 0 color-mix(in srgb, var(--secondary) 12%, transparent)' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 900, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ background: 'var(--secondary-light)', color: 'var(--secondary)', borderRadius: 10, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                      {currentChallenge.originalIndex + 1}
                    </span>
                    {t('completeMissing', isAr)}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {currentChallenge.options.map((opt, i) => (
                      <button key={i} onClick={() => handleSelect(opt)} className="cte-btn-press" style={{
                        textAlign: 'left', fontFamily: 'var(--mono)', fontSize: 12.5,
                        background: 'var(--surface-2)', border: '2px solid var(--line)', borderRadius: 12,
                        padding: '10px 14px', cursor: 'pointer', color: 'var(--ink-2)',
                        whiteSpace: 'pre',
                      }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : isCoding ? (
                <div style={{ background: 'var(--surface-2)', borderRadius: 24, border: '3px solid var(--line)', padding: 24, textAlign: 'center', color: 'var(--ink-3)', fontWeight: 700 }}>
                  {t('codeCompleted', isAr)}
                </div>
              ) : (
                <div style={{ background: 'var(--card)', borderRadius: 24, border: `3px solid color-mix(in srgb, ${badge.color} 20%, transparent)`, padding: '18px 20px', boxShadow: '0 5px 0 var(--shadow-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>{badge.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: badge.color, textTransform: isAr ? 'none' : 'uppercase', letterSpacing: '0.4px' }}>
                      {isAr && badge.labelAr ? badge.labelAr : badge.label}
                    </span>
                    {(step.progressLabel || step.progressLabelAr) && (
                      <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 900, color: 'var(--ink-3)', background: 'var(--surface-3)', padding: '3px 10px', borderRadius: 100 }}>
                        {isAr && step.progressLabelAr ? step.progressLabelAr : step.progressLabel}
                      </span>
                    )}
                  </div>
                  <p dir={isAr ? 'rtl' : 'ltr'} style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)', lineHeight: 1.6, textAlign: isAr ? 'right' : 'left' }}>
                    {isAr && step.msgAr ? step.msgAr : step.msg}
                  </p>
                  {isDone && (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--easy)', fontWeight: 900, fontSize: 13 }}>
                      <Sparkles size={16} /> {isAr && step.doneNoteAr ? step.doneNoteAr : step.doneNote}
                    </div>
                  )}
                </div>
              )}

              {isChallenge && (
                <div style={{
                  position: 'absolute', bottom: -8, left: '50%', transform: `translateX(-50%) ${feedback.show ? 'translateY(0)' : 'translateY(10px)'}`,
                  opacity: feedback.show ? 1 : 0, transition: 'all 0.25s', pointerEvents: 'none', zIndex: 20,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 100,
                    fontWeight: 900, fontSize: 13, color: '#FFF', whiteSpace: 'nowrap',
                    background: feedback.type === 'success' ? 'var(--easy)' : feedback.type === 'error' ? 'var(--hard)' : 'var(--secondary)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
                  }}>
                    {feedback.type === 'success' && <CheckCircle size={16} />}
                    {feedback.type === 'error' && <XCircle size={16} />}
                    {feedback.message}
                  </div>
                </div>
              )}
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
                {isCoding ? t('completeToUnlock', isAr) : `${isAr ? 'الخطوة' : 'Step'} ${stepIdx + 1} ${isAr ? 'من' : 'of'} ${STEPS.length}`}
              </div>
              <button
                onClick={() => (isChallenge
                  ? setVisStep(prev => ({ ...prev, [technique]: Math.max(0, prev[technique] - 1) }))
                  : setSlideIdx(prev => ({ ...prev, [technique]: Math.max(0, prev[technique] - 1) })))}
                disabled={isCoding || stepIdx === 0} className="cte-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 14px', borderRadius: 100,
                border: '2px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink-2)', cursor: 'pointer',
                opacity: (isCoding || stepIdx === 0) ? 0.4 : 1,
              }}>{t('back', isAr)}</button>
              <button
                onClick={() => (isChallenge
                  ? setVisStep(prev => ({ ...prev, [technique]: Math.min(STEPS.length - 1, prev[technique] + 1) }))
                  : setSlideIdx(prev => ({ ...prev, [technique]: Math.min(STEPS.length - 1, prev[technique] + 1) })))}
                disabled={isCoding || stepIdx >= STEPS.length - 1} className="cte-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900, padding: '8px 16px', borderRadius: 100,
                border: 'none', background: 'var(--secondary)', color: '#FFF', cursor: 'pointer',
                boxShadow: '0 3px 0 var(--secondary-shadow)',
                opacity: (isCoding || stepIdx >= STEPS.length - 1) ? 0.4 : 1,
              }}>{t('next', isAr)}</button>
            </div>

            <div style={{
              background: 'var(--surface-2)', backgroundImage: 'radial-gradient(circle, var(--line) 1.5px, transparent 1.5px)', backgroundSize: '22px 22px',
              border: '4px solid var(--line)', borderRadius: 28, boxShadow: 'inset 0 4px 0 rgba(0,0,0,0.03), 0 8px 0 var(--shadow-color)',
              padding: '48px 16px 24px', minHeight: 260, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 14, left: 20, fontSize: 11, fontWeight: 900, textTransform: isAr ? 'none' : 'uppercase', letterSpacing: '0.6px', color: 'color-mix(in srgb, var(--secondary) 55%, transparent)' }}>
                {t('currentState', isAr)}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <svg width={Math.max(config.values.length, chain.length) * 110 + 80} height="220" style={{ display: 'block', margin: '0 auto' }}>
                  <defs>
                    <ArrowMarker id="cte-ah" color="var(--line-heavy)" />
                    <ArrowMarker id="cte-ah-flip" color="var(--hard)" />
                  </defs>

                  {step.links && (
                    <>
                      <text x="20" y="105" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="16" fill="var(--line-heavy)">∅</text>
                      <text x={nodeX(chain.length - 1) + 78} y="105" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="16" fill="var(--line-heavy)">∅</text>
                    </>
                  )}

                  {chain.map((origIdx, i) => arrowExists(i) && (
                    <line key={`a-${origIdx}`} x1={nodeX(i) + 52} y1="105" x2={nodeX(i + 1)} y2="105" stroke="var(--line-heavy)" strokeWidth="3" markerEnd="url(#cte-ah)" style={{ transition: 'all 0.5s' }} />
                  ))}

                  {/* Extra curved/dashed overlay for a link being rewired this step (e.g. reverse's
                      "curr.next = prev") — spelled out explicitly since the new link isn't always
                      between physically-adjacent display slots. */}
                  {step.linkAnnotation && displayPos(step.linkAnnotation.from) !== null && (() => {
                    const x1 = nodeX(displayPos(step.linkAnnotation.from)) + 26;
                    const toPos = step.linkAnnotation.to !== null ? displayPos(step.linkAnnotation.to) : null;
                    if (toPos !== null) {
                      const x2 = nodeX(toPos) + 26;
                      const midX = (x1 + x2) / 2;
                      return (
                        <path d={`M ${x1} 137 Q ${midX} 192 ${x2} 137`} stroke="var(--hard)" strokeWidth="3" strokeDasharray="7,5" fill="none" markerEnd="url(#cte-ah-flip)" style={{ transition: 'all 0.5s' }} />
                      );
                    }
                    return (
                      <g style={{ transition: 'transform 0.5s' }}>
                        <path d={`M ${x1} 137 L ${x1} 168`} stroke="var(--hard)" strokeWidth="3" strokeDasharray="4 3" fill="none" markerEnd="url(#cte-ah-flip)" />
                        <text x={x1} y="182" textAnchor="middle" fontSize="12" fontWeight="900" fill="var(--hard)" fontFamily="var(--mono)">null</text>
                      </g>
                    );
                  })()}

                  {chain.map((origIdx, i) => (
                    <g key={origIdx} style={{ transition: 'transform 0.5s' }} transform={`translate(${nodeX(i)},0)`}>
                      <NodeValueBox y={85} value={config.values[origIdx]} active={step.activeNode === origIdx} />
                    </g>
                  ))}

                  {(step.pointers || []).map((ptr) => {
                    const pos = displayPos(ptr.origIdx);
                    if (pos === null) return null;
                    return (
                      <PointerBadge key={ptr.name} cx={nodeCx(pos) + (ptr.dx || 0)} width={ptr.width || 48} label={ptr.name}
                        side={ptr.side} color={POINTER_COLORS[ptr.name] || 'var(--secondary)'}
                        textColor={POINTER_TEXT_COLORS[ptr.name] || '#FFF'} markerId="cte-ah" />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
