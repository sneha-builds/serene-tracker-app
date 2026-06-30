import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { GuideSprite } from './components/GuideSprite';
import { TaskBoard } from './components/TaskBoard';
import { QuickNotes } from './components/QuickNotes';
import { DailyQuote } from './components/DailyQuote';
import { BreathingExercise } from './components/BreathingExercise';
import { PomodoroTimer } from './components/PomodoroTimer';
import { AuthOverlay } from './components/AuthOverlay';
import { GoalHabitTracker } from './components/GoalHabitTracker';
import { ReminderOverlay } from './components/ReminderOverlay';
import { MockCalendar } from './components/MockCalendar';
import { auth, setupMessaging } from './lib/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';

export default function App() {
  const { guideState, setTasks, addTask, tasks, userId, userEmail, loginStreak, logout, isGuest, setAuth, theme, setTheme } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'CRITICAL' | 'HIGH' | 'NORMAL'>('NORMAL');
  const [activeTab, setActiveTab] = useState<'workspace' | 'metrics'>('workspace');
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const currentUserId = useStore.getState().userId;
      
      if (user) {
        setFirebaseUser(user);
        // Only set auth if it's not already a custom user (which starts with usr_)
        if (!currentUserId || !currentUserId.startsWith('usr_')) {
          try {
            const { getDoc, doc } = await import('firebase/firestore');
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const loginStreak = userDoc.exists() ? userDoc.data().loginStreak || 0 : 0;
            setAuth(user.uid, user.email || '', user.isAnonymous, loginStreak);
          } catch (err) {
            setAuth(user.uid, user.email || '', user.isAnonymous, 0);
          }
        }
        setupMessaging(user.uid);
      } else {
        // If there's no Firebase user AND no custom user AND not already guest, set as guest
        if (!currentUserId || (!currentUserId.startsWith('usr_') && !currentUserId.startsWith('guest-'))) {
          setAuth(`guest-${Math.random().toString(36).substring(2, 10)}`, 'guest@local', true);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [setAuth]);

  useEffect(() => {
    if (isGuest) {
      const timer = setTimeout(() => {
        setShowAuthOverlay(true);
      }, 5 * 60 * 1000); // 5 minutes
      return () => clearTimeout(timer);
    }
  }, [isGuest]);

  // Initial Data Fetch
  useEffect(() => {
    if (!userId || userId.startsWith('guest-')) return;
    
    const tasksRef = collection(db, 'tasks');
    const qTasks = query(tasksRef, where('user_id', '==', userId));
    const unsubTasks = onSnapshot(
      qTasks, 
      (snapshot) => {
        const tasksData: any[] = [];
        snapshot.forEach(doc => tasksData.push({ id: doc.id, ...doc.data() }));
        setTasks(tasksData.filter(t => t.id && t.altitude !== undefined));
      },
      (error) => {
        console.log("Tasks listener error (usually during sign out):", error.message);
      }
    );

    return () => unsubTasks();
  }, [setTasks, firebaseUser, userId]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !userId) return;

    if (userId.startsWith('guest-')) {
      addTask({
        id: Math.random().toString(36).substring(7),
        title: newTaskTitle,
        description: '',
        deadline_adjusted: newTaskDate ? new Date(newTaskDate).toISOString() : new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        user_id: userId,
        status: 'ACTIVE',
        altitude: 50,
        priority: newTaskPriority
      });
      setNewTaskTitle('');
      setNewTaskDate('');
      setNewTaskPriority('NORMAL');
      return;
    }

    try {
      await addDoc(collection(db, 'tasks'), {
        title: newTaskTitle,
        description: '',
        deadline_adjusted: newTaskDate ? new Date(newTaskDate).toISOString() : new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        user_id: userId,
        status: 'ACTIVE',
        altitude: 50,
        priority: newTaskPriority
      });
      setNewTaskTitle('');
      setNewTaskDate('');
      setNewTaskPriority('NORMAL');
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen bg-black text-white">Loading...</div>;
  }

  return (
    <div className={`w-full h-screen font-sans flex overflow-hidden select-none relative ${theme === 'deep-space' ? 'bg-[#000000] text-white theme-deep-space' : 'bg-[#0A0C10] text-[#E0E0E0]'}`}>
      {showAuthOverlay && <AuthOverlay onClose={() => setShowAuthOverlay(false)} />}
      <div className={`absolute inset-0 ${theme === 'deep-space' ? 'bg-[radial-gradient(circle_at_center,_#050505_0%,_#000000_100%)]' : 'bg-[radial-gradient(circle_at_center,_#111827_0%,_#030712_100%)]'}`}></div>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <svg className="absolute w-full h-full pointer-events-none z-0">
        <circle cx="50%" cy="50%" r="400" fill="url(#glow)" opacity="0.15" />
        <defs>
          <radialGradient id="glow"><stop offset="0%" stopColor="#22D3EE"/><stop offset="100%" stopColor="transparent"/></radialGradient>
        </defs>
      </svg>
      
      {/* Left Sidebar: Identity & Ledger */}
      <aside className="w-72 border-r border-white/10 flex flex-col bg-white/5 backdrop-blur-xl relative z-10">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center shadow-lg text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Serene <span className="text-white/60 font-light">Tracker</span></h1>
          </div>

          <div className="space-y-6">
            <DailyQuote />
            <BreathingExercise />

            <PomodoroTimer />

            <nav className="space-y-1">
              <div 
                onClick={() => setActiveTab('workspace')}
                className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                  activeTab === 'workspace' 
                    ? 'bg-white/10 border-r-2 border-cyan-400 text-white font-medium' 
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                <span>Active Workspace</span>
              </div>
              <div 
                onClick={() => setActiveTab('metrics')}
                className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                  activeTab === 'metrics'
                    ? 'bg-white/10 border-r-2 border-cyan-400 text-white font-medium'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
                <span>Performance Metrics</span>
              </div>
              
              <div 
                onClick={() => setTheme(theme === 'default' ? 'deep-space' : 'default')}
                className="px-4 py-3 text-white/50 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-between cursor-pointer mt-4 border-t border-white/10 pt-4"
              >
                <div className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                  <span>Deep Space Mode</span>
                </div>
                <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${theme === 'deep-space' ? 'bg-cyan-500' : 'bg-white/20'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${theme === 'deep-space' ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* AI Status Card */}
        <div className="mt-auto p-6 bg-white/5 border-t border-white/10 flex flex-col items-center relative">
          <div className="absolute top-4 right-4 text-[9px] font-mono text-white/70 border border-white/20 px-2 py-0.5 rounded-full bg-white/10">
            ONLINE
          </div>
          <GuideSprite state={guideState} />
          <h2 className="mt-2 text-sm font-bold text-white tracking-tight">Serene Guide</h2>
          <p className="text-white/50 text-[10px] mt-1 text-center font-mono">
            Assistant active.
          </p>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative z-10">
        <header className="relative z-50 h-16 border-b border-white/10 flex items-center justify-between px-8 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4 flex-1">
            <span className="px-2 py-1 bg-white/10 border border-white/20 rounded text-[10px] font-mono text-white/60">NEW TASK</span>
            
            <form onSubmit={handleAddTask} className="flex gap-4 w-full max-w-2xl">
              <input 
                type="text" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter new task..." 
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:bg-white/20 transition-all font-sans min-w-[200px]"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="w-32 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:bg-white/20 transition-all font-sans appearance-none"
              >
                <option value="NORMAL" className="bg-gray-900">Normal</option>
                <option value="HIGH" className="bg-gray-900">High</option>
                <option value="CRITICAL" className="bg-gray-900 text-red-400">Critical</option>
              </select>
              <input
                type="datetime-local"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                className="w-48 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:bg-white/20 transition-all font-sans min-w-0 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
              />
              <button 
                type="submit"
                className="bg-cyan-500/80 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg backdrop-blur-md border border-cyan-400/50 shrink-0"
              >
                ADD TASK
              </button>
            </form>

          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-white/10 pr-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center cursor-pointer hover:bg-cyan-500/30 transition-colors"
                  >
                    {!isGuest && userEmail ? (
                      <span className="text-cyan-300 font-bold uppercase">{userEmail.charAt(0)}</span>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    )}
                  </div>
                  
                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                      <div className="absolute right-0 top-full mt-2 w-56 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-2">
                        {!isGuest ? (
                          <>
                            <div className="px-4 py-3 border-b border-white/5">
                              <div className="text-sm font-medium text-white">{userEmail?.split('@')[0] || 'User'}</div>
                              <div className="text-xs text-white/50 mt-0.5 truncate">{userEmail}</div>
                            </div>
                            <button 
                              onClick={() => { auth.signOut(); logout(); setShowProfileMenu(false); }}
                              className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2 border-b border-white/5"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                              Sign Out
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="px-4 py-3 border-b border-white/5">
                              <div className="text-sm font-medium text-white">Guest User</div>
                              <div className="text-xs text-white/50 mt-0.5">Not saving progress</div>
                            </div>
                            <button 
                              onClick={() => { setShowAuthOverlay(true); setShowProfileMenu(false); }}
                              className="w-full text-left px-4 py-3 text-sm text-cyan-400 hover:bg-white/5 transition-colors flex items-center gap-2 border-b border-white/5"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                              Sign In
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-white/50 uppercase">AI Status</div>
              <div className="text-sm font-mono text-cyan-300">ACTIVE</div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {activeTab === 'workspace' ? (
            <TaskBoard />
          ) : (
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Performance Metrics</h2>
                  <p className="text-sm text-white/60">Your activity and focus statistics.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 shadow-xl">
                    <div className="text-[10px] text-white/50 uppercase tracking-widest mb-2">Total Tasks Completed</div>
                    <div className="text-3xl font-mono text-white">{tasks.filter(t => t.status === 'COMPLETED').length}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 shadow-xl">
                    <div className="text-[10px] text-white/50 uppercase tracking-widest mb-2">Login Streak</div>
                    <div className="text-3xl font-mono text-cyan-300">{loginStreak} <span className="text-lg">🔥</span></div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 shadow-xl">
                   <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Task Completion Rate</h3>
                   <div className="h-4 bg-white/10 rounded-full overflow-hidden w-full">
                     <div 
                       className="h-full bg-cyan-400" 
                       style={{ width: `${tasks.length ? (tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100 : 0}%` }}
                     ></div>
                   </div>
                   <div className="flex justify-between mt-2 text-xs font-mono text-white/50">
                     <span>0%</span>
                     <span>{Math.round(tasks.length ? (tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100 : 0)}%</span>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 border-l border-white/10 flex flex-col bg-white/5 backdrop-blur-xl relative z-10 overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-white/10 shrink-0 h-64">
          <QuickNotes />
        </div>

        {/* Focus Metrics */}
        <div className="p-6 flex-1">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-6">Focus Metrics</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-[10px] mb-1.5 uppercase">
                <span className="text-white/60">Login Streak</span>
                <span className="text-cyan-300 font-mono">{loginStreak || 0} DAYS</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, (loginStreak || 0) * 10)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1.5 uppercase">
                <span className="text-white/60">Tasks Active</span>
                <span className="text-blue-300 font-mono">{tasks.filter(t => t.status === 'ACTIVE').length} / {tasks.length}</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400" style={{ width: `${tasks.length ? (tasks.filter(t => t.status === 'ACTIVE').length / tasks.length) * 100 : 0}%` }}></div>
              </div>
            </div>
            
            <div className="pt-4">
              <h3 className="text-[10px] font-bold text-white/40 uppercase mb-3">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50 italic">Cloud Sync</span>
                  <span className="font-mono text-cyan-300">{isGuest ? 'OFFLINE' : 'ONLINE'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50 italic">AI Assistant</span>
                  <span className="font-mono text-cyan-300">ACTIVE</span>
                </div>
              </div>
            </div>

            <GoalHabitTracker />
            <MockCalendar />
          </div>
        </div>

        {/* Bottom Action */}
        <div className="p-6 mt-auto">
          <div className="p-4 bg-white/5 rounded-xl border border-white/20 shadow-lg backdrop-blur-md">
            <p className="text-[11px] text-white/60 leading-relaxed">
              <span className="text-white font-medium">Pro Tip:</span> Keep focusing and completing habits to maintain your daily streak and task momentum.
            </p>
          </div>
        </div>
      </aside>

      <ReminderOverlay />
    </div>
  );
}
