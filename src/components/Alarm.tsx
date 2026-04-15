import React, { useState } from 'react';
import { AlarmClock, Plus, Trash2, Music, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAlarms } from '../hooks/useAlarms';
import { formatTime12Hour } from '../lib/time';

const RINGTONES = [
  { id: 'default', name: 'Classic Bell' },
  { id: 'nature', name: 'Nature Birds' },
  { id: 'digital', name: 'Digital Beep' },
  { id: 'zen', name: 'Zen Garden' }
];

export function Alarm() {
  const { alarms, addAlarm, toggleAlarm, deleteAlarm } = useAlarms();
  const [isAdding, setIsAdding] = useState(false);
  const [newTime, setNewTime] = useState('07:00');
  const [newLabel, setNewLabel] = useState('');
  const [newRingtone, setNewRingtone] = useState('default');

  const handleAddAlarm = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAlarm(newTime, newLabel || 'Reminder', newRingtone);
    setIsAdding(false);
    setNewLabel('');
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Reminders</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-3 bg-primary text-on-primary rounded-2xl shadow-lg hover:scale-105 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onSubmit={handleAddAlarm}
            className="m3-card bg-primary-container/20 border-2 border-primary/20 space-y-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary uppercase">Time</label>
              <input 
                type="time" 
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="m3-input text-2xl font-bold"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary uppercase">Label</label>
              <input 
                type="text" 
                placeholder="e.g. Gym, Meditation"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="m3-input"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary uppercase">Ringtone</label>
              <select 
                value={newRingtone}
                onChange={(e) => setNewRingtone(e.target.value)}
                className="m3-input bg-surface"
              >
                {RINGTONES.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="flex-1 py-3 text-sm font-bold text-outline"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 m3-button-primary py-3 text-sm"
              >
                Save Reminder
              </button>
            </div>
          </motion.form>
        )}

        {alarms.map((alarm) => (
          <motion.div
            layout
            key={alarm.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`m3-card group flex items-center justify-between transition-all ${
              alarm.enabled ? 'bg-surface-variant/20' : 'opacity-50 grayscale'
            }`}
          >
            <div className="flex flex-col gap-1">
              <span className="text-4xl font-bold tabular-nums">{formatTime12Hour(alarm.time)}</span>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                <Bell size={12} />
                <span>{alarm.label}</span>
                <span className="opacity-30">•</span>
                <Music size={12} />
                <span>{RINGTONES.find(r => r.id === alarm.ringtone)?.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => deleteAlarm(alarm.id)}
                className="p-2 text-outline hover:text-error transition-colors md:opacity-0 md:group-hover:opacity-100"
              >
                <Trash2 size={20} />
              </button>
              <div 
                onClick={() => toggleAlarm(alarm.id, !alarm.enabled)}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                  alarm.enabled ? 'bg-primary' : 'bg-outline/20'
                }`}
              >
                <motion.div 
                  animate={{ x: alarm.enabled ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-surface rounded-full shadow-sm"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {alarms.length === 0 && !isAdding && (
        <div className="text-center py-20 opacity-40">
          <AlarmClock size={64} className="mx-auto mb-4" />
          <p>No reminders set</p>
        </div>
      )}
    </div>
  );
}
