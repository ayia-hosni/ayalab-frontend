import React, { useState, useEffect, useRef } from 'react';

const initialNodes = [
  { id: 'n1', value: 1, next: 'n2' },
  { id: 'n2', value: 2, next: 'n3' },
  { id: 'n3', value: 3, next: 'n4' },
  { id: 'n4', value: 4, next: 'n5' },
  { id: 'n5', value: 5, next: 'null' },
  { id: 'null', value: 'null', next: null, isNull: true }
];

// The "correct" code structure
const codeTemplate = [
  { line: "function traverseList(head) {", isChallenge: false },
  { line: "  let curr = head;", isChallenge: true, correctAnswer: "let curr = head;", options: ["let curr = null;", "let curr = head;", "let head = curr;"] },
  { line: "  while (curr !== null) {", isChallenge: true, correctAnswer: "while (curr !== null) {", options: ["if (curr == null) {", "while (curr.next !== null) {", "while (curr !== null) {"] },
  { line: "    console.log(curr.value);", isChallenge: false },
  { line: "    curr = curr.next;", isChallenge: true, correctAnswer: "curr = curr.next;", options: ["curr = next.curr;", "curr = curr.next;", "curr.next = curr;"] },
  { line: "  }", isChallenge: false },
  { line: "}", isChallenge: false }
];

// The sequence of steps for the visualization *after* code is written
const visualizationSequence = [
  { activeLine: 0, curr: null, msg: "Start traversal function." },
  { activeLine: 1, curr: 'n1', msg: "Initialize 'curr' pointer to 'head'." },
  { activeLine: 2, curr: 'n1', msg: "Check condition: curr ('n1') !== null. True." },
  { activeLine: 3, curr: 'n1', msg: "Process node 1.", log: 1 },
  { activeLine: 4, curr: 'n2', msg: "Move 'curr' to curr.next ('n2')." },
  { activeLine: 2, curr: 'n2', msg: "Check condition: curr ('n2') !== null. True." },
  { activeLine: 3, curr: 'n2', msg: "Process node 2.", log: 2 },
  { activeLine: 4, curr: 'n3', msg: "Move 'curr' to curr.next ('n3')." },
  { activeLine: 2, curr: 'n3', msg: "Check condition: curr ('n3') !== null. True." },
  { activeLine: 3, curr: 'n3', msg: "Process node 3.", log: 3 },
  { activeLine: 4, curr: 'n4', msg: "Move 'curr' to curr.next ('n4')." },
  { activeLine: 2, curr: 'n4', msg: "Check condition: curr ('n4') !== null. True." },
  { activeLine: 3, curr: 'n4', msg: "Process node 4.", log: 4 },
  { activeLine: 4, curr: 'n5', msg: "Move 'curr' to curr.next ('n5')." },
  { activeLine: 2, curr: 'n5', msg: "Check condition: curr ('n5') !== null. True." },
  { activeLine: 3, curr: 'n5', msg: "Process node 5.", log: 5 },
  { activeLine: 4, curr: 'null', msg: "Move 'curr' to curr.next ('null')." },
  { activeLine: 2, curr: 'null', msg: "Check condition: curr ('null') !== null. False. Loop ends." },
  { activeLine: 6, curr: 'null', msg: "Traversal complete." },
];

export default function LinkedListTraversalGame() {
  const [gameState, setGameState] = useState('coding'); // 'coding' or 'visualizing'
  
  // Coding State
  const [userCode, setUserCode] = useState(codeTemplate.map(c => c.isChallenge ? "" : c.line));
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0); // Which blank we are filling
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });

  // Visualization State
  const [visStep, setVisStep] = useState(0);
  const [currPointer, setCurrPointer] = useState(null);
  const [headPointer, setHeadPointer] = useState('n1');
  const [logs, setLogs] = useState([]);
  const [activeCodeLine, setActiveCodeLine] = useState(-1);

  const challengeLines = codeTemplate.map((c, i) => ({ ...c, originalIndex: i })).filter(c => c.isChallenge);
  const currentChallenge = challengeLines[currentChallengeIndex];

  const handleCodeSelection = (selectedOption) => {
    if (gameState !== 'coding' || !currentChallenge) return;

    if (selectedOption === currentChallenge.correctAnswer) {
      // Correct!
      const newUserCode = [...userCode];
      newUserCode[currentChallenge.originalIndex] = selectedOption;
      setUserCode(newUserCode);
      
      setFeedback({ show: true, message: 'Correct!', type: 'success' });
      
      setTimeout(() => {
        setFeedback({ show: false, message: '', type: '' });
        if (currentChallengeIndex < challengeLines.length - 1) {
          setCurrentChallengeIndex(prev => prev + 1);
        } else {
          // All coding challenges complete
          setGameState('visualizing');
          setFeedback({ show: true, message: 'Code complete! Let\'s visualize it.', type: 'info' });
           setTimeout(() => setFeedback({ show: false, message: '', type: '' }), 3000);
        }
      }, 1000);

    } else {
      // Incorrect
      setFeedback({ show: true, message: 'Oops! Try again.', type: 'error' });
      setTimeout(() => setFeedback({ show: false, message: '', type: '' }), 1500);
    }
  };

  useEffect(() => {
    if (gameState === 'visualizing' && visStep >= 0 && visStep < visualizationSequence.length) {
      const currentStepState = visualizationSequence[visStep];
      setActiveCodeLine(currentStepState.activeLine);
      setCurrPointer(currentStepState.curr);
      
      const newLogs = [];
      for(let i=0; i<=visStep; i++) {
          if(visualizationSequence[i].log) {
              newLogs.push(visualizationSequence[i].log);
          }
      }
      setLogs(newLogs);
    }
  }, [visStep, gameState]);

  const handleNextVisStep = () => {
    if (visStep < visualizationSequence.length - 1) {
      setVisStep(prev => prev + 1);
    }
  };

  const handlePrevVisStep = () => {
    if (visStep > 0) {
      setVisStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setGameState('coding');
    setUserCode(codeTemplate.map(c => c.isChallenge ? "" : c.line));
    setCurrentChallengeIndex(0);
    setVisStep(0);
    setActiveCodeLine(-1);
    setCurrPointer(null);
    setLogs([]);
    setFeedback({ show: false, message: '', type: '' });
  };

  // Base positions, we'll scale these visually using CSS if needed, 
  // but for absolute positioning of the pointer, relative spacing works well.
  const nodePositions = {
      'n1': 0, 'n2': 150, 'n3': 300, 'n4': 450, 'n5': 600, 'null': 750
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-6 px-4 sm:py-10 sm:px-6 md:px-8 font-sans text-slate-800">
      <div className="max-w-6xl w-full flex flex-col gap-8">
        
        { }
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
              Linked List Traversal
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              {gameState === 'coding' 
                ? "Step 1: Complete the JavaScript code." 
                : "Step 2: Visualize the execution."}
            </p>
          </div>
          <button 
                onClick={handleReset} 
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Restart
            </button>
        </div>

        { }
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Code Editor & Challenges */}
            <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Code Editor */}
                <div className="bg-[#1e1e1e] rounded-2xl shadow-xl overflow-hidden border border-slate-700/50 flex flex-col relative z-10">
                    <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-black/20">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        </div>
                        <div className="text-slate-400 text-xs font-mono font-medium tracking-wider">traverseList.js</div>
                    </div>
                    <div className="p-4 sm:p-6 font-mono text-sm leading-relaxed overflow-x-auto">
                        {codeTemplate.map((lineDef, index) => {
                            const isCurrentBlank = gameState === 'coding' && lineDef.isChallenge && currentChallenge?.originalIndex === index;
                            const isCompletedBlank = gameState === 'coding' && lineDef.isChallenge && userCode[index] !== "";
                            const isActiveInVis = gameState === 'visualizing' && activeCodeLine === index;

                            let displayLine = userCode[index];
                            if (isCurrentBlank) {
                                displayLine = "  // <- Select code snippet below";
                            }

                            return (
                                <div 
                                    key={index} 
                                    className={`flex rounded px-2 py-1.5 transition-all duration-300 ${
                                        isActiveInVis ? 'bg-[#37373d] border-l-[3px] border-yellow-400' : 
                                        isCurrentBlank ? 'bg-[#2a2d3e] border-l-[3px] border-blue-400 animate-pulse' :
                                        'border-l-[3px] border-transparent hover:bg-[#2a2a2a]'
                                    }`}
                                >
                                    <span className="w-6 text-right pr-4 text-slate-500 select-none opacity-50">{index + 1}</span>
                                    <span className={`whitespace-pre ${
                                        isCurrentBlank ? 'text-blue-300/80 italic' :
                                        isCompletedBlank ? 'text-green-300 font-bold' :
                                        displayLine.includes('function') || displayLine.includes('while') ? 'text-purple-400' :
                                        displayLine.includes('let ') ? 'text-blue-400' :
                                        displayLine.includes('curr') || displayLine.includes('head') ? 'text-sky-300' :
                                        displayLine.includes('console') ? 'text-teal-300' :
                                        'text-slate-300'
                                    }`}>
                                        {displayLine}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                { }
                {gameState === 'coding' && currentChallenge ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 sm:p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center">
                            <span className="bg-blue-100 text-blue-700 rounded-md w-8 h-8 flex items-center justify-center mr-3 text-sm">
                                {currentChallenge.originalIndex + 1}
                            </span>
                            Complete the missing line:
                        </h3>
                        <div className="flex flex-col gap-2.5">
                            {currentChallenge.options.map((opt, i) => (
                                <button 
                                    key={i}
                                    onClick={() => handleCodeSelection(opt)}
                                    className="text-left font-mono text-sm bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-3.5 rounded-xl transition-all duration-200 text-slate-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 group flex items-center justify-between"
                                >
                                    <span>{opt}</span>
                                    <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : gameState === 'coding' && (
                     <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center text-center h-48 opacity-50">
                        <svg className="w-10 h-10 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p className="font-medium text-slate-500">Code completed!</p>
                     </div>
                )}

                { }
                <div className={`transition-all duration-300 transform ${feedback.show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'} absolute bottom-8 left-1/2 -translate-x-1/2 z-50`}>
                     <div className={`px-6 py-3 rounded-full shadow-xl font-semibold flex items-center text-sm ${
                        feedback.type === 'success' ? 'bg-green-500 text-white' :
                        feedback.type === 'error' ? 'bg-red-500 text-white' :
                        'bg-blue-600 text-white'
                    }`}>
                         {feedback.type === 'success' && <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                         {feedback.type === 'error' && <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>}
                         {feedback.type === 'info' && <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        {feedback.message}
                    </div>
                </div>
            </div>

            { }
            <div className={`lg:col-span-7 flex flex-col gap-6 transition-all duration-500 ${gameState === 'coding' ? 'opacity-50 grayscale-[50%] pointer-events-none' : 'opacity-100'}`}>
                
                {/* Controls & Status for Visualization */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 overflow-hidden">
                    
                    {/* Status Message */}
                    <div className="flex-1 bg-slate-50 text-slate-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center border border-slate-100 min-h-[52px]">
                        <svg className={`w-5 h-5 mr-3 flex-shrink-0 ${gameState === 'visualizing' ? 'text-blue-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className="line-clamp-2 leading-tight">
                            {gameState === 'visualizing' ? visualizationSequence[visStep]?.msg : "Complete the code challenges to unlock visualization."}
                        </span>
                    </div>

                    {/* Step Controls */}
                    <div className="flex space-x-2 p-1 sm:p-0">
                        <button 
                            onClick={handlePrevVisStep} 
                            disabled={visStep === 0 || gameState !== 'visualizing'}
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100 text-slate-600 font-semibold rounded-xl transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-slate-300"
                        >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            Back
                        </button>
                        <button 
                            onClick={handleNextVisStep} 
                            disabled={visStep === visualizationSequence.length - 1 || gameState !== 'visualizing'}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Next
                            <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                </div>

                { }
                <div className="relative bg-white rounded-3xl border border-slate-200 p-4 sm:p-8 flex-1 min-h-[450px] overflow-hidden shadow-sm flex flex-col justify-between group">
                    
                    {/* Background Pattern */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.15]" 
                         style={{ backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}>
                    </div>
                    
                    {/* Labels */}
                    <div className="absolute top-4 sm:top-6 left-4 sm:left-8 text-[11px] font-bold text-slate-400 tracking-widest uppercase flex items-center bg-white/80 px-2 py-1 rounded backdrop-blur-sm">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                        Scope Variables
                    </div>

                    {/* Scrollable Node Area Container */}
                    <div className="w-full overflow-x-auto pb-8 pt-12 custom-scrollbar">
                        <div className="min-w-[800px] relative px-4 sm:px-12 py-10">
                            
                            { }
                            <div className="absolute top-0 left-4 sm:left-12 w-full h-16 pointer-events-none z-20">
                                {/* head Pointer */}
                                <div className="absolute flex flex-col items-center" style={{ left: `${nodePositions['n1']}px` }}>
                                    <div className="bg-purple-50 border border-purple-200 text-purple-700 font-bold py-1 px-4 rounded-xl shadow-sm text-sm tracking-wide">
                                        head
                                    </div>
                                    <svg className="absolute top-7 left-1/2 transform -translate-x-1/2 overflow-visible" width="16" height="50">
                                        <path d="M 8 0 L 8 45" stroke="#c084fc" strokeWidth="2" strokeDasharray="4 2" fill="none" />
                                        <polygon points="4,40 12,40 8,48" fill="#c084fc" />
                                    </svg>
                                </div>

                                {/* curr Pointer */}
                                <div className="absolute flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                                     style={{ 
                                        left: `${currPointer ? nodePositions[currPointer] : -100}px`,
                                        opacity: currPointer ? 1 : 0
                                     }}
                                >
                                    <div className="bg-blue-600 border border-blue-700 text-white font-bold py-1 px-4 rounded-xl shadow-md text-sm tracking-wide">
                                        curr
                                    </div>
                                    <svg className="absolute top-7 left-1/2 transform -translate-x-1/2 overflow-visible" width="16" height="50">
                                        <path d="M 8 0 L 8 45" stroke="#2563eb" strokeWidth="2.5" fill="none" />
                                        <polygon points="3,40 13,40 8,50" fill="#2563eb" />
                                    </svg>
                                </div>
                            </div>

                            { }
                            <div className="absolute top-[85px] left-4 sm:left-12 text-[10px] font-bold text-orange-400/80 tracking-widest uppercase flex items-center bg-white/80 px-2 py-0.5 rounded backdrop-blur-sm z-0">
                                Active Track
                            </div>

                            <div className="flex items-center relative z-10 pt-28">
                                {initialNodes.map((node, index) => {
                                    const isCurr = currPointer === node.id;
                                    
                                    return (
                                        <React.Fragment key={node.id}>
                                            <div className="relative" style={{ width: '80px', flexShrink: 0 }}>
                                                <div className={`
                                                    flex items-center justify-center 
                                                    w-20 h-16 rounded-2xl border-2 transition-all duration-300
                                                    ${node.isNull 
                                                        ? 'bg-slate-50 border-slate-200 text-slate-400 font-mono italic shadow-inner' 
                                                        : isCurr 
                                                            ? 'bg-yellow-50 border-yellow-400 text-slate-800 scale-110 z-20 shadow-[0_0_20px_rgba(250,204,21,0.3)] ring-4 ring-yellow-400/20' 
                                                            : 'bg-white border-slate-300 text-slate-700 shadow-sm hover:border-slate-400'
                                                    }
                                                `}>
                                                    <span className={`text-2xl font-mono ${isCurr ? 'font-black' : 'font-bold'}`}>
                                                        {node.value}
                                                    </span>
                                                    
                                                    {/* Node specific port/dot */}
                                                    {!node.isNull && (
                                                        <div className={`absolute -right-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${isCurr ? 'border-yellow-400' : 'border-slate-300'}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${isCurr ? 'bg-yellow-400' : 'bg-slate-300'}`}></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Arrow Connection */}
                                            {node.next && (
                                                <div className="flex items-center justify-center w-[70px] flex-shrink-0 z-0 relative">
                                                     <div className="w-full h-1 bg-slate-200 absolute top-1/2 -translate-y-1/2"></div>
                                                     <svg width="24" height="24" className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                                     </svg>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    { }
                    <div className="mt-4 bg-[#1e1e1e] rounded-xl p-3 sm:p-4 border border-slate-800 w-full shadow-inner flex flex-col gap-1 relative z-10">
                        <div className="flex items-center justify-between">
                             <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Console Output</span>
                             <div className="flex space-x-1.5">
                                 <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                 <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                             </div>
                        </div>
                        <div className="font-mono text-green-400 text-sm flex-1 min-h-[24px] flex items-center pt-1">
                            {logs.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {logs.map((log, i) => (
                                        <span key={i} className="animate-[fadeIn_0.3s_ease-out]">
                                            {log}{i < logs.length - 1 ? ',' : ''}
                                        </span>
                                    ))}
                                    {gameState === 'visualizing' && <span className="animate-pulse text-slate-500 ml-1 block">_</span>}
                                </div>
                            ) : (
                                <span className="text-slate-600 italic">Waiting for execution...</span>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </div>
      
      {/* CSS for custom scrollbar hidden mostly but available on hover for the canvas */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
            height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: transparent;
            border-radius: 20px;
        }
        .group:hover .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}