import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

export function GoalHabitTracker() {
  const { userId, goals, setGoals, habits, setHabits } = useStore();
  const [newHabit, setNewHabit] = useState('');
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    if (!userId || userId.startsWith('guest-')) return;
    
    const habitsRef = collection(db, 'habits');
    const qHabits = query(habitsRef, where('user_id', '==', userId));
    const unsubHabits = onSnapshot(
      qHabits, 
      (snapshot) => {
        const hData: any[] = [];
        snapshot.forEach(doc => hData.push({ id: doc.id, ...doc.data() }));
        setHabits(hData);
      },
      (error) => {
        console.log("Habits listener error:", error.message);
      }
    );

    const goalsRef = collection(db, 'goals');
    const qGoals = query(goalsRef, where('user_id', '==', userId));
    const unsubGoals = onSnapshot(
      qGoals, 
      (snapshot) => {
        const gData: any[] = [];
        snapshot.forEach(doc => gData.push({ id: doc.id, ...doc.data() }));
        setGoals(gData);
      },
      (error) => {
        console.log("Goals listener error:", error.message);
      }
    );

    return () => {
      unsubHabits();
      unsubGoals();
    };
  }, [userId, setGoals, setHabits]);

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim() || !userId) return;
    
    if (userId.startsWith('guest-')) {
      setHabits([...habits, {
        id: Math.random().toString(36).substring(7),
        title: newHabit,
        frequency: 'DAILY',
        streak: 0,
        last_completed: ''
      }]);
      setNewHabit('');
      return;
    }

    try {
      await addDoc(collection(db, 'habits'), {
        user_id: userId,
        title: newHabit,
        frequency: 'DAILY',
        streak: 0,
        last_completed: ''
      });
      setNewHabit('');
    } catch (err) {
      console.error(err);
    }
  };

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim() || !userId) return;

    if (userId.startsWith('guest-')) {
      setGoals([...goals, {
        id: Math.random().toString(36).substring(7),
        title: newGoal,
        progress: 0,
      }]);
      setNewGoal('');
      return;
    }

    try {
      await addDoc(collection(db, 'goals'), {
        user_id: userId,
        title: newGoal,
        progress: 0,
      });
      setNewGoal('');
    } catch (err) {
      console.error(err);
    }
  };

  const completeHabit = async (id: string) => {
    if (userId?.startsWith('guest-')) {
      setHabits(habits.map(h => {
        if (h.id === id) {
          return { ...h, streak: (h.streak || 0) + 1, last_completed: new Date().toISOString() };
        }
        return h;
      }));
      return;
    }

    try {
      const habitRef = doc(db, 'habits', id);
      const habit = habits.find(h => h.id === id);
      if (habit) {
        await updateDoc(habitRef, {
          streak: (habit.streak || 0) + 1,
          last_completed: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const uncompleteHabit = async (id: string) => {
    if (userId?.startsWith('guest-')) {
      setHabits(habits.map(h => {
        if (h.id === id) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return { ...h, streak: Math.max(0, (h.streak || 0) - 1), last_completed: yesterday.toISOString() };
        }
        return h;
      }));
      return;
    }

    try {
      const habitRef = doc(db, 'habits', id);
      const habit = habits.find(h => h.id === id);
      if (habit) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        await updateDoc(habitRef, {
          streak: Math.max(0, (habit.streak || 0) - 1),
          last_completed: yesterday.toISOString()
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteHabit = async (id: string) => {
    if (userId?.startsWith('guest-')) {
      setHabits(habits.filter(h => h.id !== id));
      return;
    }

    try {
      await deleteDoc(doc(db, 'habits', id));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteGoal = async (id: string) => {
    if (userId?.startsWith('guest-')) {
      setGoals(goals.filter(g => g.id !== id));
      return;
    }

    try {
      await deleteDoc(doc(db, 'goals', id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Habits Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          Daily Habits
        </h3>
        <div className="space-y-2">
          {habits.filter(h => h.title).map((habit, i) => {
            const isCompletedToday = habit.last_completed ? new Date(habit.last_completed).toDateString() === new Date().toDateString() : false;
            return (
            <div key={habit.id || `habit-${i}`} className="bg-white/10 backdrop-blur-md rounded-lg p-3 flex justify-between items-center border border-white/20 shadow-sm group">
              <div>
                <div className="text-xs text-white font-medium">{habit.title}</div>
                <div className="text-[10px] text-cyan-300 font-mono mt-0.5">{habit.streak || 0} Day Streak</div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => deleteHabit(habit.id)} 
                  className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:bg-red-500/20 hover:text-red-400"
                  title="Delete habit"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
                <button 
                  onClick={() => isCompletedToday ? uncompleteHabit(habit.id) : completeHabit(habit.id)} 
                  className={`w-6 h-6 rounded flex items-center justify-center transition-colors border ${
                    isCompletedToday 
                      ? 'bg-cyan-500 border-cyan-400 text-white cursor-pointer hover:bg-cyan-600' 
                      : 'bg-white/10 hover:bg-white/20 text-white/30 hover:text-white border-white/20 hover:border-white/40 cursor-pointer'
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
              </div>
            </div>
          )})}
          <form onSubmit={addHabit} className="relative">
            <input 
              value={newHabit} onChange={e => setNewHabit(e.target.value)}
              placeholder="New habit..." 
              className="w-full bg-white/5 border border-dashed border-white/30 rounded-lg px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
            />
          </form>
        </div>
      </div>

      {/* Goals Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          Active Goals
        </h3>
        <div className="space-y-2">
          {goals.filter(g => g.title).map((goal, i) => (
            <div key={goal.id || `goal-${i}`} className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 shadow-sm group">
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs text-white font-medium">{goal.title}</div>
                <button 
                  onClick={() => deleteGoal(goal.id)} 
                  className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:bg-red-500/20 hover:text-red-400"
                  title="Delete goal"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: `${goal.progress || 0}%` }}></div>
              </div>
            </div>
          ))}
          <form onSubmit={addGoal} className="relative">
            <input 
              value={newGoal} onChange={e => setNewGoal(e.target.value)}
              placeholder="New goal..." 
              className="w-full bg-white/5 border border-dashed border-white/30 rounded-lg px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
