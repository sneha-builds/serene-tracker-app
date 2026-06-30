import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Goal {
  id: string;
  title: string;
  progress: number;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  frequency: string;
  last_completed?: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  deadline_adjusted: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  altitude: number; // 0 to 100
  priority?: 'CRITICAL' | 'HIGH' | 'NORMAL';
  ai_scheduled_time?: string;
  ai_rationale?: string;
}

interface AppState {
  userId: string | null;
  userEmail: string | null;
  loginStreak: number;
  isGuest: boolean;
  isTimerRunning: boolean;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  tokenBalance: number;
  guideState: 'hovering' | 'heavy_breathing' | 'spinning' | 'focused';
  theme: 'default' | 'deep-space';
  setIsTimerRunning: (isRunning: boolean) => void;
  setAuth: (id: string, email: string, isGuest?: boolean, loginStreak?: number) => void;
  logout: () => void;
  setTasks: (tasks: Task[]) => void;
  setGoals: (goals: Goal[]) => void;
  setHabits: (habits: Habit[]) => void;
  addTask: (task: Task) => void;
  updateTaskAltitude: (id: string, altitude: number) => void;
  setTokenBalance: (balance: number) => void;
  setGuideState: (state: AppState['guideState']) => void;
  setTheme: (theme: 'default' | 'deep-space') => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      userId: null,
      userEmail: null,
      loginStreak: 0,
      isGuest: false,
      isTimerRunning: false,
      tasks: [],
      goals: [],
      habits: [],
      tokenBalance: 0,
      guideState: 'hovering',
      theme: 'default',
      setIsTimerRunning: (isTimerRunning) => set({ isTimerRunning }),
      setAuth: (id, email, isGuest = false, loginStreak = 0) => set({ userId: id, userEmail: email, isGuest, loginStreak }),
      logout: () => set({ 
        userId: `guest-${Math.random().toString(36).substring(2, 10)}`, 
        userEmail: 'guest@local', 
        loginStreak: 0, 
        isGuest: true, 
        tasks: [], 
        goals: [], 
        habits: [], 
        tokenBalance: 0, 
        theme: 'default' 
      }),
      setTasks: (tasks) => set({ tasks }),
      setGoals: (goals) => set({ goals }),
      setHabits: (habits) => set({ habits }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTaskAltitude: (id, altitude) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, altitude } : t)
      })),
      setTokenBalance: (tokenBalance) => set({ tokenBalance }),
      setGuideState: (guideState) => set({ guideState }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'serene-storage',
      partialize: (state) => ({ 
        userId: state.isGuest ? null : state.userId,
        userEmail: state.isGuest ? null : state.userEmail,
        loginStreak: state.isGuest ? 0 : state.loginStreak,
        theme: state.theme
      }), // Only persist non-guest auth
    }
  )
);
