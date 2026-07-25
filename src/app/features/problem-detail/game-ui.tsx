// @ts-nocheck
// Shared SVG building blocks for the linked-list game/slides/move-pointer visualizers.
// Each of these renders byte-identical markup to what every problem variant hand-rolled
// before — behavior is unchanged, only the duplication is gone.
import React from 'react';

// nodeX/nodeCx: horizontal layout for a row of fixed-width node boxes.
export function makeNodeLayout(spacing = 110, leftMargin = 40, boxHalfWidth = 26) {
  const nodeX = (i) => leftMargin + i * spacing;
  const nodeCx = (i) => nodeX(i) + boxHalfWidth;
  return { nodeX, nodeCx };
}

// A single <marker> arrowhead definition, meant to sit inside an <svg><defs>.
export function ArrowMarker({ id, color }) {
  return (
    <marker id={id} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0,8 3,0 6" fill={color} />
    </marker>
  );
}

// A static pointer badge (prev/curr/next/head/p/...): a short line dropping onto the
// node plus a rounded label pill. `side="above"` sits higher above the node (used when
// two badges stack on the same node), `side="below"` sits closer to it.
export function PointerBadge({ cx, width, color, textColor, label, side = 'above', markerId, fontSize = 13 }) {
  const lineY1 = side === 'above' ? 23 : 53;
  const rectY = side === 'above' ? 1 : 31;
  const textY = side === 'above' ? 16 : 46;
  const halfW = width / 2;
  return (
    <g style={{ transition: 'transform 0.5s' }} transform={`translate(${cx},0)`}>
      <line x1="0" y1={lineY1} x2="0" y2="75" stroke={color} strokeWidth="2.5" markerEnd={`url(#${markerId})`} />
      <rect x={-halfW} y={rectY} width={width} height="22" rx="8" fill={color} />
      <text x="0" y={textY} textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize={fontSize} fill={textColor}>{label}</text>
    </g>
  );
}

// The draggable "scope variable" badge used by the move-pointer games: it floats above
// its current target (or shows a dashed "null" stub when unattached) and exposes a drag
// handle while it's a legal move.
export function ScopeVariableBadge({ x, label, color, textColor, hasTarget, targetX, targetY = 130, draggable, onDragStart, markerId }) {
  return (
    <g style={{ transition: 'transform 0.5s' }} transform={`translate(${x},0)`}>
      {hasTarget ? (
        <line x1="28" y1="42" x2={targetX} y2={targetY}
          stroke={color} strokeWidth="2.5" markerEnd={`url(#${markerId})`} style={{ transition: 'all 0.5s' }} />
      ) : (
        <g>
          <path d="M 28 42 L 28 70" stroke={color} strokeWidth="2.5" strokeDasharray="4 3" fill="none" markerEnd={`url(#${markerId})`} />
          <text x="28" y="84" textAnchor="middle" fontSize="11" fontWeight="900" fill={color} fontFamily="var(--mono)">null</text>
        </g>
      )}
      <rect x="0" y="20" width="56" height="22" rx="8" fill={color} />
      <text x="28" y="35" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="13" fill={textColor} style={{ pointerEvents: 'none' }}>{label}</text>
      {draggable && (
        <circle cx="28" cy="50" r="9" fill="#FECA57" stroke="#FFF" strokeWidth="2"
          onPointerDown={onDragStart}
          style={{ cursor: 'grab', touchAction: 'none', filter: 'drop-shadow(0 0 5px rgba(254,202,87,0.7))' }} />
      )}
    </g>
  );
}

// The 52x52 rounded node box + centered value text shared by the (non-draggable)
// linked-list-game and solution-slides node rows. Renders bare <rect>/<text> — the
// caller keeps its own wrapping <g key transform> exactly as before, so sibling
// elements (drag handles, drop-target overlays) are unaffected.
export function NodeValueBox({ y, value, active, activeFill = '#FFF3CD', activeStroke = '#FECA57', onPointerUp, dropId }) {
  return (
    <>
      <rect x="0" y={y} width="52" height="52" rx="18"
        onPointerUp={onPointerUp} data-drop-id={onPointerUp ? dropId : undefined}
        fill={active ? activeFill : '#FFF'} stroke={active ? activeStroke : 'var(--line-heavy)'}
        strokeWidth={active ? 4 : 3} style={onPointerUp ? { cursor: 'default' } : undefined} />
      <text x="26" y={y + 26} textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="20" fill="var(--ink)" style={{ pointerEvents: 'none' }}>
        {value}
      </text>
    </>
  );
}
