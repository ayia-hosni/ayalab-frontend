// @ts-nocheck
// Generic, config-driven engine for the "move-pointer" (drag-the-scope-variable) tab, for
// any problem whose visualization is a row of nodes with draggable pointer badges. All
// problem-specific content — including every intermediate frame's pointer positions, chain
// display order, and code-reveal state — comes from `config`, loaded from the database. The
// engine itself only handles drag/drop interaction and rendering; it derives nothing.
import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, CheckCircle, XCircle, Sparkles, MousePointer2 } from 'lucide-react';
import { POINTER_COLORS, POINTER_TEXT_COLORS } from './pointer-colors';
import { ArrowMarker, ScopeVariableBadge, NodeValueBox, makeNodeLayout, buildDisplayChain } from './game-ui';

// ─── PointerDragConfig shape ───────────────────────────────────────────────
// {
//   title: string, titleAr?: string, subtitle: string, subtitleAr?: string,
//   fileLabel: string,
//   values: number[],                                  // node display values, index = origIdx
//   nodeIds: string[],                                  // string key per node, same order as values
//   techniques: {
//     [key: string]: {
//       label?: string, labelAr?: string,
//       vars: string[],                                  // scope variable names, display order
//       code: string[],
//       initialFrame: Frame,
//       steps: {
//         from: string, to: string,                       // drag validation: nodeId/var -> nodeId/'null'
//         desc: string, descAr?: string,
//         frameAfter: Frame,
//       }[],
//     }
//   }
// }
// Frame = {
//   pointers: Record<string,string>,   // every var + nodeId -> target nodeId | 'null'
//   displayHints: string[],             // nodeIds, chain-follow seed order
//   activeNode: string | null,
//   revealedLines: number[],
//   activeLine: number | null,          // which revealed line is highlighted, if any
//   linkAnnotation?: { from: string, to: string|null },
// }

const UI = {
  reset:      { en: 'Reset',      ar: 'إعادة تعيين' },
  solved:     { en: 'Solved!',    ar: 'اتحلّت!' },
  drag:       { en: 'Drag',       ar: 'اسحبي' },
  notQuite:   { en: 'Not quite — try again.', ar: 'مش كده بالظبط — جرّبي تاني.' },
  correct:    { en: 'Correct!',   ar: 'صح!' },
  scopeVars:  { en: 'Scope Variables', ar: 'متغيرات النطاق' },
};
const t = (key, isAr) => (isAr ? UI[key].ar : UI[key].en);

const { nodeX, nodeCx } = makeNodeLayout();

export default function PointerDragEngine({ config, initialTechnique, onTechniqueChange, isAr } = {}) {
  const techniqueKeys = Object.keys(config.techniques);
  const [technique, setTechnique] = useState(
    initialTechnique && config.techniques[initialTechnique] ? initialTechnique : techniqueKeys[0]
  );
  const [stepIdx, setStepIdx] = useState(() => Object.fromEntries(techniqueKeys.map(k => [k, 0])));
  const [lastAnnotation, setLastAnnotation] = useState(() => Object.fromEntries(techniqueKeys.map(k => [k, null])));
  const [dragging, setDragging] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const draggingRef = useRef(null);
  draggingRef.current = dragging;

  // touch-action:none keeps most browsers from panning while a drag is in progress, but it
  // isn't reliably honored everywhere — a native, non-passive listener is the belt-and-
  // suspenders fix that actually stops the page from scrolling out from under a finger.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onTouchMove = (e) => { if (draggingRef.current) e.preventDefault(); };
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, []);

  const tech = config.techniques[technique];
  const { nodeIds, values } = config;
  const completedCount = stepIdx[technique];
  const currentHint = tech.steps[completedCount] ?? null;
  const isComplete = currentHint === null;
  const frame = completedCount === 0 ? tech.initialFrame : tech.steps[completedCount - 1].frameAfter;

  const idxOf = (nodeId) => (nodeId === 'null' || nodeId === null || nodeId === undefined) ? null : nodeIds.indexOf(nodeId);
  const links = Object.fromEntries(nodeIds.map((id, i) => [i, frame.pointers[id] === 'null' ? 'null' : idxOf(frame.pointers[id])]));
  const hintIndices = (frame.displayHints || []).map(idxOf).filter(i => i !== null);
  const chain = buildDisplayChain(links, hintIndices, values.length);
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
      setLastAnnotation(prev => ({ ...prev, [technique]: currentHint.frameAfter.linkAnnotation || null }));
      setStepIdx(prev => ({ ...prev, [technique]: prev[technique] + 1 }));
      flashFeedback('success', t('correct', isAr));
    } else {
      flashFeedback('error', t('notQuite', isAr));
    }
    setDragging(null);
  };

  // Touch-originated pointer events keep targeting wherever the drag *started*, never
  // wherever the finger currently is — this bubbled-up fallback does the hit-test manually
  // via elementFromPoint against the drop targets' data-drop-id.
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

  const switchTechnique = (k) => { setTechnique(k); setDragging(null); setFeedback({ show: false, message: '', type: '' }); onTechniqueChange?.(k); };

  const handleReset = () => {
    setStepIdx(prev => ({ ...prev, [technique]: 0 }));
    setLastAnnotation(prev => ({ ...prev, [technique]: null }));
    setDragging(null);
    setFeedback({ show: false, message: '', type: '' });
  };

  const techLabel = (k) => {
    const tk = config.techniques[k];
    return (isAr && tk.labelAr) ? tk.labelAr : (tk.label || k);
  };

  // A pointer badge floats directly above whatever node it currently targets, sliding there
  // as its value changes — falling back to a fixed "home" slot only while its value is null.
  // Badges sharing a target fan out side by side instead of overlapping.
  const varPositions = (() => {
    const raw = tech.vars.map((varName, varIdx) => {
      const value = frame.pointers[varName];
      const targetPos = value === 'null' ? null : chain.indexOf(idxOf(value));
      const hasTarget = targetPos !== null && targetPos !== -1;
      if (!hasTarget) return { name: varName, cx: 40 + varIdx * 130 + 28, targetPos: null, hasTarget: false };
      const group = tech.vars.filter(v => {
        const val = frame.pointers[v];
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

  const dragOrigin = (nodeId) => {
    if (tech.vars.includes(nodeId)) return { x: varPositions[nodeId].cx, y: 50 };
    const pos = chain.indexOf(idxOf(nodeId));
    if (pos === -1) return null;
    return { x: nodeX(pos) + 52, y: 156 };
  };

  const annotation = lastAnnotation[technique];

  return (
    <div ref={wrapperRef} dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: 'var(--sans)', color: 'var(--ink)', padding: '24px 24px 48px', userSelect: 'none', WebkitUserSelect: 'none' }}
      onPointerMove={handlePointerMove} onPointerUp={handleGlobalPointerUp} onPointerCancel={handleGlobalPointerCancel} onMouseLeave={handleGlobalPointerCancel}>
      <div style={{ maxWidth: 1150, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--secondary-light) 100%)',
          borderRadius: 32, border: '4px solid var(--card)', boxShadow: '0 8px 0 var(--shadow-color)',
          padding: '16px 24px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
              {isAr && config.titleAr ? config.titleAr : config.title}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
              {isAr && config.subtitleAr ? config.subtitleAr : config.subtitle}
            </p>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {techniqueKeys.length > 1 && (
              <div style={{ display: 'flex', gap: 0, background: 'var(--surface-3)', borderRadius: 100, padding: 3, border: '2px solid var(--line)' }}>
                {techniqueKeys.map(k => (
                  <button key={k} onClick={() => switchTechnique(k)} className="mp-btn-press" style={{
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
            <button onClick={handleReset} className="mp-btn-press" style={{
              fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900,
              padding: '9px 16px', borderRadius: 100,
              border: '3px solid var(--line)', background: 'var(--card)',
              color: 'var(--ink)', cursor: 'pointer', boxShadow: '0 4px 0 var(--shadow-color)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <RotateCcw size={14} /> {t('reset', isAr)}
            </button>
          </div>
        </div>

        <style>{`
          .mp-btn-press:active { transform: translateY(2px) !important; }
          @keyframes mp-line-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
          .mp-line-in { animation: mp-line-in 0.35s ease; }
          .mp-two-col { display: grid; grid-template-columns: minmax(0,2fr) minmax(0,3fr); gap: 20px; align-items: start; }
          @media (max-width: 900px) { .mp-two-col { grid-template-columns: 1fr; } }
        `}</style>

        <div className="mp-two-col">

          {/* ── LEFT: CODE + HINT ────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>

            <div style={{ background: 'var(--editor-bg)', borderRadius: 20, overflow: 'hidden', border: '4px solid var(--editor-border)', boxShadow: '0 6px 0 rgba(0,0,0,0.12)' }}>
              <div style={{ background: 'var(--editor-bg-2)', padding: '8px 16px', borderBottom: '2px solid var(--editor-border)' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--editor-ink-2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {techniqueKeys.length > 1 ? `${techLabel(technique)} · ` : ''}{config.fileLabel}
                </span>
              </div>
              <div style={{ padding: '14px 18px', fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.9 }}>
                {tech.code.map((text, index) => {
                  if (!frame.revealedLines.includes(index)) return null;
                  const isActive = frame.activeLine === index;
                  return (
                    <div key={index} className="mp-line-in" style={{
                      display: 'flex', gap: 10, padding: '1px 10px', borderRadius: 6,
                      background: isActive ? 'color-mix(in srgb, var(--easy) 16%, transparent)' : 'transparent',
                      borderLeft: `3px solid ${isActive ? 'var(--easy)' : 'transparent'}`,
                      whiteSpace: 'pre', transition: 'all 0.3s',
                    }}>
                      <span style={{ color: 'var(--editor-ink-2)', userSelect: 'none', width: 14, textAlign: 'right', flexShrink: 0 }}>{index + 1}</span>
                      <span style={{ color: isActive ? 'var(--easy)' : 'var(--editor-ink)', fontWeight: isActive ? 900 : 500 }}>{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: 'var(--card)', borderRadius: 24, border: `3px solid ${isComplete ? 'var(--easy-border)' : 'var(--secondary-border)'}`, padding: '18px 20px', boxShadow: '0 5px 0 var(--shadow-color)' }}>
              {isComplete ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--easy)', fontWeight: 900, fontSize: 14, marginBottom: 6 }}>
                    <Sparkles size={18} /> {t('solved', isAr)}
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                    {isAr && config.doneNoteAr ? config.doneNoteAr : config.doneNote}
                  </p>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--medium-shadow)' }}>{t('drag', isAr)}</span>
                    <span style={{ background: 'var(--primary)', color: '#FFF', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 900, padding: '3px 10px', borderRadius: 8 }}>
                      {currentHint.from}
                    </span>
                    <MousePointer2 size={13} style={{ color: 'var(--medium-shadow)' }} />
                    <span style={{ background: currentHint.to === 'null' ? 'var(--hard)' : 'var(--easy)', color: '#FFF', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 900, padding: '3px 10px', borderRadius: 8 }}>
                      {currentHint.to}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                    {isAr && currentHint.descAr ? currentHint.descAr : currentHint.desc}
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
                  background: feedback.type === 'success' ? 'var(--easy)' : 'var(--hard)',
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
                {isComplete ? `${isAr ? `كل الـ ${tech.steps.length} خطوات خلصت!` : `All ${tech.steps.length} steps complete!`}` : `${isAr ? 'خطوة' : 'Step'} ${completedCount + 1} ${isAr ? 'من' : 'of'} ${tech.steps.length}`}
              </div>
              <div style={{ height: 8, width: 120, background: 'color-mix(in srgb, var(--secondary) 10%, transparent)', borderRadius: 100, overflow: 'hidden', border: '2px solid color-mix(in srgb, var(--secondary) 12%, transparent)' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--secondary), var(--easy))', borderRadius: 100, width: `${Math.round((completedCount / tech.steps.length) * 100)}%`, transition: 'width 0.4s' }} />
              </div>
            </div>

            <div style={{
              background: 'var(--surface-2)', backgroundImage: 'radial-gradient(circle, var(--line) 1.5px, transparent 1.5px)', backgroundSize: '22px 22px',
              border: '4px solid var(--line)', borderRadius: 28, boxShadow: 'inset 0 4px 0 rgba(0,0,0,0.03), 0 8px 0 var(--shadow-color)',
              padding: '48px 16px 24px', minHeight: 320, position: 'relative', overflow: 'hidden', touchAction: 'none',
            }}>
              <div style={{ position: 'absolute', top: 14, left: 20, fontSize: 11, fontWeight: 900, textTransform: isAr ? 'none' : 'uppercase', letterSpacing: '0.6px', color: 'color-mix(in srgb, var(--secondary) 55%, transparent)' }}>
                {t('scopeVars', isAr)}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <svg ref={svgRef} width={Math.max(values.length, chain.length) * 110 + 80} height="260" style={{ display: 'block', margin: '0 auto' }}>
                  <defs>
                    <ArrowMarker id="mp-ah" color="var(--line-heavy)" />
                    <ArrowMarker id="mp-ah-drag" color="var(--medium)" />
                  </defs>

                  {/* null endpoints — also valid drop targets */}
                  <g onPointerUp={(e) => handlePointerUp(e, 'null')} data-drop-id="null">
                    <rect x="0" y="130" width="40" height="52" fill="transparent" />
                    <text x="20" y="156" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="16" fill="var(--line-heavy)">∅</text>
                  </g>
                  <g onPointerUp={(e) => handlePointerUp(e, 'null')} data-drop-id="null">
                    <rect x={nodeX(chain.length - 1) + 58} y="130" width="40" height="52" fill="transparent" />
                    <text x={nodeX(chain.length - 1) + 78} y="156" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="16" fill="var(--line-heavy)">∅</text>
                  </g>

                  {chain.map((origIdx, i) => arrowExists(i) && (
                    <line key={`a-${origIdx}`} x1={nodeX(i) + 52} y1="156" x2={nodeX(i + 1)} y2="156" stroke="var(--line-heavy)" strokeWidth="3" markerEnd="url(#mp-ah)" style={{ transition: 'all 0.5s' }} />
                  ))}

                  {/* Explicit annotation for the move just made — a long jump can land behind other
                      nodes in the reordered chain, so spell it out rather than rely on adjacency. */}
                  {annotation && (() => {
                    const fromPos = chain.indexOf(idxOf(annotation.from));
                    if (fromPos === -1) return null;
                    const x1 = nodeX(fromPos) + 26;
                    const toPos = annotation.to !== null ? chain.indexOf(idxOf(annotation.to)) : -1;
                    if (toPos !== -1) {
                      const x2 = nodeX(toPos) + 26;
                      const midX = (x1 + x2) / 2;
                      return <path d={`M ${x1} 182 Q ${midX} 237 ${x2} 182`} stroke="var(--hard)" strokeWidth="3" strokeDasharray="7,5" fill="none" markerEnd="url(#mp-ah)" style={{ transition: 'all 0.5s' }} />;
                    }
                    return (
                      <g>
                        <path d={`M ${x1} 182 L ${x1} 213`} stroke="var(--hard)" strokeWidth="3" strokeDasharray="4 3" fill="none" markerEnd="url(#mp-ah)" />
                        <text x={x1} y="227" textAnchor="middle" fontSize="12" fontWeight="900" fill="var(--hard)" fontFamily="var(--mono)">null</text>
                      </g>
                    );
                  })()}

                  {chain.map((origIdx, i) => {
                    const nodeId = nodeIds[origIdx];
                    const value = values[origIdx];
                    const isActive = frame.activeNode === nodeId;
                    const draggableHere = canDrag(nodeId);
                    return (
                      <g key={origIdx} style={{ transition: 'transform 0.5s' }} transform={`translate(${nodeX(i)},130)`}>
                        <NodeValueBox y={0} value={value} active={isActive} dropId={nodeId} onPointerUp={(e) => handlePointerUp(e, nodeId)} />
                        {draggableHere && (
                          <circle cx="52" cy="26" r="8" fill="var(--primary)" stroke="var(--card)" strokeWidth="2"
                            onPointerDown={(e) => handlePointerDown(e, nodeId)}
                            style={{ cursor: 'grab', touchAction: 'none', filter: 'drop-shadow(0 0 4px color-mix(in srgb, var(--primary) 60%, transparent))' }} />
                        )}
                      </g>
                    );
                  })}

                  {/* Scope Variables — each badge floats above its current target and slides there
                      as the pointer moves, falling back to a fixed home slot only while null. */}
                  {tech.vars.map((varName) => {
                    const { cx, hasTarget, targetPos } = varPositions[varName];
                    const varX = cx - 28;
                    return (
                      <ScopeVariableBadge key={varName}
                        x={varX} label={varName}
                        color={POINTER_COLORS[varName] || 'var(--secondary)'} textColor={POINTER_TEXT_COLORS[varName] || '#FFF'}
                        hasTarget={hasTarget} targetX={hasTarget ? nodeCx(targetPos) - varX : 0}
                        draggable={canDrag(varName)} onDragStart={(e) => handlePointerDown(e, varName)}
                        markerId="mp-ah" />
                    );
                  })}

                  {/* live drag line following the cursor */}
                  {dragging && (() => {
                    const origin = dragOrigin(dragging.from);
                    if (!origin) return null;
                    return <line x1={origin.x} y1={origin.y} x2={mousePos.x} y2={mousePos.y} stroke="var(--medium)" strokeWidth="2.5" strokeDasharray="6,5" markerEnd="url(#mp-ah-drag)" style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 4px color-mix(in srgb, var(--medium) 60%, transparent))' }} />;
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
