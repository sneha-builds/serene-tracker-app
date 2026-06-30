import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

export function ReminderOverlay() {
  const { tasks } = useStore();
  const [activeReminders, setActiveReminders] = useState<{ id: string; title: string; message: string }[]>([]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const newReminders: { id: string; title: string; message: string }[] = [];

      tasks.forEach(task => {
        if (task.status === 'COMPLETED') return;

        // Check deadline
        if (task.deadline_adjusted) {
          const deadline = new Date(task.deadline_adjusted);
          const diffMin = (deadline.getTime() - now.getTime()) / 60000;
          const roundedDiff = Math.round(diffMin);
          
          const intervals = [4320, 1440, 960, 720, 360, 180, 120, 60];

          if (diffMin > 0 && intervals.includes(roundedDiff) && task.altitude > 20) {
            const timeLabel = roundedDiff >= 60 ? `${Math.round(roundedDiff / 60)} hours` : `${roundedDiff} minutes`;
            newReminders.push({
              id: `deadline-${task.id}`,
              title: task.title,
              message: `Deadline approaching in ${timeLabel}! Stay focused!`
            });
          }
        }

        // Check AI scheduled time
        if (task.ai_scheduled_time) {
          const schedTime = new Date(task.ai_scheduled_time);
          const diffMin = Math.abs((schedTime.getTime() - now.getTime()) / 60000);
          if (diffMin <= 5) {
            newReminders.push({
              id: `sched-${task.id}`,
              title: task.title,
              message: `AI recommends working on this task right now.`
            });
          }
        }
      });

      // Show up to 2 unique reminders
      setActiveReminders(newReminders.slice(0, 2));
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders();

    return () => clearInterval(interval);
  }, [tasks]);

  if (activeReminders.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {activeReminders.map(reminder => (
        <div key={reminder.id} className="w-80 bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-4 shadow-xl backdrop-blur-xl animate-in slide-in-from-bottom-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path></svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">{reminder.title}</h4>
              <p className="text-xs text-cyan-200 mt-1">{reminder.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
