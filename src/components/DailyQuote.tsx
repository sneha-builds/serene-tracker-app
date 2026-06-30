import React, { useState, useEffect } from 'react';

interface Quote {
  quote: string;
  author: string;
}

export function DailyQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://dummyjson.com/quotes/random');
      const data = await res.json();
      setQuote({ quote: data.quote, author: data.author });
    } catch (err) {
      console.error('Failed to fetch quote:', err);
      // Fallback quote
      setQuote({
        quote: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
          Daily Motivation
        </h3>
        <button 
          onClick={fetchQuote}
          disabled={loading}
          className="text-white/40 hover:text-white transition-colors disabled:opacity-50"
          title="Get new quote"
        >
          <svg className={loading ? "animate-spin" : ""} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
        </button>
      </div>

      <div className="relative z-10 min-h-[80px] flex flex-col justify-center">
        {loading && !quote ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
          </div>
        ) : (
          <>
            <p className="text-sm text-white font-serif italic leading-relaxed mb-3">
              "{quote?.quote}"
            </p>
            <p className="text-[10px] font-mono text-cyan-300 tracking-widest uppercase text-right">
              — {quote?.author}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
