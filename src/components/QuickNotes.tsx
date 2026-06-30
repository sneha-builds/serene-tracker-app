import React, { useState, useEffect } from 'react';

export function QuickNotes() {
  const [notes, setNotes] = useState(() => localStorage.getItem('companion_quick_notes') || '');
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('companion_quick_notes', notes);
      setIsSaved(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [notes]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setIsSaved(false);
  };

  return (
    <div className="flex flex-col h-full bg-white/5 backdrop-blur-md rounded-xl border border-white/20 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Quick Notes
        </h2>
        <span className={`text-[9px] font-mono transition-opacity ${isSaved ? 'text-white/40 opacity-100' : 'opacity-0'}`}>
          SAVED
        </span>
      </div>
      
      <div className="flex-1 p-2">
        <textarea
          value={notes}
          onChange={handleChange}
          placeholder="Jot down thoughts, links, or fleeting ideas here..."
          className="w-full h-full bg-transparent resize-none p-2 text-sm text-white/80 placeholder-white/30 focus:outline-none custom-scrollbar font-sans"
        />
      </div>
    </div>
  );
}
