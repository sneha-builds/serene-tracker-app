import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

export function PomodoroTimer() {
  const { isTimerRunning, setIsTimerRunning, setTokenBalance, userId } = useStore();
  
  // Custom duration defaults to 25 minutes
  const [customDuration, setCustomDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isBreak, setIsBreak] = useState(false);
  
  const [inputH, setInputH] = useState(0);
  const [inputM, setInputM] = useState(25);
  const [inputS, setInputS] = useState(0);

  // Sync inputs to custom duration when they change
  useEffect(() => {
    if (!isTimerRunning && !isBreak) {
      const newDuration = inputH * 3600 + inputM * 60 + inputS;
      setCustomDuration(newDuration);
      setTimeLeft(newDuration);
    }
  }, [inputH, inputM, inputS, isTimerRunning, isBreak]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timeLeft === 0) {
      setIsTimerRunning(false);
      handleComplete();
    }
    
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleComplete = async () => {
    if (!isBreak) {
      // Completed a focus session
      try {
        setTokenBalance(5); // Optimistically add 5 tokens to whatever balance is there
      } catch (err) {
        console.error("Failed to claim pomodoro reward", err);
      }
      
      // Start 5 min break
      setIsBreak(true);
      setTimeLeft(5 * 60);
    } else {
      // Completed break
      setIsBreak(false);
      setTimeLeft(customDuration);
    }
  };

  const toggleTimer = () => {
    if (!isTimerRunning && customDuration === 0 && !isBreak) return; // Prevent starting with 0
    setIsTimerRunning(!isTimerRunning);
  };
  
  const resetTimer = () => {
    setIsTimerRunning(false);
    setIsBreak(false);
    setTimeLeft(customDuration);
  };

  const displayHours = Math.floor(timeLeft / 3600);
  const displayMinutes = Math.floor((timeLeft % 3600) / 60);
  const displaySeconds = timeLeft % 60;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
          {isBreak ? 'Cooling Down' : 'Focus Engine'}
        </h3>
        {isTimerRunning && (
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isBreak ? 'bg-blue-400' : 'bg-cyan-400'} animate-pulse`}></div>
            <span className={`text-[9px] font-mono ${isBreak ? 'text-blue-300' : 'text-cyan-300'} uppercase`}>Active</span>
          </div>
        )}
      </div>

      <div className="text-center mb-4">
        {!isTimerRunning && !isBreak ? (
          <div className="flex justify-center items-center gap-1 text-3xl font-mono font-bold tracking-wider text-white">
            <input 
              type="number" min="0" max="99" 
              className="w-12 bg-white/5 text-center focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded border border-white/10 hover:bg-white/10 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={inputH.toString().padStart(2, '0')} 
              onChange={(e) => setInputH(Math.min(99, Math.max(0, parseInt(e.target.value) || 0)))}
            />
            <span>:</span>
            <input 
              type="number" min="0" max="59" 
              className="w-12 bg-white/5 text-center focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded border border-white/10 hover:bg-white/10 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={inputM.toString().padStart(2, '0')} 
              onChange={(e) => setInputM(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
            />
            <span>:</span>
            <input 
              type="number" min="0" max="59" 
              className="w-12 bg-white/5 text-center focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded border border-white/10 hover:bg-white/10 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={inputS.toString().padStart(2, '0')} 
              onChange={(e) => setInputS(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
            />
          </div>
        ) : (
          <div className={`text-4xl font-mono font-bold tracking-wider ${isBreak ? 'text-blue-300' : 'text-white'}`}>
            {displayHours > 0 && `${displayHours.toString().padStart(2, '0')}:`}
            {displayMinutes.toString().padStart(2, '0')}:{displaySeconds.toString().padStart(2, '0')}
          </div>
        )}
        {!isBreak && (
          <div className="text-[10px] text-white/50 mt-1 uppercase font-mono tracking-widest">
            Reward: 5 Credits
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={toggleTimer}
          disabled={!isTimerRunning && customDuration === 0 && !isBreak}
          className={`flex-1 py-2 rounded-lg text-xs font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isTimerRunning 
              ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30' 
              : 'bg-cyan-500/80 hover:bg-cyan-500 text-white border border-cyan-400/50 backdrop-blur-md'
          }`}
        >
          {isTimerRunning ? 'HALT' : 'IGNITE'}
        </button>
        <button
          onClick={resetTimer}
          className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white/70 hover:text-white transition-colors flex items-center justify-center active:scale-95"
          title="Reset"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </button>
      </div>
    </div>
  );
}
