import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

export function BalloonCanvas() {
  const { tasks } = useStore();

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      ></div>
      
      {tasks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-white/30 font-mono text-sm tracking-widest uppercase">
          No active tasks. Sky is clear.
        </div>
      )}

      {tasks.filter(t => t.id && t.altitude !== undefined).map((task, index) => {
        const isSafe = task.altitude > 50;
        const isWarning = task.altitude > 20 && task.altitude <= 50;
        const isDanger = task.altitude <= 20;

        let borderColor = 'border-cyan-500';
        let bgColor = 'bg-cyan-500/20';
        let shadow = 'shadow-[0_0_30px_rgba(6,182,212,0.3)]';
        let textColor = 'text-cyan-300';
        
        if (isWarning) {
          borderColor = 'border-indigo-500';
          bgColor = 'bg-indigo-500/20';
          shadow = 'shadow-[0_0_30px_rgba(99,102,241,0.3)]';
          textColor = 'text-indigo-300';
        } else if (isDanger) {
          borderColor = 'border-orange-500';
          bgColor = 'bg-orange-500/30';
          shadow = 'shadow-[0_0_40px_rgba(249,115,22,0.4)]';
          textColor = 'text-orange-400';
        }

        return (
          <motion.div
            key={task.id}
            className="absolute left-0 right-0 flex justify-center"
            initial={{ bottom: '100%' }}
            animate={{ bottom: `${Math.max(5, task.altitude)}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            style={{ 
              left: `${((index % 5) * 15) + 10}%`,
              zIndex: Math.round(100 - task.altitude)
            }}
          >
            <div className="relative flex flex-col items-center">
              {/* Balloon */}
              <div className={`w-24 h-24 ${bgColor} border-2 ${borderColor} rounded-full flex flex-col items-center justify-center p-4 relative ${shadow} backdrop-blur-sm transition-all duration-500`}>
                <span className="text-[10px] text-white font-bold text-center leading-tight line-clamp-2">{task.title}</span>
                <span className={`text-[9px] ${textColor} font-mono mt-1 ${isDanger ? 'animate-pulse' : ''}`}>
                  {isDanger ? 'DANGER ZONE' : `${Math.round(task.altitude)}% ALT`}
                </span>
              </div>
              {/* String */}
              <div className="w-px h-32 bg-white/20"></div>
            </div>
          </motion.div>
        );
      })}
      
      {/* Danger Zone Overlay Hint */}
      <div className="absolute bottom-0 w-full h-[20%] bg-gradient-to-t from-orange-500/10 to-transparent pointer-events-none border-t border-orange-500/20"></div>
      
      {/* Telemetry Overlay Hint (From design) */}
      <div className="absolute bottom-8 right-8 text-right pointer-events-none">
        <div className="text-[10px] text-white/30 uppercase tracking-tighter">Keystroke Density</div>
        <div className="flex items-end justify-end gap-1 mt-2">
          <div className="w-1 bg-cyan-500 h-2 animate-[pulse_2s_ease-in-out_infinite]"></div>
          <div className="w-1 bg-cyan-500 h-4 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
          <div className="w-1 bg-cyan-500 h-3 animate-[pulse_1.8s_ease-in-out_infinite]"></div>
          <div className="w-1 bg-cyan-500 h-6 animate-[pulse_1.2s_ease-in-out_infinite]"></div>
          <div className="w-1 bg-cyan-500 h-8 animate-[pulse_1.4s_ease-in-out_infinite]"></div>
          <div className="w-1 bg-white/20 h-2"></div>
          <div className="w-1 bg-white/20 h-1"></div>
        </div>
      </div>
    </div>
  );
}
