// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCcw, Info, AlertTriangle, CheckCircle, HelpCircle, X,
  MousePointer2, Activity, Trash2, Trophy, Zap, Code2, Layers,
  Database, GitBranch, Lock, Shield, Star, ArrowRight
} from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────────────────

const DATA_NODES = ['1', '2', '3', '4', '5'];

const INITIAL_ITERATIVE = {
  head: '1', prev: 'null', curr: '1', next: 'null',
  '1': '2', '2': '3', '3': '4', '4': '5', '5': 'null',
};

const INITIAL_RECURSIVE = {
  head: '1', p: 'null',
  '1': '2', '2': '3', '3': '4', '4': '5', '5': 'null',
};

const ITERATIVE_STEPS = [
  { iter: 1, sub: 0, from: 'next', to: '2',    code: 'next = curr.next',  desc: "Save curr's next before breaking the link." },
  { iter: 1, sub: 1, from: '1',    to: 'null',  code: 'curr.next = prev',  desc: "Reverse: node 1 now points back to null." },
  { iter: 1, sub: 2, from: 'prev', to: '1',     code: 'prev = curr',       desc: "Step prev forward to node 1." },
  { iter: 1, sub: 3, from: 'curr', to: '2',     code: 'curr = next',       desc: "Step curr forward to node 2." },
  { iter: 2, sub: 0, from: 'next', to: '3',     code: 'next = curr.next',  desc: "Save curr's next before breaking the link." },
  { iter: 2, sub: 1, from: '2',    to: '1',     code: 'curr.next = prev',  desc: "Reverse: node 2 now points to node 1." },
  { iter: 2, sub: 2, from: 'prev', to: '2',     code: 'prev = curr',       desc: "Step prev forward to node 2." },
  { iter: 2, sub: 3, from: 'curr', to: '3',     code: 'curr = next',       desc: "Step curr forward to node 3." },
  { iter: 3, sub: 0, from: 'next', to: '4',     code: 'next = curr.next',  desc: "Save curr's next before breaking the link." },
  { iter: 3, sub: 1, from: '3',    to: '2',     code: 'curr.next = prev',  desc: "Reverse: node 3 now points to node 2." },
  { iter: 3, sub: 2, from: 'prev', to: '3',     code: 'prev = curr',       desc: "Step prev forward to node 3." },
  { iter: 3, sub: 3, from: 'curr', to: '4',     code: 'curr = next',       desc: "Step curr forward to node 4." },
  { iter: 4, sub: 0, from: 'next', to: '5',     code: 'next = curr.next',  desc: "Save curr's next before breaking the link." },
  { iter: 4, sub: 1, from: '4',    to: '3',     code: 'curr.next = prev',  desc: "Reverse: node 4 now points to node 3." },
  { iter: 4, sub: 2, from: 'prev', to: '4',     code: 'prev = curr',       desc: "Step prev forward to node 4." },
  { iter: 4, sub: 3, from: 'curr', to: '5',     code: 'curr = next',       desc: "Step curr forward to node 5." },
  { iter: 5, sub: 0, from: 'next', to: 'null',  code: 'next = curr.next',  desc: "curr.next is null — end of list." },
  { iter: 5, sub: 1, from: '5',    to: '4',     code: 'curr.next = prev',  desc: "Reverse: node 5 now points to node 4." },
  { iter: 5, sub: 2, from: 'prev', to: '5',     code: 'prev = curr',       desc: "Step prev to node 5 — the new head!" },
  { iter: 5, sub: 3, from: 'curr', to: 'null',  code: 'curr = next',       desc: "curr = null — the loop exits!" },
  { iter: 0, sub: 0, from: 'head', to: '5',     code: 'return prev',       desc: "Set head = prev. The list is reversed!" },
];

const RECURSIVE_STEPS = [
  { frame: 5, phase: 'base',   from: 'p',    to: '5',    code: 'base case → return node 5', desc: "Deepest call. p points to node 5 (new head)." },
  { frame: 4, phase: 'unwind', from: '5',    to: '4',    code: 'head.next.next = head',      desc: "node5.next = node4 — reverse the link." },
  { frame: 4, phase: 'unwind', from: '4',    to: 'null', code: 'head.next = null',            desc: "node4.next = null — break the old forward link." },
  { frame: 3, phase: 'unwind', from: '4',    to: '3',    code: 'head.next.next = head',      desc: "node4.next = node3 — reverse the link." },
  { frame: 3, phase: 'unwind', from: '3',    to: 'null', code: 'head.next = null',            desc: "node3.next = null — break the old forward link." },
  { frame: 2, phase: 'unwind', from: '3',    to: '2',    code: 'head.next.next = head',      desc: "node3.next = node2 — reverse the link." },
  { frame: 2, phase: 'unwind', from: '2',    to: 'null', code: 'head.next = null',            desc: "node2.next = null — break the old forward link." },
  { frame: 1, phase: 'unwind', from: '2',    to: '1',    code: 'head.next.next = head',      desc: "node2.next = node1 — reverse the link." },
  { frame: 1, phase: 'unwind', from: '1',    to: 'null', code: 'head.next = null',            desc: "node1.next = null — break the old forward link." },
  { frame: 0, phase: 'return', from: 'head', to: '5',    code: 'return p',                   desc: "Return p as the new head — reversal complete!" },
];

const ACHIEVEMENTS_DEF = [
  { id: 'first_reverse',    name: 'First Reverse',    icon: '🏆', desc: 'Complete your first reversal',       color: 'amber'   },
  { id: 'iterative_master', name: 'Iterative Master', icon: '🔄', desc: 'Complete the iterative algorithm',   color: 'blue'    },
  { id: 'recursive_wizard', name: 'Recursive Wizard', icon: '🔮', desc: 'Complete the recursive algorithm',   color: 'purple'  },
  { id: 'pointer_master',   name: 'Pointer Master',   icon: '🎯', desc: 'Complete both algorithms',           color: 'emerald' },
  { id: 'memory_safe',      name: 'Memory Safe',      icon: '♻️', desc: 'Reverse without garbage collection', color: 'green'   },
  { id: 'speed_run',        name: 'Speed Run',        icon: '⚡', desc: 'Complete in under 60 seconds',       color: 'yellow'  },
  { id: 'cycle_hunter',     name: 'Cycle Hunter',     icon: '🔍', desc: 'Detect an infinite loop',            color: 'rose'    },
];

const BADGE_STYLE = {
  amber:   { bg: '#FFF3CD', border: '#FECA57', color: '#9A7400',  shadow: '#D49B1C' },
  blue:    { bg: '#EBF8FF', border: '#90CDF4', color: '#2C5282',  shadow: '#63B3ED' },
  purple:  { bg: '#F3ECFF', border: '#C9A0F7', color: '#5C35A0',  shadow: '#A55EEA' },
  emerald: { bg: '#E8FFF4', border: '#A8E6CE', color: '#00664A',  shadow: '#00966A' },
  green:   { bg: '#F0FFF4', border: '#9AE6B4', color: '#22543D',  shadow: '#48BB78' },
  yellow:  { bg: '#FFFDE7', border: '#FFF176', color: '#7A5400',  shadow: '#FECA57' },
  rose:    { bg: '#FFF5F5', border: '#FEB2B2', color: '#C53030',  shadow: '#FC8181' },
};

// Code lines for game mode highlighting
const ITER_CODE_LINES = [
  { text: 'function reverseList(head) {', key: null },
  { text: '  let prev = null;',           key: null },
  { text: '  let curr = head;',           key: null },
  { text: '  while (curr !== null) {',    key: null },
  { text: '    let next = curr.next;',    key: 'next = curr.next' },
  { text: '    curr.next = prev;',        key: 'curr.next = prev' },
  { text: '    prev = curr;',             key: 'prev = curr' },
  { text: '    curr = next;',             key: 'curr = next' },
  { text: '  }',                          key: null },
  { text: '  return prev;',               key: 'return prev' },
  { text: '}',                            key: null },
];

const REC_CODE_LINES = [
  { text: 'function reverseList(head) {',       key: null },
  { text: '  if (!head?.next) return head;',    key: 'base case' },
  { text: '  let p = reverseList(head.next);',  key: null },
  { text: '  head.next.next = head;',           key: 'head.next.next = head' },
  { text: '  head.next = null;',                key: 'head.next = null' },
  { text: '  return p;',                        key: 'return p' },
  { text: '}',                                  key: null },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const getCallStackFrames = (stepIdx) => {
  if (stepIdx <= 0) return [5, 4, 3, 2, 1];
  if (stepIdx <= 2) return [4, 3, 2, 1];
  if (stepIdx <= 4) return [3, 2, 1];
  if (stepIdx <= 6) return [2, 1];
  if (stepIdx <= 8) return [1];
  return [];
};

const getActiveFrame = (stepIdx) => {
  if (stepIdx <= 0) return 5;
  if (stepIdx <= 2) return 4;
  if (stepIdx <= 4) return 3;
  if (stepIdx <= 6) return 2;
  if (stepIdx <= 8) return 1;
  return 0;
};

const getQuestionText = (hint) => {
  if (!hint) return '';
  const c = hint.code;
  if (c === 'next = curr.next')         return `Save curr's next link — drag \`next\` to point at the right node.`;
  if (c === 'curr.next = prev')         return `Reverse the link — drag node ${hint.from}'s arrow to point at \`prev\`'s current target.`;
  if (c === 'prev = curr')              return `Advance \`prev\` — drag it forward to the current \`curr\` node.`;
  if (c === 'curr = next')              return `Advance \`curr\` — drag it forward to the saved \`next\` node.`;
  if (c === 'return prev')              return `All iterations done! Set \`head\` to the new head — drag it to the correct node.`;
  if (c.startsWith('base case'))       return `Base case reached — drag \`p\` to mark node 5 as the new head.`;
  if (c === 'head.next.next = head')   return `Unwinding frame ${hint.frame}: drag node ${hint.from}'s arrow to reverse the link.`;
  if (c === 'head.next = null')        return `Break the old forward link — drag node ${hint.from}'s arrow to \`null\`.`;
  if (c === 'return p')                return `Reversal complete! Drag \`head\` to the returned node.`;
  return `Drag \`${hint.from}\` to the correct target.`;
};

const getTechniqueBadge = (technique) =>
  technique === 'iterative'
    ? { icon: '🔄', label: 'Two Pointers',        color: 'var(--primary)',   bg: '#FFF7F0', border: '#FFD19A' }
    : { icon: '🔮', label: 'Call Stack Unwind',   color: 'var(--secondary)', bg: '#F3ECFF', border: '#C9A0F7' };

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function App() {
  // Sandbox state
  const [technique, setTechnique]               = useState('iterative');
  const [difficulty, setDifficulty]             = useState('beginner');
  const [pointers, setPointers]                 = useState(INITIAL_ITERATIVE);
  const [dragging, setDragging]                 = useState(null);
  const [mousePos, setMousePos]                 = useState({ x: 0, y: 0 });
  const [goalAchieved, setGoalAchieved]         = useState(false);
  const [achievements, setAchievements]         = useState(new Set());
  const [toastAchievement, setToastAchievement] = useState(null);
  const [hasHadGarbage, setHasHadGarbage]       = useState(false);
  const [hasCycle, setHasCycle]                 = useState(false);
  const [startTime, setStartTime]               = useState(null);
  const [showTutorial, setShowTutorial]         = useState(false);
  const [rightTab, setRightTab]                 = useState('code');

  // Game mode state
  const [mode, setMode]                 = useState('free');  // 'free' | 'game'
  const [gamePhase, setGamePhase]       = useState('question');  // 'question' | 'correct' | 'wrong' | 'complete'
  const [gameScore, setGameScore]       = useState(0);
  const [gameTries, setGameTries]       = useState(0);
  const [gameHintShown, setGameHintShown] = useState(false);
  const [gameStepIdx, setGameStepIdx]   = useState(0);
  // Track which step codes have been answered at least once — enables "Keep Pattern" on repeats.
  const [seenCodes, setSeenCodes]       = useState(new Set());

  const svgRef = useRef(null);

  const VARIABLES    = technique === 'iterative' ? ['head', 'prev', 'curr', 'next'] : ['head', 'p'];
  const ALL_NODES    = [...VARIABLES, ...DATA_NODES, 'null'];
  const steps        = technique === 'iterative' ? ITERATIVE_STEPS : RECURSIVE_STEPS;
  // In game mode use index-based tracking so variables that get reassigned (e.g. `next`) don't
  // cause earlier steps to appear unsatisfied again. Free mode still scans for first unmet step.
  const currentHint  = mode === 'game'
    ? (gameStepIdx < steps.length ? steps[gameStepIdx] : null)
    : steps.find(s => pointers[s.from] !== s.to);
  const currentStepIdx = mode === 'game' ? gameStepIdx : (currentHint ? steps.indexOf(currentHint) : steps.length);

  // ── WIN CONDITION ─────────────────────────────────────────────────────────
  useEffect(() => {
    const isReversed = pointers['5'] === '4' && pointers['4'] === '3' &&
      pointers['3'] === '2' && pointers['2'] === '1' && pointers['1'] === 'null';
    const validHead = pointers.head === '5' || pointers.prev === '5' || pointers.p === '5';
    if (isReversed && validHead && !currentHint) {
      if (!goalAchieved) { setGoalAchieved(true); unlockAchievements(); }
    } else { setGoalAchieved(false); }
  }, [pointers, currentHint]);

  // ── GARBAGE TRACKER ───────────────────────────────────────────────────────
  useEffect(() => {
    const { visited } = computeLayout();
    if (DATA_NODES.some(n => !visited.has(n))) setHasHadGarbage(true);
  }, [pointers]);

  // ── CYCLE TRACKER ─────────────────────────────────────────────────────────
  useEffect(() => {
    const { cycleNode } = computeLayout();
    if (cycleNode && !hasCycle) { setHasCycle(true); grantAchievement('cycle_hunter'); }
  }, [pointers]);

  // ── RESET ON TECHNIQUE CHANGE ─────────────────────────────────────────────
  useEffect(() => {
    resetBoard();
    resetGameState();
  }, [technique]);

  const ensureTimer = () => { if (!startTime) setStartTime(Date.now()); };

  // ── ACHIEVEMENTS ──────────────────────────────────────────────────────────
  const grantAchievement = (id) => {
    setAchievements(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      setToastAchievement(id);
      setTimeout(() => setToastAchievement(null), 3500);
      return next;
    });
  };

  const unlockAchievements = () => {
    grantAchievement('first_reverse');
    if (technique === 'iterative') grantAchievement('iterative_master');
    if (technique === 'recursive') grantAchievement('recursive_wizard');
    if (!hasHadGarbage) grantAchievement('memory_safe');
    if (startTime && (Date.now() - startTime) < 60000) grantAchievement('speed_run');
    setTimeout(() => {
      setAchievements(prev => {
        if (prev.has('iterative_master') && prev.has('recursive_wizard') && !prev.has('pointer_master')) {
          grantAchievement('pointer_master');
        }
        return prev;
      });
    }, 200);
  };

  // ── LAYOUT ENGINE ─────────────────────────────────────────────────────────
  const computeLayout = () => {
    const positions = {};
    const visited   = new Set();
    let trackIndex  = 0;
    let cycleNode   = null;

    VARIABLES.forEach((v, i) => { positions[v] = { x: 50 + i * 150, y: 40 }; });

    // Deduplicate roots so two variables pointing to the same node
    // don't produce a false cycle on the second traversal.
    const roots = [...new Set(VARIABLES.map(v => pointers[v]).filter(n => n && n !== 'null'))];
    roots.forEach(root => {
      const localVisited = new Set();
      let current = root;
      while (current && current !== 'null' && !visited.has(current)) {
        visited.add(current);
        localVisited.add(current);
        positions[current] = { x: 50 + trackIndex * 105, y: 190 };
        trackIndex++;
        current = pointers[current];
      }
      // Only a real cycle if we loop back to a node we visited in THIS traversal.
      if (current && current !== 'null' && localVisited.has(current)) cycleNode = current;
    });

    visited.add('null');
    positions['null'] = { x: 50 + trackIndex * 105, y: 190 };
    trackIndex++;

    let unlinked = 0;
    DATA_NODES.forEach(node => {
      if (!visited.has(node)) {
        positions[node] = { x: 50 + unlinked * 120, y: 380 };
        unlinked++;
      }
    });

    return { positions, cycleNode, visited };
  };

  const { positions, cycleNode } = computeLayout();

  // ── INTERACTION ───────────────────────────────────────────────────────────
  const canDrag = (nodeId) => {
    if (nodeId === 'null') return false;
    if (mode === 'game') {
      if (gamePhase !== 'question' || goalAchieved) return false;
      return !currentHint || nodeId === currentHint.from;
    }
    if (goalAchieved) return false;
    if (difficulty === 'advanced' || difficulty === 'intermediate') return true;
    return !currentHint || nodeId === currentHint.from;
  };

  const handlePointerDown = (e, nodeId) => {
    e.stopPropagation();
    if (!canDrag(nodeId)) return;
    ensureTimer();
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

    if (!VARIABLES.includes(targetId)) {
      if (mode === 'game' && currentHint) {
        if (targetId === currentHint.to) {
          // ── CORRECT ANSWER ────────────────────────────────────────────────
          const wasFirstTry = gameTries === 0;
          if (wasFirstTry) setGameScore(prev => prev + 1);
          setPointers(prev => ({ ...prev, [dragging.from]: targetId }));
          setGamePhase('correct');
          setSeenCodes(prev => { const n = new Set(prev); n.add(currentHint.code); return n; });

          const nextIdx = gameStepIdx + 1;
          setGameStepIdx(nextIdx);
          if (nextIdx >= steps.length) {
            setTimeout(() => setGamePhase('complete'), 1200);
          } else {
            setTimeout(() => {
              setGamePhase('question');
              setGameTries(0);
              setGameHintShown(false);
            }, 1200);
          }
        } else {
          // ── WRONG ANSWER ──────────────────────────────────────────────────
          setGameTries(prev => prev + 1);
          setGamePhase('wrong');
          setTimeout(() => setGamePhase('question'), 1000);
        }
      } else {
        setPointers(prev => ({ ...prev, [dragging.from]: targetId }));
      }
    }
    setDragging(null);
  };

  const handleGlobalPointerUp = () => { if (dragging) setDragging(null); };

  const resetBoard = () => {
    setPointers(technique === 'iterative' ? INITIAL_ITERATIVE : INITIAL_RECURSIVE);
    setGoalAchieved(false);
    setHasHadGarbage(false);
    setHasCycle(false);
    setStartTime(null);
    setDragging(null);
  };

  const resetGameState = () => {
    setGameScore(0);
    setGamePhase('question');
    setGameHintShown(false);
    setGameTries(0);
    setGameStepIdx(0);
    setSeenCodes(new Set());
  };

  // Apply the current step automatically — available when this code was already answered before.
  const handleKeepPattern = () => {
    if (!currentHint || gamePhase !== 'question') return;
    if (gameTries === 0) setGameScore(prev => prev + 1);
    setPointers(prev => ({ ...prev, [currentHint.from]: currentHint.to }));
    setSeenCodes(prev => { const n = new Set(prev); n.add(currentHint.code); return n; });
    setGamePhase('correct');
    const nextIdx = gameStepIdx + 1;
    setGameStepIdx(nextIdx);
    if (nextIdx >= steps.length) {
      setTimeout(() => setGamePhase('complete'), 1200);
    } else {
      setTimeout(() => {
        setGamePhase('question');
        setGameTries(0);
        setGameHintShown(false);
      }, 1200);
    }
  };

  const resetGame = () => {
    resetBoard();
    resetGameState();
  };

  // ── SVG ARROWS ────────────────────────────────────────────────────────────
  const drawArrow = (sourceId, targetId, isDragging = false) => {
    const isVar     = VARIABLES.includes(isDragging ? dragging?.from : sourceId);
    const sourcePos = isDragging ? positions[dragging?.from] : positions[sourceId];
    if (!sourcePos) return null;

    const startX = isVar ? sourcePos.x + 40 : sourcePos.x + 80;
    const startY = isVar ? sourcePos.y + 40 : sourcePos.y + 25;
    let targetX, targetY;

    if (isDragging) {
      targetX = mousePos.x;
      targetY = mousePos.y;
    } else {
      if (!positions[targetId]) return null;
      targetX = isVar ? positions[targetId].x + 40 : positions[targetId].x;
      targetY = isVar ? positions[targetId].y - 5  : positions[targetId].y + 25;
    }

    if (isVar) return `M ${startX} ${startY} C ${startX} ${startY + 40}, ${targetX} ${targetY - 40}, ${targetX} ${targetY}`;

    if (!isDragging && sourceId !== cycleNode && targetId === cycleNode) {
      const mx = (startX + targetX) / 2;
      return `M ${startX} ${startY} Q ${startX + 30} ${startY + 60} ${mx} ${startY + 60} Q ${targetX - 30} ${startY + 60} ${targetX} ${targetY + 10}`;
    }

    if (Math.abs(startY - targetY) < 10) return `M ${startX} ${startY} L ${targetX} ${targetY}`;

    const curve = Math.max(40, Math.abs(targetX - startX) / 2);
    return `M ${startX} ${startY} C ${startX + curve} ${startY}, ${targetX - curve} ${targetY}, ${targetX} ${targetY}`;
  };

  // ─── RIGHT PANEL: CODE ────────────────────────────────────────────────────
  const renderCodePanel = () => (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#2D3436', borderRadius: 20, overflow: 'hidden', border: '4px solid #1E2528', boxShadow: '0 6px 0 rgba(0,0,0,0.12)' }}>
        <div style={{ background: '#232A2D', padding: '8px 16px', borderBottom: '2px solid #1E2528', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: '#B2BEC3', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--sans)' }}>
            {technique === 'iterative' ? 'Iterative' : 'Recursive'} · JavaScript
          </span>
        </div>
        <div style={{ padding: '14px 20px', fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.85, color: '#DFE6E9' }}>
          {technique === 'iterative' ? (
            <>
              <span style={{color:'#C792EA'}}>function</span> <span style={{color:'#82AAFF'}}>reverseList</span>(head) {'{'}<br/>
              &nbsp;&nbsp;<span style={{color:'#C792EA'}}>let</span> prev = <span style={{color:'#FF5370'}}>null</span>;<br/>
              &nbsp;&nbsp;<span style={{color:'#C792EA'}}>let</span> curr = head;<br/>
              &nbsp;&nbsp;<span style={{color:'#C792EA'}}>while</span> (curr !== <span style={{color:'#FF5370'}}>null</span>) {'{'}<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{color:'#C792EA'}}>let</span> next = curr.<span style={{color:'#89DDFF'}}>next</span>;<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;curr.<span style={{color:'#89DDFF'}}>next</span> = prev;<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;prev = curr;<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;curr = next;<br/>
              &nbsp;&nbsp;{'}'}<br/>
              &nbsp;&nbsp;<span style={{color:'#C792EA'}}>return</span> prev;<br/>
              {'}'}
            </>
          ) : (
            <>
              <span style={{color:'#C792EA'}}>function</span> <span style={{color:'#82AAFF'}}>reverseList</span>(head) {'{'}<br/>
              &nbsp;&nbsp;<span style={{color:'#C792EA'}}>if</span> (!head?.<span style={{color:'#89DDFF'}}>next</span>) <span style={{color:'#C792EA'}}>return</span> head;<br/>
              &nbsp;&nbsp;<span style={{color:'#C792EA'}}>let</span> p = <span style={{color:'#82AAFF'}}>reverseList</span>(head.<span style={{color:'#89DDFF'}}>next</span>);<br/>
              &nbsp;&nbsp;head.<span style={{color:'#89DDFF'}}>next</span>.<span style={{color:'#89DDFF'}}>next</span> = head;<br/>
              &nbsp;&nbsp;head.<span style={{color:'#89DDFF'}}>next</span> = <span style={{color:'#FF5370'}}>null</span>;<br/>
              &nbsp;&nbsp;<span style={{color:'#C792EA'}}>return</span> p;<br/>
              {'}'}
            </>
          )}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink-3)', marginBottom: 8, fontFamily: 'var(--sans)' }}>Live Variables</div>
        <div style={{ background: '#F8F9FA', border: '3px solid var(--line)', borderRadius: 14, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {VARIABLES.map(v => (
            <div key={v} style={{ display: 'flex', gap: 6, alignItems: 'center', fontFamily: 'var(--mono)', fontSize: 13 }}>
              <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>let</span>
              <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{v}</span>
              <span style={{ color: 'var(--ink-3)' }}>=</span>
              <span style={{ color: pointers[v] === 'null' ? 'var(--hard)' : 'var(--primary)', fontWeight: 900, background: pointers[v] === 'null' ? 'rgba(255,107,107,0.1)' : 'rgba(255,159,67,0.1)', padding: '1px 7px', borderRadius: 6 }}>
                {pointers[v]}
              </span>
              <span style={{ color: 'var(--ink-3)' }}>;</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink-3)', marginBottom: 8, fontFamily: 'var(--sans)' }}>Node Pointers</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {DATA_NODES.map(src => {
            const tgt  = pointers[src];
            const init = technique === 'iterative' ? INITIAL_ITERATIVE[src] : INITIAL_RECURSIVE[src];
            const mod  = tgt !== init;
            return (
              <div key={src} style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 10, background: mod ? 'rgba(165,94,234,0.07)' : 'transparent', borderLeft: `3px solid ${mod ? 'var(--secondary)' : 'transparent'}`, display: 'flex', gap: 5, alignItems: 'center', transition: 'all 0.3s' }}>
                <span style={{ color: 'var(--primary)' }}>node{src}</span>
                <span style={{ color: 'var(--ink-3)' }}>.next</span>
                <span style={{ color: 'var(--ink-3)' }}>=</span>
                <span style={{ color: tgt === 'null' ? 'var(--hard)' : 'var(--ink)', fontWeight: 900 }}>{tgt}</span>
                <span style={{ color: 'var(--ink-3)' }}>;</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: '2px solid var(--line)', paddingTop: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink-3)', marginBottom: 8, fontFamily: 'var(--sans)' }}>HEAD Traversal</div>
        <div style={{ background: goalAchieved ? '#E8FFF4' : '#F0F4FF', border: `3px solid ${goalAchieved ? '#A8E6CE' : '#BDD0FF'}`, borderRadius: 14, padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: goalAchieved ? '#00664A' : '#2C5282', wordBreak: 'break-all', lineHeight: 1.7 }}>
          {(() => {
            const arr = []; let cur = 'head'; const vis = new Set();
            while (cur && !vis.has(cur)) { arr.push(cur); vis.add(cur); cur = pointers[cur]; }
            if (cur && cur !== 'null') arr.push(`(Loop: ${cur})`);
            else if (cur === 'null') arr.push('null');
            return arr.join(' → ');
          })()}
        </div>
      </div>
    </div>
  );

  // ─── RIGHT PANEL: PROGRESS ────────────────────────────────────────────────
  const renderProgressPanel = () => {
    const totalSteps = steps.length;
    const pct = totalSteps <= 1 ? 100 : Math.min(100, Math.round((currentStepIdx / (totalSteps - 1)) * 100));
    return (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 900, color: 'var(--ink-2)', marginBottom: 8, fontFamily: 'var(--sans)' }}>
            <span>Overall Progress</span>
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--secondary)' }}>{currentStepIdx} / {totalSteps}</span>
          </div>
          <div style={{ height: 8, background: 'rgba(165,94,234,0.1)', borderRadius: 100, overflow: 'hidden', border: '2px solid rgba(165,94,234,0.12)' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--secondary), var(--easy))', borderRadius: 100, width: `${pct}%`, transition: 'width 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}/>
          </div>
        </div>

        {technique === 'iterative' && currentHint && currentHint.iter > 0 && (
          <div style={{ background: '#F8F9FA', border: '3px solid var(--line)', borderRadius: 14, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink-3)', marginBottom: 8, fontFamily: 'var(--sans)' }}>Current Iteration</div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ flex: 1, height: 6, borderRadius: 100, background: i < currentHint.iter ? 'var(--easy)' : i === currentHint.iter ? 'var(--secondary)' : '#DFE6E9', transition: 'background 0.3s' }}/>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: 'var(--ink-2)' }}>
              Iteration {currentHint.iter} / 5 · Sub-step {currentHint.sub + 1} / 4
            </div>
          </div>
        )}

        {technique === 'recursive' && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink-3)', marginBottom: 8, fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={11}/> Call Stack
            </div>
            {currentStepIdx < steps.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {getCallStackFrames(currentStepIdx).map((frameNum, i, arr) => {
                  const isActive = frameNum === getActiveFrame(currentStepIdx);
                  return (
                    <div key={frameNum} style={{ padding: '8px 12px', borderRadius: 12, border: `2.5px solid ${isActive ? 'var(--secondary)' : 'var(--line)'}`, background: isActive ? '#F3ECFF' : '#F8F9FA', color: isActive ? 'var(--secondary)' : 'var(--ink-2)', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, marginLeft: `${(arr.length - 1 - i) * 8}px`, transition: 'all 0.5s', boxShadow: isActive ? '0 3px 0 var(--secondary-shadow)' : '0 2px 0 var(--line-heavy)' }}>
                      <span style={{ color: 'var(--ink-3)' }}>reverseList(</span>
                      <span style={{ color: isActive ? 'var(--primary)' : 'var(--ink)', fontWeight: 900 }}>node{frameNum}</span>
                      <span style={{ color: 'var(--ink-3)' }}>)</span>
                      {i === 0 && isActive && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--secondary)', fontFamily: 'var(--sans)', fontWeight: 900 }}>← executing</span>}
                      {frameNum === 5 && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--easy)', fontFamily: 'var(--sans)', fontWeight: 900 }}>← base</span>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 16, fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', fontFamily: 'var(--sans)' }}>
                All frames unwound ✓
              </div>
            )}
          </div>
        )}

        <div>
          <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink-3)', marginBottom: 8, fontFamily: 'var(--sans)' }}>All Steps</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {steps.map((step, i) => {
              const done   = i < currentStepIdx;
              const active = i === currentStepIdx;
              const reached = done || active;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 10, borderLeft: `3px solid ${active ? 'var(--primary)' : done ? 'var(--easy)' : 'transparent'}`, background: active ? '#FFF3CD' : done ? '#F0FBF6' : 'transparent', transition: 'all 0.3s' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, background: reached ? 'var(--easy)' : '#F1F2F6', color: reached ? '#FFF' : 'var(--ink-3)', border: `2px solid ${reached ? '#0A7A5D' : 'var(--line)'}`, fontFamily: 'var(--sans)' }}>
                    {reached ? '✓' : i + 1}
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: active ? '#9A7400' : done ? '#00664A' : 'var(--ink-3)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {step.code}
                  </span>
                  {'iter' in step && step.iter > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 900, color: active ? 'var(--primary)' : 'var(--ink-3)', fontFamily: 'var(--sans)' }}>i{step.iter}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ─── RIGHT PANEL: AWARDS ──────────────────────────────────────────────────
  const renderAwardsPanel = () => (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink-3)', marginBottom: 4, fontFamily: 'var(--sans)' }}>
        {achievements.size} / {ACHIEVEMENTS_DEF.length} Unlocked
      </div>
      {ACHIEVEMENTS_DEF.map(a => {
        const unlocked = achievements.has(a.id);
        const s = BADGE_STYLE[a.color];
        return (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 18, border: `3px solid ${unlocked ? s.border : 'var(--line)'}`, background: unlocked ? s.bg : '#F8F9FA', boxShadow: unlocked ? `0 4px 0 ${s.shadow}` : '0 3px 0 var(--shadow-color)', opacity: unlocked ? 1 : 0.5, transition: 'all 0.3s' }}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>{a.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: unlocked ? s.color : 'var(--ink-3)', fontFamily: 'var(--sans)' }}>{a.name}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 700, color: unlocked ? s.color : 'var(--ink-3)', opacity: 0.75, fontFamily: 'var(--sans)' }}>{a.desc}</p>
            </div>
            {unlocked
              ? <CheckCircle size={16} style={{ color: s.color, flexShrink: 0 }}/>
              : <Lock size={14} style={{ color: 'var(--ink-3)', flexShrink: 0 }}/>
            }
          </div>
        );
      })}
    </div>
  );

  // ─── GAME CARD ────────────────────────────────────────────────────────────
  const renderGameCard = () => {
    const tech = getTechniqueBadge(technique);
    const hint = currentHint;
    const totalSteps = steps.length;
    const pct = totalSteps <= 1 ? 100 : Math.min(100, Math.round((currentStepIdx / (totalSteps - 1)) * 100));
    const codeLines = technique === 'iterative' ? ITER_CODE_LINES : REC_CODE_LINES;

    return (
      <div style={{
        background: 'var(--card)', borderRadius: 28,
        border: '4px solid #FFF', boxShadow: '0 8px 0 var(--shadow-color)',
        overflow: 'hidden',
        animation: 'sandboxFadeUp 0.35s cubic-bezier(0.175,0.885,0.32,1.275)',
      }}>
        {/* Progress header */}
        <div style={{
          background: 'linear-gradient(135deg, #F3ECFF 0%, #FFF0FF 100%)',
          padding: '12px 18px', borderBottom: '3px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--ink-2)', fontFamily: 'var(--sans)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Step {Math.min(currentStepIdx + 1, totalSteps)} of {totalSteps}
              </span>
              <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--secondary)', fontFamily: 'var(--mono)' }}>
                {gameScore} pts
              </span>
            </div>
            <div style={{ height: 7, background: 'rgba(165,94,234,0.1)', borderRadius: 100, overflow: 'hidden', border: '2px solid rgba(165,94,234,0.12)' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--secondary), var(--easy))', borderRadius: 100, width: `${pct}%`, transition: 'width 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}/>
            </div>
          </div>
        </div>

        {/* Technique banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px',
          background: tech.bg, borderBottom: `2px solid ${tech.border}`,
        }}>
          <span style={{ fontSize: 15 }}>{tech.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 900, color: tech.color, fontFamily: 'var(--sans)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            {tech.label}
          </span>
        </div>

        {/* Question text */}
        <div style={{ padding: '14px 18px 0' }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: 'var(--ink)', lineHeight: 1.5, fontFamily: 'var(--sans)' }}>
            {hint ? getQuestionText(hint) : '🎉 All steps done!'}
          </p>
        </div>

        {/* Code block with active line highlight */}
        {hint && (
          <div style={{ padding: '10px 18px 2px' }}>
            <div style={{ background: '#2D3436', borderRadius: 14, overflow: 'hidden', border: '3px solid #1E2528' }}>
              {codeLines.map((line, i) => {
                const isActive = line.key !== null && hint.code.includes(line.key);
                return (
                  <div key={i} style={{
                    padding: '2px 14px',
                    background: isActive ? 'rgba(254,202,87,0.12)' : 'transparent',
                    borderLeft: `3px solid ${isActive ? '#FECA57' : 'transparent'}`,
                    fontFamily: 'var(--mono)', fontSize: 11.5,
                    color: isActive ? '#FECA57' : '#7F8C8D',
                    fontWeight: isActive ? 900 : 500,
                    whiteSpace: 'pre',
                    lineHeight: 1.9,
                  }}>
                    {line.text}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Keep Pattern + Hint area */}
        {hint && (
          <div style={{ padding: '10px 18px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Keep Pattern button — only on repeated step codes */}
            {seenCodes.has(hint.code) && gamePhase === 'question' && (
              <button onClick={handleKeepPattern} className="sandbox-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 900,
                padding: '8px 16px', borderRadius: 100, cursor: 'pointer',
                border: '3px solid #00B4D8', background: '#E0F7FA',
                color: '#006B8E', boxShadow: '0 3px 0 #0096B7',
                display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
              }}>
                <span>⚡ Keep Pattern</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: 0.75, background: 'rgba(0,107,142,0.1)', padding: '1px 8px', borderRadius: 6 }}>
                  {hint.code}
                </span>
              </button>
            )}

            {/* Hint toggle */}
            {!gameHintShown ? (
              <button onClick={() => setGameHintShown(true)} className="sandbox-btn-press" style={{
                fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 900,
                padding: '8px 16px', borderRadius: 100, cursor: 'pointer',
                border: '3px solid #FECA57', background: '#FFFBF0',
                color: '#9A7400', boxShadow: '0 3px 0 #D49B1C',
                display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
              }}>
                💡 Show Hint
              </button>
            ) : (
              <div style={{
                background: '#FFFBF0', border: '3px solid #FECA57',
                borderRadius: 14, padding: '10px 14px',
                display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#9A7400', lineHeight: 1.6, fontFamily: 'var(--sans)' }}>
                  {hint.desc}
                  {hint.iter > 0 && <span style={{ display: 'block', marginTop: 4, fontFamily: 'var(--mono)', fontSize: 11, color: '#B07800' }}>Iteration {hint.iter} / 5</span>}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ─── COMPLETION SCREEN ────────────────────────────────────────────────────
  const renderCompletionScreen = () => {
    const totalSteps = steps.length;
    const ratio = gameScore / totalSteps;
    const stars = ratio === 1 ? 3 : ratio >= 0.7 ? 2 : 1;

    return (
      <div style={{
        height: 520,
        background: 'linear-gradient(135deg, #E8FFF4 0%, #F0FFF8 50%, #FAFFFD 100%)',
        border: '4px solid #A8E6CE', borderRadius: 28,
        boxShadow: '0 8px 0 rgba(0,196,140,0.15)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 22, padding: 32, textAlign: 'center',
        animation: 'sandboxFadeUp 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
      }}>
        <div style={{ fontSize: 60, lineHeight: 1 }}>🎉</div>

        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#00664A', letterSpacing: '-0.02em' }}>
            Algorithm Complete!
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: 14, fontWeight: 700, color: '#00966A' }}>
            You reversed the linked list using the {technique} approach!
          </p>
        </div>

        {/* Score card */}
        <div style={{
          background: '#FFF', border: '4px solid #A8E6CE', borderRadius: 24,
          padding: '18px 36px', boxShadow: '0 6px 0 rgba(0,150,100,0.15)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3].map(i => (
              <Star key={i} size={28} style={{
                color: i <= stars ? '#FECA57' : '#DFE6E9',
                fill: i <= stars ? '#FECA57' : 'none',
              }}/>
            ))}
          </div>
          <div style={{ fontSize: 38, fontWeight: 900, color: '#00664A', fontFamily: 'var(--mono)', lineHeight: 1 }}>
            {gameScore}<span style={{ fontSize: 22, color: '#00966A' }}> / {totalSteps}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#00966A' }}>
            first-try correct answers
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={resetGame}
            className="sandbox-btn-press"
            style={{
              fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 900,
              padding: '12px 24px', borderRadius: 100, cursor: 'pointer',
              border: '3px solid #68D391', background: 'var(--easy)',
              color: '#FFF', boxShadow: '0 5px 0 var(--easy-shadow)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
            <RotateCcw size={15}/> Play Again
          </button>
          <button
            onClick={() => { setMode('free'); resetGame(); }}
            className="sandbox-btn-press"
            style={{
              fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 900,
              padding: '12px 24px', borderRadius: 100, cursor: 'pointer',
              border: '3px solid var(--line)', background: 'var(--card)',
              color: 'var(--ink)', boxShadow: '0 5px 0 var(--shadow-color)',
            }}>
            🔓 Free Mode
          </button>
        </div>
      </div>
    );
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{ fontFamily: 'var(--sans)', color: 'var(--ink)', userSelect: 'none', overflowX: 'hidden', padding: '24px 24px 48px' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handleGlobalPointerUp}
      onMouseLeave={handleGlobalPointerUp}
    >
      <style>{`
        @keyframes sandboxPulseDot {
          0%,100% { box-shadow: 0 0 0 3px rgba(254,202,87,0.35); }
          50%      { box-shadow: 0 0 0 8px rgba(254,202,87,0.12); }
        }
        @keyframes sandboxSlideIn {
          from { transform: translateX(120px) scale(0.9); opacity: 0; }
          to   { transform: translateX(0)    scale(1);   opacity: 1; }
        }
        @keyframes sandboxFadeUp {
          from { transform: scale(0.94) translateY(10px); opacity: 0; }
          to   { transform: scale(1)    translateY(0);    opacity: 1; }
        }
        .sandbox-btn-press:active { transform: translateY(3px) !important; box-shadow: none !important; }
      `}</style>

      {/* ── ACHIEVEMENT TOAST ─────────────────────────────────────────────── */}
      {toastAchievement && (() => {
        const a = ACHIEVEMENTS_DEF.find(x => x.id === toastAchievement);
        const s = a ? BADGE_STYLE[a.color] : null;
        return a ? (
          <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 24, background: s.bg, border: `4px solid ${s.border}`, boxShadow: `0 8px 0 ${s.shadow}`, animation: 'sandboxSlideIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>{a.icon}</span>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: s.color, opacity: 0.7 }}>Achievement Unlocked</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: s.color }}>{a.name}</p>
            </div>
          </div>
        ) : null;
      })()}

      {/* ── TUTORIAL MODAL ────────────────────────────────────────────────── */}
      {showTutorial && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(45,52,54,0.45)', backdropFilter: 'blur(6px)' }}>
          <div style={{ background: 'var(--card)', borderRadius: 32, border: '4px solid #FFF', boxShadow: '0 20px 0 rgba(45,52,54,0.2)', maxWidth: 680, width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'sandboxFadeUp 0.35s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
            <div style={{ background: 'linear-gradient(135deg, #FFF7F0 0%, #FFF0FF 55%, #F0F4FF 100%)', padding: '18px 24px', borderBottom: '3px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <HelpCircle size={22} style={{ color: 'var(--secondary)' }}/> How to Play
              </h2>
              <button onClick={() => setShowTutorial(false)} style={{ background: '#F1F2F6', border: '3px solid var(--line)', borderRadius: 100, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink-2)', boxShadow: '0 3px 0 var(--line-heavy)' }}>
                <X size={15}/>
              </button>
            </div>
            <div style={{ padding: 24, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { icon: <MousePointer2 size={18}/>, accent: '#F3ECFF', accentColor: 'var(--secondary)', title: 'Drag Pointers',   text: 'Grab the glowing dot on any node to rewire its connection.' },
                { icon: <Zap size={18}/>,           accent: '#FFF3CD', accentColor: '#9A7400',         title: 'Game Mode',       text: 'Answer step-by-step questions by dragging the correct pointer.' },
                { icon: <Activity size={18}/>,      accent: '#E8FFF4', accentColor: 'var(--easy)',     title: 'Active Track',    text: 'Nodes stay alive as long as a variable references them.' },
                { icon: <Trash2 size={18}/>,        accent: '#FFE4E4', accentColor: 'var(--hard)',     title: 'Garbage Zone',    text: 'Nodes with no incoming links fall here — memory leak!' },
                { icon: <AlertTriangle size={18}/>, accent: '#FFF3CD', accentColor: '#9A7400',         title: 'Cycle Detection', text: 'If a pointer points backward, an infinite loop is created.' },
                { icon: <Trophy size={18}/>,        accent: '#F3ECFF', accentColor: 'var(--secondary)', title: 'Achievements',   text: 'Complete both algorithms and bonus challenges to collect badges.' },
                { icon: <GitBranch size={18}/>,     accent: '#F3ECFF', accentColor: 'var(--secondary)', title: 'Recursive Mode', text: 'Watch the call stack unwind as you reverse the list recursively.' },
                { icon: <Shield size={18}/>,        accent: '#E8FFF4', accentColor: 'var(--easy)',     title: 'Difficulty',      text: 'In Free mode: Beginner blocks wrong moves, Advanced is free.' },
              ].map(({ icon, accent, accentColor, title, text }) => (
                <div key={title} style={{ padding: '14px 16px', borderRadius: 20, background: '#F8F9FA', border: '3px solid var(--line)', boxShadow: '0 4px 0 var(--shadow-color)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: accent, color: accentColor }}>
                    {icon}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: 'var(--ink)' }}>{title}</h4>
                    <p style={{ margin: '3px 0 0', fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', lineHeight: 1.55 }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MAX-WIDTH WRAPPER ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1150, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── HEADER CARD ─────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF7F0 0%, #FFF0FF 55%, #F0F4FF 100%)',
          borderRadius: 32, border: '4px solid #FFF', boxShadow: '0 8px 0 var(--shadow-color)',
          padding: '16px 24px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{mode === 'game' ? '🎮' : '🧩'}</span>
              {mode === 'game' ? 'Pointer Game' : 'Pointer Sandbox'}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
              {mode === 'game'
                ? 'Answer each step to guide the algorithm forward'
                : 'Drag pointers on the canvas to reverse the linked list'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 'auto', alignItems: 'center' }}>

            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: 0, background: '#F1F2F6', borderRadius: 100, padding: 3, border: '2px solid var(--line)' }}>
              {[['free', '🔓 Free'], ['game', '🎮 Game']].map(([m, label]) => (
                <button key={m} onClick={() => { setMode(m); resetGame(); }} className="sandbox-btn-press" style={{
                  fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900,
                  padding: '7px 16px', borderRadius: 100, border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: mode === m ? 'var(--primary)' : 'transparent',
                  color: mode === m ? '#FFF' : 'var(--ink-2)',
                  boxShadow: mode === m ? '0 3px 0 var(--primary-shadow)' : 'none',
                }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Technique toggle */}
            <div style={{ display: 'flex', gap: 0, background: '#F1F2F6', borderRadius: 100, padding: 3, border: '2px solid var(--line)' }}>
              {['iterative', 'recursive'].map(t => (
                <button key={t} onClick={() => setTechnique(t)} className="sandbox-btn-press" style={{
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

            {/* Difficulty toggle (free mode only) */}
            {mode === 'free' && (
              <div style={{ display: 'flex', gap: 0, background: '#F1F2F6', borderRadius: 100, padding: 3, border: '2px solid var(--line)' }}>
                {[
                  ['beginner',     'var(--easy)',   '#0A7A5D',                '#FFF'],
                  ['intermediate', 'var(--medium)', 'var(--medium-shadow)',   '#7A5000'],
                  ['advanced',     'var(--hard)',   'var(--hard-shadow)',     '#FFF'],
                ].map(([d, bg, shadow, tc]) => (
                  <button key={d} onClick={() => setDifficulty(d)} className="sandbox-btn-press" style={{
                    fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 900,
                    padding: '7px 14px', borderRadius: 100, border: 'none', cursor: 'pointer',
                    textTransform: 'capitalize', transition: 'all 0.15s',
                    background: difficulty === d ? bg : 'transparent',
                    color: difficulty === d ? tc : 'var(--ink-2)',
                    boxShadow: difficulty === d ? `0 3px 0 ${shadow}` : 'none',
                  }}>
                    {d}
                  </button>
                ))}
              </div>
            )}

            {/* Help */}
            <button onClick={() => setShowTutorial(true)} className="sandbox-btn-press" style={{
              fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900,
              padding: '9px 16px', borderRadius: 100,
              border: '3px solid #EDD9FF', background: '#F3ECFF',
              color: 'var(--secondary)', cursor: 'pointer',
              boxShadow: '0 4px 0 rgba(165,94,234,0.2)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <HelpCircle size={14}/> Help
            </button>

            {/* Reset */}
            <button onClick={resetGame} className="sandbox-btn-press" style={{
              fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 900,
              padding: '9px 16px', borderRadius: 100,
              border: '3px solid var(--line)', background: 'var(--card)',
              color: 'var(--ink)', cursor: 'pointer',
              boxShadow: '0 4px 0 var(--shadow-color)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <RotateCcw size={14}/> Reset
            </button>
          </div>
        </div>

        {/* ── TWO COLUMN GRID ──────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* GAME CARD (game mode, not complete) */}
            {mode === 'game' && gamePhase !== 'complete' && renderGameCard()}

            {/* STATUS CARD (free mode only) */}
            {mode === 'free' && (
              <div style={{
                background: goalAchieved
                  ? 'linear-gradient(135deg, #E8FFF4 0%, #F0FBF6 100%)'
                  : 'linear-gradient(160deg, #FDFAFF 0%, #F7F0FF 65%, #FFF6EB 100%)',
                borderRadius: 28,
                border: `3px solid ${goalAchieved ? '#A8E6CE' : '#EDD9FF'}`,
                boxShadow: goalAchieved ? '0 8px 0 rgba(0,196,140,0.15)' : '0 8px 0 rgba(165,94,234,0.12)',
                padding: '16px 20px',
                display: 'flex', flexDirection: 'column', gap: 12,
                animation: 'sandboxFadeUp 0.35s cubic-bezier(0.175,0.885,0.32,1.275)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: goalAchieved ? '#E8FFF4' : '#F3ECFF', border: `2px solid ${goalAchieved ? '#68D391' : '#C9A0F7'}`, color: goalAchieved ? 'var(--easy)' : 'var(--secondary)' }}>
                    {goalAchieved ? <CheckCircle size={22}/> : <Info size={22}/>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
                      {goalAchieved ? '🎉 Mission Accomplished!' : 'Mission: Reverse the Linked List'}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                      {goalAchieved
                        ? 'Outstanding! The list is now 5 → 4 → 3 → 2 → 1 → null.'
                        : difficulty === 'beginner'
                        ? 'Drag the yellow-glowing dot and follow the hint step by step.'
                        : 'Rewire all node pointers so the list reads 5 → 4 → 3 → 2 → 1 → null.'}
                    </p>
                  </div>
                </div>

                {currentHint && !goalAchieved && difficulty !== 'advanced' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#FFFBF0', border: '3px solid #FECA57', borderRadius: 16, padding: '12px 14px', boxShadow: '0 3px 0 #D49B1C' }}>

                    {/* Movement indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#D49B1C', fontFamily: 'var(--sans)', flexShrink: 0 }}>
                        Drag
                      </span>
                      <span style={{
                        background: 'var(--primary)', color: '#FFF',
                        fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 900,
                        padding: '3px 11px', borderRadius: 10,
                        boxShadow: '0 3px 0 var(--primary-shadow)',
                        letterSpacing: '0.2px',
                      }}>
                        {currentHint.from}
                      </span>
                      <ArrowRight size={16} style={{ color: '#D49B1C', flexShrink: 0 }}/>
                      <span style={{
                        background: currentHint.to === 'null' ? 'var(--hard)' : 'var(--easy)', color: '#FFF',
                        fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 900,
                        padding: '3px 11px', borderRadius: 10,
                        boxShadow: `0 3px 0 ${currentHint.to === 'null' ? 'var(--hard-shadow)' : 'var(--easy-shadow)'}`,
                        letterSpacing: '0.2px',
                      }}>
                        {currentHint.to}
                      </span>
                      {'iter' in currentHint && currentHint.iter > 0 && (
                        <span style={{ fontSize: 10, fontWeight: 900, color: '#9A7400', background: '#FFF3CD', padding: '2px 8px', borderRadius: 100, marginLeft: 'auto', flexShrink: 0 }}>
                          Iter {currentHint.iter}
                        </span>
                      )}
                    </div>

                    {/* Code line */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Zap size={12} style={{ color: '#D49B1C', flexShrink: 0 }}/>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: '#9A7400' }}>
                        {currentHint.code}
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#B07800', lineHeight: 1.55 }}>
                      {currentHint.desc}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CYCLE WARNING */}
            {cycleNode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#FFF3CD', border: '3px solid #FECA57', borderRadius: 20, padding: '12px 18px', boxShadow: '0 5px 0 #D49B1C' }}>
                <AlertTriangle size={20} style={{ color: '#D49B1C', flexShrink: 0 }}/>
                <div>
                  <strong style={{ fontSize: 14, fontWeight: 900, color: '#9A7400' }}>Infinite Loop Detected!</strong>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#9A7400', marginLeft: 8 }}>
                    A pointer is pointing backward, creating a cycle.
                  </span>
                </div>
              </div>
            )}

            {/* CANVAS or COMPLETION SCREEN */}
            {mode === 'game' && gamePhase === 'complete'
              ? renderCompletionScreen()
              : (
              <div style={{
                background: '#F8F9FA',
                backgroundImage: 'radial-gradient(circle, #DFE6E9 1.5px, transparent 1.5px)',
                backgroundSize: '22px 22px',
                border: '4px solid var(--line)',
                borderRadius: 28,
                boxShadow: 'inset 0 4px 0 rgba(0,0,0,0.03), 0 8px 0 var(--shadow-color)',
                height: 520,
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Zone labels */}
                <div style={{ position:'absolute', top:10, left:18, fontSize:11, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.7px', color:'rgba(165,94,234,0.55)', display:'flex', alignItems:'center', gap:5, pointerEvents:'none' }}>
                  <Database size={11}/> Scope Variables
                </div>
                <div style={{ position:'absolute', top:124, left:0, right:0, height:2, background:'linear-gradient(90deg, transparent, rgba(165,94,234,0.22), transparent)', pointerEvents:'none' }}/>
                <div style={{ position:'absolute', top:132, left:18, fontSize:11, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.7px', color:'rgba(255,159,67,0.6)', display:'flex', alignItems:'center', gap:5, pointerEvents:'none' }}>
                  <Activity size={11}/> Active Nodes Track
                </div>
                <div style={{ position:'absolute', top:322, left:0, right:0, bottom:0, background:'repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,107,107,0.04) 10px,rgba(255,107,107,0.04) 20px)', pointerEvents:'none' }}/>
                <div style={{ position:'absolute', top:320, left:0, right:0, height:2, background:'linear-gradient(90deg, transparent, rgba(255,107,107,0.4), transparent)', pointerEvents:'none' }}/>
                <div style={{ position:'absolute', top:328, left:18, fontSize:11, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.7px', color:'rgba(255,107,107,0.5)', display:'flex', alignItems:'center', gap:5, pointerEvents:'none' }}>
                  <Trash2 size={11}/> Garbage Zone
                </div>

                {/* SVG arrows */}
                <svg ref={svgRef} style={{ width:'100%', height:'100%', position:'absolute', inset:0, zIndex:10, touchAction:'none' }}>
                  <defs>
                    <marker id="sb-ah"     markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#B2BEC3"/></marker>
                    <marker id="sb-ah-var" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#A55EEA"/></marker>
                    <marker id="sb-ah-nod" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#FF9F43"/></marker>
                    <marker id="sb-ah-drg" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#FECA57"/></marker>
                  </defs>

                  {ALL_NODES.map(src => {
                    const tgt = pointers[src];
                    if (!tgt || src === 'null' || dragging?.from === src) return null;
                    const isVar = VARIABLES.includes(src);
                    return (
                      <path key={`a-${src}`} d={drawArrow(src, tgt)} fill="none"
                        stroke={isVar ? '#A55EEA' : '#FF9F43'} strokeWidth="2.5" strokeLinecap="round"
                        markerEnd={isVar ? 'url(#sb-ah-var)' : 'url(#sb-ah-nod)'}
                        style={{ transition: 'all 0.5s ease-in-out', pointerEvents: 'none' }}/>
                    );
                  })}

                  {dragging && (
                    <path d={drawArrow(null, null, true)} fill="none" stroke="#FECA57"
                      strokeWidth="2.5" strokeDasharray="6,5" strokeLinecap="round"
                      markerEnd="url(#sb-ah-drg)"
                      style={{ pointerEvents:'none', filter:'drop-shadow(0 0 6px rgba(254,202,87,0.65))' }}/>
                  )}
                </svg>

                {/* Nodes */}
                {ALL_NODES.map(nodeId => {
                  const pos       = positions[nodeId];
                  const isNull    = nodeId === 'null';
                  const isVar     = VARIABLES.includes(nodeId);
                  const isHinted  = !goalAchieved && currentHint?.from === nodeId;
                  const isTarget  = dragging && currentHint?.from === dragging.from && nodeId === currentHint?.to;
                  const draggable = canDrag(nodeId);
                  const isGarbage = !isNull && !isVar && pos.y > 250;

                  let nodeBase = {
                    position: 'absolute', zIndex: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 80, transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                    opacity: isGarbage ? 0.35 : 1,
                    cursor: 'default',
                  };

                  let style;
                  if (isNull) {
                    style = { ...nodeBase, height: 50, borderRadius: 100, background: '#EAECEE', border: '2px solid var(--line)', color: 'var(--ink-3)', fontStyle: 'italic', fontSize: 13, fontWeight: 700 };
                  } else if (isVar) {
                    let bg = '#F3ECFF', bc = '#C9A0F7', sh = 'rgba(165,94,234,0.22)', tc = 'var(--secondary)';
                    if (isHinted && !dragging) { bg = '#FFF3CD'; bc = '#FECA57'; sh = '#D49B1C'; tc = '#9A7400'; }
                    if (dragging?.from === nodeId) { bg = '#FFF3CD'; bc = '#FECA57'; sh = '#D49B1C'; tc = '#9A7400'; }
                    style = { ...nodeBase, height: 40, borderRadius: 100, background: bg, border: `3px solid ${bc}`, color: tc, fontWeight: 900, fontSize: 13, boxShadow: `0 4px 0 ${sh}` };
                  } else {
                    let bg = '#FFF', bc = 'var(--line)', sh = 'var(--shadow-color)';
                    if (isHinted && !dragging) { bg = '#FFF3CD'; bc = '#FECA57'; sh = '#D49B1C'; }
                    else if (isTarget) { bg = '#E8FFF4'; bc = 'var(--easy)'; sh = 'var(--easy-shadow)'; }
                    style = { ...nodeBase, height: 50, borderRadius: 18, background: bg, border: `3px solid ${bc}`, color: 'var(--ink)', fontWeight: 900, fontSize: 20, boxShadow: `0 5px 0 ${sh}` };
                  }

                  const dotPulse = isHinted && !dragging ? 'sandboxPulseDot 1.6s ease-in-out infinite' : 'none';

                  return (
                    <div key={nodeId} style={style} onPointerUp={e => handlePointerUp(e, nodeId)}>
                      <span style={{ fontFamily: isVar || isNull ? 'var(--sans)' : 'var(--mono)', letterSpacing: isVar ? '0.2px' : 0, pointerEvents: 'none' }}>
                        {isNull ? 'null' : nodeId}
                      </span>
                      {!isNull && (
                        <div
                          onPointerDown={e => handlePointerDown(e, nodeId)}
                          style={{
                            position: 'absolute',
                            width: 18, height: 18, borderRadius: '50%',
                            border: '2.5px solid #FFF',
                            cursor: !draggable ? 'not-allowed' : dragging?.from === nodeId ? 'grabbing' : 'grab',
                            transition: 'transform 0.15s, background 0.15s',
                            ...(isVar
                              ? { bottom: -9, left: '50%', transform: 'translateX(-50%)' }
                              : { right: -9, top: '50%', transform: 'translateY(-50%)' }
                            ),
                            background: !draggable ? '#DFE6E9'
                              : (dragging?.from === nodeId || isHinted) ? '#FECA57'
                              : isVar ? 'var(--secondary)'
                              : 'var(--primary)',
                            opacity: !draggable ? 0.3 : 1,
                            animation: dotPulse,
                            boxShadow: (isHinted && !dragging) ? '0 0 0 3px rgba(254,202,87,0.35)' : '0 2px 4px rgba(0,0,0,0.18)',
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* GAME FEEDBACK (below canvas) */}
            {mode === 'game' && gamePhase === 'correct' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#E8FFF4', border: '3px solid #68D391', borderRadius: 20,
                padding: '12px 18px', boxShadow: '0 5px 0 var(--easy-shadow)',
                animation: 'sandboxFadeUp 0.25s ease',
              }}>
                <CheckCircle size={20} style={{ color: 'var(--easy)', flexShrink: 0 }}/>
                <div>
                  <strong style={{ fontSize: 14, fontWeight: 900, color: '#00664A' }}>Correct!</strong>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#00664A', marginLeft: 8 }}>
                    {gameTries === 0 ? '+1 point — first try!' : 'Keep going!'}
                  </span>
                </div>
              </div>
            )}

            {mode === 'game' && gamePhase === 'wrong' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#FFF5F5', border: '3px solid #FEB2B2', borderRadius: 20,
                padding: '12px 18px', boxShadow: '0 5px 0 rgba(192,57,43,0.2)',
                animation: 'sandboxFadeUp 0.25s ease',
              }}>
                <AlertTriangle size={20} style={{ color: 'var(--hard)', flexShrink: 0 }}/>
                <div>
                  <strong style={{ fontSize: 14, fontWeight: 900, color: '#C53030' }}>Not quite!</strong>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#C53030', marginLeft: 8 }}>
                    Try again — drag the highlighted node to the right target.
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────────────── */}
          <div style={{
            background: 'var(--card)', borderRadius: 32,
            border: '4px solid #FFF', boxShadow: '0 8px 0 var(--shadow-color)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            position: 'sticky', top: 20, maxHeight: 620,
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #FFF7F0 0%, #FFF0FF 55%, #F0F4FF 100%)',
              borderBottom: '3px solid var(--line)', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flexShrink: 0,
            }}>
              {[
                { key: 'code',     icon: <Code2 size={13}/>,   label: 'Code'     },
                { key: 'progress', icon: <Layers size={13}/>,  label: 'Progress' },
                { key: 'awards',   icon: <Trophy size={13}/>,  label: achievements.size > 0 ? `Awards (${achievements.size})` : 'Awards' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setRightTab(tab.key)} className="sandbox-btn-press" style={{
                  fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 900,
                  padding: '8px 14px', borderRadius: 100, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.1s',
                  background: rightTab === tab.key ? 'var(--secondary)' : '#F1F2F6',
                  color: rightTab === tab.key ? '#FFF' : 'var(--ink-2)',
                  boxShadow: rightTab === tab.key ? '0 3px 0 var(--secondary-shadow)' : '0 3px 0 var(--line-heavy)',
                }}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {rightTab === 'code'     && renderCodePanel()}
              {rightTab === 'progress' && renderProgressPanel()}
              {rightTab === 'awards'   && renderAwardsPanel()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
