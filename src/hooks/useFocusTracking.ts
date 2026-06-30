import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export function useFocusTracking() {
  const { setTokenBalance, setGuideState, updateTaskAltitude } = useStore();
  const keystrokesRef = useRef(0);
  const sessionStartRef = useRef(Date.now());

  useEffect(() => {
    if (useStore.getState().isTimerRunning) {
      setGuideState('focused');
    } else {
      setGuideState('hovering');
    }
  }, [useStore.getState().isTimerRunning, setGuideState]);

  useEffect(() => {
    let lastKeyTime = 0;
    
    const handleKeyDown = () => {
      const now = Date.now();
      if (now - lastKeyTime < 100) return; // Throttle to max 10 times a second
      lastKeyTime = now;
      
      keystrokesRef.current += 1;
      
      // Only update state if it's not already focused to avoid unnecessary renders
      if (useStore.getState().guideState !== 'focused') {
        setGuideState('focused');
      }
      
      // Push the lowest balloon up slightly
      const activeTasks = useStore.getState().tasks;
      if (activeTasks.length > 0) {
        // Find task with lowest altitude
        const lowestTask = activeTasks.reduce((prev, current) => (prev.altitude < current.altitude) ? prev : current);
        if (lowestTask.altitude < 100) {
          updateTaskAltitude(lowestTask.id, Math.min(100, lowestTask.altitude + 1));
        }
      }

      // Reset Guide state after 1 second of no typing, UNLESS timer is running
      if ((window as any).guideTimeout) clearTimeout((window as any).guideTimeout);
      (window as any).guideTimeout = setTimeout(() => {
        if (!useStore.getState().isTimerRunning) {
          setGuideState('hovering');
        }
      }, 1000);
    };

    window.addEventListener('keydown', handleKeyDown);

    // Telemetry reporting loop (runs every 10 seconds for dev instead of 5 mins)
    const telemetryInterval = setInterval(async () => {
      const duration_seconds = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      const strokes = keystrokesRef.current;
      
      // Reset for next window
      keystrokesRef.current = 0;
      sessionStartRef.current = Date.now();

      if (strokes > 10) { // Scaled down threshold for testing
        try {
          // In a real app we'd sync this to Firestore
          // setTokenBalance(useStore.getState().tokenBalance + 1);
        } catch (err) {
          console.error("Telemetry sync failed", err);
        }
      }
    }, 10000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(telemetryInterval);
    };
  }, [setGuideState, setTokenBalance, updateTaskAltitude]);
}
