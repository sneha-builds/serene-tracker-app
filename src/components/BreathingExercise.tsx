import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const setGuideState = useStore(state => state.setGuideState);

  // 4-7-8 Breathing Technique
  const phases = {
    inhale: { duration: 4, next: 'hold' as const, label: 'Inhale' },
    hold: { duration: 7, next: 'exhale' as const, label: 'Hold' },
    exhale: { duration: 8, next: 'inhale' as const, label: 'Exhale' }
  };

  useEffect(() => {
    let timer: number;
    if (isActive) {
      if (timeLeft > 0) {
        timer = window.setTimeout(() => setTimeLeft(l => l - 1), 1000);
      } else {
        if (phase === 'idle') {
          setPhase('inhale');
          setTimeLeft(phases.inhale.duration);
        } else {
          const nextPhase = phases[phase].next;
          setPhase(nextPhase);
          setTimeLeft(phases[nextPhase].duration);
        }
      }
    }
    return () => clearTimeout(timer);
  }, [isActive, timeLeft, phase]);

  const toggleBreathing = () => {
    if (isActive) {
      setIsActive(false);
      setPhase('idle');
      setTimeLeft(0);
      setGuideState('hovering');
    } else {
      setIsActive(true);
      setGuideState('heavy_breathing');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9C8.8 1 15.2 1 19.1 4.9C23 8.8 23 15.2 19.1 19.1C15.2 23 8.8 23 4.9 19.1Z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
          Mindful Breathing
        </h3>
        {isActive && (
          <div className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-[9px] border border-cyan-500/30 font-bold backdrop-blur-md">
            4-7-8 CYCLE
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center py-4 relative h-24">
        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg font-bold text-cyan-300 tracking-widest uppercase mb-1"
              >
                {phase !== 'idle' ? phases[phase].label : ''}
              </motion.div>
              <div className="text-3xl font-mono text-white">
                {timeLeft}s
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-white/50 text-center px-4"
            >
              Take a moment to center yourself and reduce stress.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={toggleBreathing}
        className={`w-full py-3 rounded-lg text-xs font-bold shadow-lg active:scale-95 transition-all mt-2 border ${
          isActive
            ? 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30'
            : 'bg-cyan-500/80 hover:bg-cyan-500 text-white border-cyan-400/50 backdrop-blur-md'
        }`}
      >
        {isActive ? 'END EXERCISE' : 'START BREATHING'}
      </button>
    </div>
  );
}
