import React, { useState, useEffect } from 'react';

const OPERATIONS = {
  find: {
    id: 'find',
    title: 'Find a Node',
    description: 'Find the node with value 3.',
    codeTemplate: [
      { line: "function findNode(head, target) {", isChallenge: false },
      { line: "  let curr = head;", isChallenge: true, correctAnswer: "let curr = head;", options: ["let curr = null;", "let curr = head;", "let head = curr;"] },
      { line: "  while (curr !== null) {", isChallenge: true, correctAnswer: "while (curr !== null) {", options: ["if (curr === null) {", "while (curr.next !== null) {", "while (curr !== null) {"] },
      { line: "    if (curr.value === target) return curr;", isChallenge: false },
      { line: "    curr = curr.next;", isChallenge: true, correctAnswer: "curr = curr.next;", options: ["curr.next = curr;", "curr = curr.next;", "curr = next;"] },
      { line: "  }", isChallenge: false },
      { line: "  return null;", isChallenge: false },
      { line: "}", isChallenge: false }
    ],
    vis: [
      { step: 0, line: 0, msg: "Start findNode function. Target is 3.", ptrs: {}, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
      { step: 1, line: 1, msg: "Initialize curr to head.", ptrs: { head: 'n1', curr: 'n1' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
      { step: 2, line: 2, msg: "Check condition: curr (1) !== null. True.", ptrs: { head: 'n1', curr: 'n1' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
      { step: 3, line: 3, msg: "Check if curr.value (1) === target (3). False.", ptrs: { head: 'n1', curr: 'n1' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
      { step: 4, line: 4, msg: "Move curr to curr.next.", ptrs: { head: 'n1', curr: 'n2' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
      { step: 5, line: 2, msg: "Check condition: curr (2) !== null. True.", ptrs: { head: 'n1', curr: 'n2' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
      { step: 6, line: 3, msg: "Check if curr.value (2) === target (3). False.", ptrs: { head: 'n1', curr: 'n2' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
      { step: 7, line: 4, msg: "Move curr to curr.next.", ptrs: { head: 'n1', curr: 'n3' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
      { step: 8, line: 2, msg: "Check condition: curr (3) !== null. True.", ptrs: { head: 'n1', curr: 'n3' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
      { step: 9, line: 3, msg: "Check if curr.value (3) === target (3). True! Return curr.", ptrs: { head: 'n1', curr: 'n3' }, highlight: 'n3', layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
    ]
  },
  insert: {
    id: 'insert',
    title: 'Insert a Node',
    description: 'Insert value 3 after node with value 2.',
    codeTemplate: [
      { line: "function insertAfter(head, target, val) {", isChallenge: false },
      { line: "  let curr = head;", isChallenge: false },
      { line: "  while (curr.value !== target) {", isChallenge: true, correctAnswer: "while (curr.value !== target) {", options: ["while (curr.value === target) {", "while (curr.next === target) {", "while (curr.value !== target) {"] },
      { line: "    curr = curr.next;", isChallenge: false },
      { line: "  }", isChallenge: false },
      { line: "  let newNode = { value: val, next: null };", isChallenge: true, correctAnswer: "let newNode = { value: val, next: null };", options: ["let newNode = { value: val, next: null };", "let newNode = curr.next;", "let newNode = null;"] },
      { line: "  newNode.next = curr.next;", isChallenge: true, correctAnswer: "newNode.next = curr.next;", options: ["curr.next = newNode.next;", "newNode.next = curr.next;", "newNode = curr.next;"] },
      { line: "  curr.next = newNode;", isChallenge: true, correctAnswer: "curr.next = newNode;", options: ["curr = newNode;", "newNode.next = curr;", "curr.next = newNode;"] },
      { line: "}", isChallenge: false }
    ],
    vis: [
      { step: 0, line: 0, msg: "Start insertAfter. Target is 2, new value is 3.", ptrs: {}, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n4'}, n4: {x:300, y:0, val: 4, next: 'null'}, null: {x:450, y:0, val: 'null', isNull: true} } },
      { step: 1, line: 1, msg: "Initialize curr to head.", ptrs: { head: 'n1', curr: 'n1' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n4'}, n4: {x:300, y:0, val: 4, next: 'null'}, null: {x:450, y:0, val: 'null', isNull: true} } },
      { step: 2, line: 2, msg: "Check condition: curr.value (1) !== target (2). True.", ptrs: { head: 'n1', curr: 'n1' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n4'}, n4: {x:300, y:0, val: 4, next: 'null'}, null: {x:450, y:0, val: 'null', isNull: true} } },
      { step: 3, line: 3, msg: "Move curr to curr.next.", ptrs: { head: 'n1', curr: 'n2' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n4'}, n4: {x:300, y:0, val: 4, next: 'null'}, null: {x:450, y:0, val: 'null', isNull: true} } },
      { step: 4, line: 2, msg: "Check condition: curr.value (2) !== target (2). False. Loop ends.", ptrs: { head: 'n1', curr: 'n2' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n4'}, n4: {x:300, y:0, val: 4, next: 'null'}, null: {x:450, y:0, val: 'null', isNull: true} } },
      { step: 5, line: 5, msg: "Create a new node with value 3.", ptrs: { head: 'n1', curr: 'n2', newNode: 'n3' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n4'}, n4: {x:300, y:0, val: 4, next: 'null'}, null: {x:450, y:0, val: 'null', isNull: true}, n3: {x:150, y:120, val: 3, next: null} } },
      { step: 6, line: 6, msg: "Point newNode's next to curr's next (4).", ptrs: { head: 'n1', curr: 'n2', newNode: 'n3' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n4'}, n4: {x:300, y:0, val: 4, next: 'null'}, null: {x:450, y:0, val: 'null', isNull: true}, n3: {x:150, y:120, val: 3, next: 'n4'} } },
      { step: 7, line: 7, msg: "Point curr's next to the newNode.", ptrs: { head: 'n1', curr: 'n2', newNode: 'n3' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n4: {x:300, y:0, val: 4, next: 'null'}, null: {x:450, y:0, val: 'null', isNull: true}, n3: {x:150, y:120, val: 3, next: 'n4'} } },
      { step: 8, line: 8, msg: "Insertion complete! Layout settles.", ptrs: { head: 'n1', curr: 'n2', newNode: 'n3' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
    ]
  },
  delete: {
    id: 'delete',
    title: 'Delete a Node',
    description: 'Delete the node with value 3.',
    codeTemplate: [
      { line: "function deleteNode(head, target) {", isChallenge: false },
      { line: "  let curr = head;", isChallenge: false },
      { line: "  while (curr.next.value !== target) {", isChallenge: true, correctAnswer: "while (curr.next.value !== target) {", options: ["while (curr.value !== target) {", "while (curr.next.value !== target) {", "if (curr.next === target) {"] },
      { line: "    curr = curr.next;", isChallenge: false },
      { line: "  }", isChallenge: false },
      { line: "  let toDelete = curr.next;", isChallenge: true, correctAnswer: "let toDelete = curr.next;", options: ["let toDelete = curr;", "let toDelete = curr.next;", "let toDelete = head;"] },
      { line: "  curr.next = toDelete.next;", isChallenge: true, correctAnswer: "curr.next = toDelete.next;", options: ["curr = toDelete.next;", "curr.next = toDelete.next;", "toDelete.next = curr;"] },
      { line: "  toDelete.next = null;", isChallenge: true, correctAnswer: "toDelete.next = null;", options: ["toDelete = null;", "toDelete.next = curr;", "toDelete.next = null;"] },
      { line: "}", isChallenge: false }
    ],
    vis: [
      { step: 0, line: 0, msg: "Start deleteNode. Target is 3.", ptrs: {}, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
      { step: 1, line: 1, msg: "Initialize curr to head.", ptrs: { head: 'n1', curr: 'n1' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
      { step: 2, line: 2, msg: "Check if curr.next.value (2) !== target (3). True.", ptrs: { head: 'n1', curr: 'n1' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
      { step: 3, line: 3, msg: "Move curr to curr.next.", ptrs: { head: 'n1', curr: 'n2' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
      { step: 4, line: 2, msg: "Check if curr.next.value (3) !== target (3). False. Loop ends.", ptrs: { head: 'n1', curr: 'n2' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
      { step: 5, line: 5, msg: "Identify node to delete (curr.next).", ptrs: { head: 'n1', curr: 'n2', toDelete: 'n3' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n3'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
      { step: 6, line: 6, msg: "Bypass toDelete: curr.next = toDelete.next.", ptrs: { head: 'n1', curr: 'n2', toDelete: 'n3' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n4'}, n3: {x:300, y:0, val: 3, next: 'n4'}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
      { step: 7, line: 7, msg: "Sever toDelete's connection: toDelete.next = null.", ptrs: { head: 'n1', curr: 'n2', toDelete: 'n3' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n4'}, n3: {x:300, y:0, val: 3, next: null}, n4: {x:450, y:0, val: 4, next: 'null'}, null: {x:600, y:0, val: 'null', isNull: true} } },
      { step: 8, line: 8, msg: "Node deleted. Layout settles.", ptrs: { head: 'n1', curr: 'n2' }, layout: { n1: {x:0, y:0, val: 1, next: 'n2'}, n2: {x:150, y:0, val: 2, next: 'n4'}, n3: {x:300, y:120, val: 3, next: null, isDeleted: true}, n4: {x:300, y:0, val: 4, next: 'null'}, null: {x:450, y:0, val: 'null', isNull: true} } },
    ]
  }
};

export default function LinkedListOpsGame() {
  const [activeTab, setActiveTab] = useState('find');
  const [gameState, setGameState] = useState('coding'); // 'coding' or 'visualizing'
  
  const currentOp = OPERATIONS[activeTab];
  const challengeLines = currentOp.codeTemplate.map((c, i) => ({ ...c, originalIndex: i })).filter(c => c.isChallenge);
  
  const [userCode, setUserCode] = useState(currentOp.codeTemplate.map(c => c.isChallenge ? "" : c.line));
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });
  
  const [visStep, setVisStep] = useState(0);

  // Reset state when tab changes
  useEffect(() => {
    const newOp = OPERATIONS[activeTab];
    setGameState('coding');
    setUserCode(newOp.codeTemplate.map(c => c.isChallenge ? "" : c.line));
    setCurrentChallengeIndex(0);
    setVisStep(0);
    setFeedback({ show: false, message: '', type: '' });
  }, [activeTab]);

  const handleCodeSelection = (selectedOption) => {
    if (gameState !== 'coding') return;
    
    const currentChallenge = challengeLines[currentChallengeIndex];

    if (selectedOption === currentChallenge.correctAnswer) {
      const newUserCode = [...userCode];
      newUserCode[currentChallenge.originalIndex] = selectedOption;
      setUserCode(newUserCode);
      
      setFeedback({ show: true, message: 'Correct!', type: 'success' });
      
      setTimeout(() => {
        setFeedback({ show: false, message: '', type: '' });
        if (currentChallengeIndex < challengeLines.length - 1) {
          setCurrentChallengeIndex(prev => prev + 1);
        } else {
          setGameState('visualizing');
          setFeedback({ show: true, message: 'Code complete! Ready to visualize.', type: 'info' });
          setTimeout(() => setFeedback({ show: false, message: '', type: '' }), 3000);
        }
      }, 800);
    } else {
      setFeedback({ show: true, message: 'Oops! Try again.', type: 'error' });
      setTimeout(() => setFeedback({ show: false, message: '', type: '' }), 1500);
    }
  };

  const handleNextVisStep = () => {
    if (visStep < currentOp.vis.length - 1) setVisStep(prev => prev + 1);
  };

  const handlePrevVisStep = () => {
    if (visStep > 0) setVisStep(prev => prev - 1);
  };

  const handleReset = () => {
    setGameState('coding');
    setUserCode(currentOp.codeTemplate.map(c => c.isChallenge ? "" : c.line));
    setCurrentChallengeIndex(0);
    setVisStep(0);
    setFeedback({ show: false, message: '', type: '' });
  };

  const currentChallenge = challengeLines[currentChallengeIndex];
  const currentVisState = currentOp.vis[visStep] || currentOp.vis[0];
  const layout = currentVisState.layout;
  const ptrs = currentVisState.ptrs || {};

  const renderSVGPaths = () => {
    const paths = [];
    Object.keys(layout).forEach(nodeId => {
      const node = layout[nodeId];
      if (node.next && layout[node.next]) {
        const targetNode = layout[node.next];
        const startX = node.x + 80; // Right edge of node (width 80)
        const startY = node.y + 32; // Center Y of node (height 64)
        const endX = targetNode.x - 10; // Left edge of target minus arrow offset
        const endY = targetNode.y + 32;

        let d = "";
        if (startY === endY) {
            // Straight line
            d = `M ${startX} ${startY} L ${endX} ${endY}`;
        } else {
            // Curved line for bypassing or dropping down
            d = `M ${startX} ${startY} C ${startX + 40} ${startY}, ${endX - 40} ${endY}, ${endX} ${endY}`;
        }

        paths.push(
          <path 
            key={`${nodeId}-${node.next}`} 
            d={d} 
            stroke="#cbd5e1" 
            strokeWidth="3" 
            fill="none" 
            markerEnd="url(#arrowhead)"
            className="transition-all duration-700 ease-in-out"
          />
        );
      }
    });
    return paths;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-6 px-4 sm:py-10 sm:px-6 md:px-8 font-sans text-slate-800">
      <div className="max-w-6xl w-full flex flex-col gap-6">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Linked List Operations
            </h1>
            <div className="flex bg-slate-200/60 p-1 rounded-xl w-max">
                {['find', 'insert', 'delete'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg font-semibold text-sm capitalize transition-all duration-200 ${
                            activeTab === tab 
                            ? 'bg-white text-blue-700 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/80'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
          </div>
          <button 
                onClick={handleReset} 
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl shadow-sm transition-all focus:outline-none flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Restart Level
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Editor & Challenge */}
            <div className="lg:col-span-5 flex flex-col gap-6">
                
                <div className="bg-[#1e1e1e] rounded-2xl shadow-xl overflow-hidden border border-slate-700/50 flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-black/20">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        </div>
                        <div className="text-slate-400 text-xs font-mono tracking-wider">{activeTab}.js</div>
                    </div>
                    <div className="p-4 sm:p-6 font-mono text-sm leading-relaxed overflow-x-auto relative">
                        {currentOp.codeTemplate.map((lineDef, index) => {
                            const isCurrentBlank = gameState === 'coding' && lineDef.isChallenge && currentChallenge?.originalIndex === index;
                            const isCompletedBlank = gameState === 'coding' && lineDef.isChallenge && userCode[index] !== "";
                            const isActiveInVis = gameState === 'visualizing' && currentVisState.line === index;

                            let displayLine = userCode[index];
                            if (isCurrentBlank) displayLine = "  // <- Complete code below";

                            return (
                                <div 
                                    key={index} 
                                    className={`flex rounded px-2 py-1 transition-all duration-300 ${
                                        isActiveInVis ? 'bg-[#37373d] border-l-[3px] border-yellow-400' : 
                                        isCurrentBlank ? 'bg-[#2a2d3e] border-l-[3px] border-blue-400 animate-pulse' :
                                        'border-l-[3px] border-transparent hover:bg-[#2a2a2a]'
                                    }`}
                                >
                                    <span className="w-6 text-right pr-4 text-slate-500 select-none opacity-50">{index + 1}</span>
                                    <span className={`whitespace-pre ${
                                        isCurrentBlank ? 'text-blue-300/80 italic' :
                                        isCompletedBlank ? 'text-green-300 font-bold' :
                                        displayLine.includes('function') || displayLine.includes('while') || displayLine.includes('if') || displayLine.includes('return') ? 'text-purple-400' :
                                        displayLine.includes('let ') ? 'text-blue-400' :
                                        displayLine.includes('null') ? 'text-orange-400' :
                                        'text-slate-300'
                                    }`}>
                                        {displayLine}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Challenge UI */}
                <div className="relative">
                    {gameState === 'coding' && currentChallenge ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 sm:p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center">
                                <span className="bg-blue-100 text-blue-700 rounded-md w-8 h-8 flex items-center justify-center mr-3 text-sm">
                                    {currentChallenge.originalIndex + 1}
                                </span>
                                Select the correct code:
                            </h3>
                            <div className="flex flex-col gap-2.5">
                                {currentChallenge.options.map((opt, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handleCodeSelection(opt)}
                                        className="text-left font-mono text-sm bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-3.5 rounded-xl transition-all duration-200 text-slate-700 hover:text-blue-700 group flex items-center justify-between"
                                    >
                                        <span>{opt}</span>
                                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                         <div className={`bg-slate-100 rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center text-center h-48 transition-opacity duration-500 ${gameState === 'coding' ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            <p className="font-medium text-slate-500 mb-2">Code completed!</p>
                            <p className="text-sm text-slate-400">Proceed to visualization.</p>
                         </div>
                    )}

                    {/* Feedback Toast */}
                    <div className={`absolute -top-12 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform ${feedback.show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
                         <div className={`px-6 py-2.5 rounded-full shadow-xl font-semibold flex items-center text-sm whitespace-nowrap ${
                            feedback.type === 'success' ? 'bg-green-500 text-white' :
                            feedback.type === 'error' ? 'bg-red-500 text-white' :
                            'bg-blue-600 text-white'
                        }`}>
                            {feedback.message}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`lg:col-span-7 flex flex-col gap-6 transition-all duration-500 ${gameState === 'coding' ? 'opacity-40 pointer-events-none grayscale-[30%]' : 'opacity-100'}`}>
                
                {/* Visualizer Controls */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex-1 bg-blue-50 text-blue-800 px-4 py-3 rounded-xl text-sm font-medium flex items-center border border-blue-100 min-h-[52px]">
                        <svg className="w-5 h-5 mr-3 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className="line-clamp-2 leading-tight">
                            {gameState === 'visualizing' ? currentVisState.msg : "Complete the code to unlock."}
                        </span>
                    </div>
                    <div className="flex space-x-2 p-1 sm:p-0">
                        <button 
                            onClick={handlePrevVisStep} 
                            disabled={visStep === 0 || gameState !== 'visualizing'}
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400 text-slate-600 font-semibold rounded-xl transition-all"
                        >
                            Back
                        </button>
                        <button 
                            onClick={handleNextVisStep} 
                            disabled={visStep === currentOp.vis.length - 1 || gameState !== 'visualizing'}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl shadow-sm transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* Main Canvas Area */}
                <div className="relative bg-white rounded-3xl border border-slate-200 p-4 flex-1 min-h-[500px] shadow-sm flex flex-col group overflow-hidden">
                    
                    {/* Grid Background */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.1]" 
                         style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                    </div>
                    
                    <div className="absolute top-4 left-6 text-[11px] font-bold text-slate-400 tracking-widest uppercase flex items-center bg-white/90 px-2 py-1 rounded">
                        Memory Layout
                    </div>

                    {/* Scrollable Container for Nodes */}
                    <div className="w-full h-full overflow-x-auto overflow-y-hidden custom-scrollbar pt-20 pb-10">
                        {/* Interactive Area */}
                        <div className="relative min-w-[750px] h-[350px] mx-auto pt-[60px] pl-[60px]">
                            
                            {/* SVG Layer for Links */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                                <defs>
                                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
                                    </marker>
                                </defs>
                                {renderSVGPaths()}
                            </svg>

                            {/* Pointers Layer */}
                            {Object.entries(ptrs).map(([name, targetId]) => {
                                const targetNode = layout[targetId];
                                if (!targetNode) return null;
                                
                                // Slight offset for multiple pointers on same node
                                let xOffset = 0;
                                if (name === 'curr') xOffset = 15;
                                if (name === 'newNode') xOffset = -15;

                                return (
                                    <div 
                                        key={`ptr-${name}`}
                                        className="absolute z-30 flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                                        style={{ 
                                            left: `${targetNode.x + 40 + xOffset}px`, 
                                            top: `${targetNode.y - 55}px`,
                                            transform: 'translateX(-50%)'
                                        }}
                                    >
                                        <div className={`
                                            font-bold py-1 px-3 rounded-lg shadow-sm text-xs tracking-wide border
                                            ${name === 'head' ? 'bg-purple-100 border-purple-300 text-purple-700' : ''}
                                            ${name === 'curr' ? 'bg-blue-600 border-blue-700 text-white shadow-md z-40' : ''}
                                            ${name === 'newNode' ? 'bg-green-100 border-green-300 text-green-700' : ''}
                                            ${name === 'toDelete' ? 'bg-red-100 border-red-300 text-red-700' : ''}
                                        `}>
                                            {name}
                                        </div>
                                        <div className={`w-0.5 h-6 ${name === 'curr' ? 'bg-blue-600' : 'bg-slate-300 border-dashed border-l-2 border-slate-400 bg-transparent'}`}></div>
                                        {name === 'curr' && <div className="w-2 h-2 bg-blue-600 rotate-45 -mt-1 rounded-sm"></div>}
                                    </div>
                                );
                            })}

                            {/* Nodes Layer */}
                            {Object.entries(layout).map(([nodeId, node]) => {
                                const isHighlighted = currentVisState.highlight === nodeId;
                                
                                return (
                                    <div 
                                        key={nodeId}
                                        className={`absolute z-20 flex items-center justify-center w-20 h-16 rounded-2xl border-2 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                                            ${node.isNull 
                                                ? 'bg-slate-50 border-slate-200 text-slate-400 font-mono italic shadow-inner' 
                                                : isHighlighted
                                                    ? 'bg-yellow-50 border-yellow-400 text-slate-800 scale-110 shadow-[0_0_20px_rgba(250,204,21,0.4)] ring-4 ring-yellow-400/20'
                                                    : node.isDeleted
                                                        ? 'bg-slate-100 border-slate-300 text-slate-400 opacity-50 grayscale'
                                                        : 'bg-white border-slate-300 text-slate-700 shadow-sm hover:border-blue-300'
                                            }
                                        `}
                                        style={{ 
                                            left: `${node.x}px`, 
                                            top: `${node.y}px`,
                                            opacity: node.isDeleted && visStep === currentOp.vis.length - 1 ? 0.3 : 1
                                        }}
                                    >
                                        <span className="text-2xl font-bold font-mono">
                                            {node.val}
                                        </span>
                                        
                                        {!node.isNull && (
                                            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 bg-white flex items-center justify-center border-slate-300">
                                                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 20px; }
        .group:hover .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; }
      `}} />
    </div>
  );
}