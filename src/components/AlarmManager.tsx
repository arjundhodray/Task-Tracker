import React, { useEffect, useState, useRef } from 'react';
import { useAlarms } from '../hooks/useAlarms';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCircle2, Music } from 'lucide-react';
import { format } from 'date-fns';
import { formatTime12Hour } from '../lib/time';

export function AlarmManager() {
  const { alarms, toggleAlarm } = useAlarms();
  const [activeAlarm, setActiveAlarm] = useState<any | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Check alarms every minute
    timerRef.current = setInterval(() => {
      const now = new Date();
      const currentTimeStr = format(now, 'HH:mm');
      
      const triggeredAlarm = alarms.find(a => a.enabled && a.time === currentTimeStr);
      
      if (triggeredAlarm && !activeAlarm) {
        setActiveAlarm(triggeredAlarm);
        playAlarmSound();
        
        // Disable the alarm after it triggers (one-shot)
        toggleAlarm(triggeredAlarm.id, false);
      }
    }, 10000); // Check every 10 seconds to be safe

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [alarms, activeAlarm, toggleAlarm]);

  const playAlarmSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioCtxRef.current;
      
      // Simple repeating beep pattern
      const playBeep = (time: number) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(880, time);
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.1, time + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, time + 0.2);
        
        oscillator.start(time);
        oscillator.stop(time + 0.2);
      };

      // Play 3 beeps
      const now = audioCtx.currentTime;
      playBeep(now);
      playBeep(now + 0.4);
      playBeep(now + 0.8);
      
    } catch (e) {
      console.log('Audio play failed:', e);
    }
  };

  const handleDismiss = () => {
    setActiveAlarm(null);
  };

  return (
    <AnimatePresence>
      {activeAlarm && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-surface border-2 border-primary/20 rounded-3xl shadow-2xl z-[100] overflow-hidden"
        >
          <div className="bg-primary/10 p-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary text-on-primary rounded-full animate-pulse">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-bold text-primary">Reminder</h3>
                <p className="text-sm font-medium text-on-surface-variant leading-tight mt-1">
                  It's time for your task!
                </p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-outline hover:text-on-surface">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 text-center">
            <span className="text-5xl font-bold tabular-nums block mb-2">{formatTime12Hour(activeAlarm.time)}</span>
            <h4 className="text-xl font-bold text-on-surface">{activeAlarm.label}</h4>
            
            <div className="flex gap-3 mt-6 pt-4 border-t border-outline/10">
              <button 
                onClick={handleDismiss}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                <CheckCircle2 size={18} />
                Got it
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
