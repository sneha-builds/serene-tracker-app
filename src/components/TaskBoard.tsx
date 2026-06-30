import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import confetti from 'canvas-confetti';
import { db } from '../lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export function TaskBoard() {
  const { tasks, setTasks, userId } = useStore();
  const [isPlanning, setIsPlanning] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showCongrats, setShowCongrats] = useState(false);

  const handleToggle = async (id: string, completed: boolean) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: completed ? 'COMPLETED' : 'ACTIVE' } : t));

    if (completed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setShowCongrats(true);
      setTimeout(() => setShowCongrats(false), 3000);
    }

    if (userId?.startsWith('guest-')) return;

    try {
      await updateDoc(doc(db, 'tasks', id), {
        status: completed ? 'COMPLETED' : 'ACTIVE'
      });
    } catch (err) {
      console.error(err);
      setTasks(tasks.map(t => t.id === id ? { ...t, status: completed ? 'ACTIVE' : 'COMPLETED' } : t));
    }
  };

  const handleDoubleClick = (task: any) => {
    if (task.status === 'COMPLETED') return;
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const handleEditSave = async (id: string) => {
    if (!editingTitle.trim()) {
      setEditingTaskId(null);
      return;
    }
    
    // Optimistic update
    setTasks(tasks.map(t => t.id === id ? { ...t, title: editingTitle.trim() } : t));
    setEditingTaskId(null);

    if (userId?.startsWith('guest-')) return;

    try {
      await updateDoc(doc(db, 'tasks', id), {
        title: editingTitle.trim()
      });
    } catch (err) {
      console.error(err);
      // Let standard listener update on failure
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(tasks.filter(t => t.id !== id));
    
    if (userId?.startsWith('guest-')) return;

    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleEditSave(id);
    } else if (e.key === 'Escape') {
      setEditingTaskId(null);
    }
  };

  const handleAiPlan = async () => {
    if (!userId || userId.startsWith('guest-')) {
      setAiMessage('AI Planner requires an account.');
      return;
    }
    setIsPlanning(true);
    setAiMessage(null);
    try {
      const activeTasks = tasks.filter(t => t.status === 'ACTIVE');
      const res = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: activeTasks, goals: [], habits: [] })
      });
      const data = await res.json();
      
      if (data.message) setAiMessage(data.message);
      
      if (data.tasks && Array.isArray(data.tasks)) {
        for (const update of data.tasks) {
          try {
            await updateDoc(doc(db, 'tasks', update.id), {
              priority: update.priority,
              ai_scheduled_time: update.ai_scheduled_time ? new Date(update.ai_scheduled_time).toISOString() : null,
              ai_rationale: update.ai_rationale
            });
          } catch (e) {
            console.error('Failed to update task from AI plan', e);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setAiMessage('Failed to connect to AI Planner.');
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <div className="flex-1 w-full h-full p-8 overflow-y-auto custom-scrollbar relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">To Do List</h2>
          <button 
            onClick={handleAiPlan}
            disabled={isPlanning}
            className="flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/30 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all disabled:opacity-50 backdrop-blur-md"
          >
            {isPlanning ? (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            )}
            AI PLANNER
          </button>
        </div>

        {aiMessage && (
          <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-start gap-3 text-cyan-200 text-sm leading-relaxed backdrop-blur-md shadow-lg">
            <svg className="shrink-0 mt-0.5 text-cyan-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <p>{aiMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            
            const priorityBadgeStyle = 
              task.priority === 'CRITICAL' ? 'text-red-300 border-red-400/30 bg-red-500/20' :
              task.priority === 'HIGH' ? 'text-orange-300 border-orange-400/30 bg-orange-500/20' :
              'text-white/60 border-white/20 bg-white/5';

            const priorityCardStyle =
              task.priority === 'CRITICAL' && !isCompleted ? 'border-red-500/50 shadow-red-500/10 hover:border-red-400 hover:shadow-red-500/20' :
              task.priority === 'HIGH' && !isCompleted ? 'border-orange-500/50 shadow-orange-500/10 hover:border-orange-400 hover:shadow-orange-500/20' :
              'border-white/20 hover:border-cyan-400/50 hover:shadow-cyan-500/10';

            return (
              <div 
                key={task.id} 
                className={`p-5 rounded-xl border backdrop-blur-md transition-all shadow-lg ${
                  isCompleted 
                    ? 'bg-white/5 border-white/10 opacity-60' 
                    : `bg-white/10 hover:bg-white/15 hover:shadow-xl ${priorityCardStyle}`
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  {editingTaskId === task.id ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => handleEditSave(task.id)}
                      onKeyDown={(e) => handleKeyDown(e, task.id)}
                      autoFocus
                      className="flex-1 bg-white/10 border border-cyan-400/50 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans"
                    />
                  ) : (
                    <h3 
                      onDoubleClick={() => handleDoubleClick(task)}
                      className={`text-sm font-medium flex-1 ${isCompleted ? 'line-through text-white/40' : 'text-white cursor-text'}`}
                      title={!isCompleted ? "Double-click to edit" : undefined}
                    >
                      {task.title}
                    </h3>
                  )}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleDelete(task.id, e)}
                      className="shrink-0 w-6 h-6 rounded flex items-center justify-center border border-transparent text-white/30 hover:bg-red-500/20 hover:border-red-400/50 hover:text-red-400 transition-colors"
                      title="Delete task"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                    <button 
                      onClick={() => handleToggle(task.id, !isCompleted)}
                      className={`shrink-0 w-6 h-6 rounded flex items-center justify-center border transition-colors ${
                        isCompleted 
                          ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300' 
                          : 'bg-white/5 border-white/30 text-transparent hover:border-cyan-400/80 hover:text-cyan-400'
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                  </div>
                </div>
                
                {task.priority && !isCompleted && (
                  <select 
                    value={task.priority}
                    onChange={async (e) => {
                      const newPriority = e.target.value as 'CRITICAL' | 'HIGH' | 'NORMAL';
                      setTasks(tasks.map(t => t.id === task.id ? { ...t, priority: newPriority } : t));
                      
                      if (userId?.startsWith('guest-')) return;
                      
                      try {
                        await updateDoc(doc(db, 'tasks', task.id), {
                          priority: newPriority
                        });
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono mb-3 border cursor-pointer outline-none appearance-none ${priorityBadgeStyle}`}
                  >
                    <option value="NORMAL" className="bg-gray-900 text-white">NORMAL PRIORITY</option>
                    <option value="HIGH" className="bg-gray-900 text-white">HIGH PRIORITY</option>
                    <option value="CRITICAL" className="bg-gray-900 text-white">CRITICAL PRIORITY</option>
                  </select>
                )}

                {task.ai_rationale && !isCompleted && (
                  <p className="text-xs text-cyan-200/80 mb-3 italic leading-relaxed">
                    "{task.ai_rationale}"
                  </p>
                )}

                {task.ai_scheduled_time && !isCompleted ? (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span>
                      AI Scheduled: {new Date(task.ai_scheduled_time).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                ) : task.deadline_adjusted && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>
                      {new Date(task.deadline_adjusted).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          
          {tasks.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border border-dashed border-white/20 rounded-2xl bg-white/5 backdrop-blur-md shadow-lg">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/30 mb-4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              <h3 className="text-sm font-medium text-white/80 mb-1">No Active Tasks</h3>
              <p className="text-xs text-white/50">Deploy a task below to initialize your queue.</p>
            </div>
          )}
        </div>
      </div>
      
      {showCongrats && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-6 rounded-2xl shadow-2xl border border-white/20 flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white mb-3">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Congratulations!</h2>
            <p className="text-white/90 font-medium">You are amazing.</p>
          </div>
        </div>
      )}
    </div>
  );
}
