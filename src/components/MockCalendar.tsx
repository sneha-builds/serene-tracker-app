import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export function MockCalendar() {
  const { tasks } = useStore();
  const [isSynced, setIsSynced] = useState(false);

  // Group tasks by upcoming days for visual representation
  const scheduledTasks = tasks
    .filter(t => t.ai_scheduled_time || t.deadline_adjusted)
    .sort((a, b) => {
      const dateA = a.ai_scheduled_time ? new Date(a.ai_scheduled_time).getTime() : new Date(a.deadline_adjusted).getTime();
      const dateB = b.ai_scheduled_time ? new Date(b.ai_scheduled_time).getTime() : new Date(b.deadline_adjusted).getTime();
      return dateA - dateB;
    })
    .slice(0, 5);

  return (
    <div className="mt-6 border border-white/20 bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 border-b border-white/20 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/70 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Calendar Sync
        </h3>
        
        <button 
          onClick={() => setIsSynced(!isSynced)}
          className={`px-3 py-1 text-[10px] font-mono rounded border transition-colors ${
            isSynced 
              ? 'bg-green-500/20 text-green-300 border-green-500/30' 
              : 'bg-white/5 text-white/50 border-white/20 hover:border-white/40 hover:text-white'
          }`}
        >
          {isSynced ? 'SYNCED' : 'LOCAL ONLY'}
        </button>
      </div>

      <div className="p-4 space-y-3">
        {scheduledTasks.length === 0 ? (
          <p className="text-xs text-white/40 font-mono text-center py-2">No scheduled events</p>
        ) : (
          scheduledTasks.map(task => {
            const date = task.ai_scheduled_time ? new Date(task.ai_scheduled_time) : new Date(task.deadline_adjusted);
            const isCompleted = task.status === 'COMPLETED';
            return (
              <div key={task.id} className={`flex items-start gap-3 ${isCompleted ? 'opacity-40' : ''}`}>
                <div className="shrink-0 flex flex-col items-center justify-center w-10 h-10 rounded bg-white/10 border border-white/20 shadow-sm backdrop-blur-sm">
                  <span className="text-[9px] font-bold text-cyan-300 uppercase">{date.toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-xs font-mono text-white">{date.getDate()}</span>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="text-xs text-white font-medium truncate">{task.title}</div>
                  <div className="text-[10px] text-white/50 font-mono">
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {task.ai_scheduled_time ? ' (AI Scheduled)' : ' (Deadline)'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>


    </div>
  );
}
