import React, { useState, useRef, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { useAlarms } from '../hooks/useAlarms';
import { Plus, CheckCircle2, Circle, Flame, TrendingUp, Calendar as CalendarIcon, Trash2, Bell, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, subDays, isSameDay, startOfToday, parseISO } from 'date-fns';
import { formatTime12Hour } from '../lib/time';

export function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { tasks, completions, addTask, toggleTask, deleteTask, today, activeDate } = useTasks(selectedDate);
  const { addAlarm } = useAlarms();
  const { profile } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [showReminder, setShowReminder] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [showStartTime, setShowStartTime] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate 14 days for the scroller (7 before, 7 after today)
  const dates = Array.from({ length: 15 }, (_, i) => addDays(subDays(new Date(), 7), i));

  const activeTasks = tasks.filter(t => t.active && format(parseISO(t.createdAt), 'yyyy-MM-dd') === activeDate);
  const todayCompletions = completions.filter(c => 
    c.date === activeDate && 
    c.completed && 
    activeTasks.some(t => t.id === c.taskId)
  );
  const completionRate = activeTasks.length > 0 
    ? Math.min(100, Math.round((todayCompletions.length / activeTasks.length) * 100)) 
    : 0;

  const copyFromYesterday = async () => {
    const yesterday = format(subDays(parseISO(activeDate), 1), 'yyyy-MM-dd');
    const yesterdayTasks = tasks.filter(t => t.active && format(parseISO(t.createdAt), 'yyyy-MM-dd') === yesterday);
    
    for (const task of yesterdayTasks) {
      await addTask(task.title, task.description, activeDate);
    }
  };

  useEffect(() => {
    // Center the selected date in the scroller
    if (scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDate]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      const taskId = await addTask(newTaskTitle.trim(), '', selectedDate, showStartTime ? startTime : undefined);
      
      if (showReminder && reminderTime && taskId) {
        await addAlarm(reminderTime, newTaskTitle.trim(), 'default', taskId);
      }

      setNewTaskTitle('');
      setReminderTime('');
      setStartTime('');
      setShowReminder(false);
      setShowStartTime(false);
      setIsAdding(false);
    }
  };

  const getMotivationalMessage = () => {
    if (completionRate === 100) return "Perfect day! You're crushing it!";
    if (completionRate >= 50) return "You're more than halfway there!";
    if (completionRate > 0) return "Great start! Keep going.";
    return "Ready to start your day?";
  };

  return (
    <div className="space-y-6">
      {/* Date Scroller */}
      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-2 no-scrollbar"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {dates.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isSelected = selectedDate === dateStr;
            const isTodayDate = isSameDay(date, new Date());
            
            return (
              <button
                key={dateStr}
                data-selected={isSelected}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex-shrink-0 w-14 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all scroll-snap-align-center ${
                  isSelected 
                    ? 'bg-primary text-on-primary shadow-lg scale-110' 
                    : 'bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant/50'
                }`}
              >
                <span className="text-[10px] font-bold uppercase opacity-70">{format(date, 'EEE')}</span>
                <span className="text-lg font-bold">{format(date, 'd')}</span>
                {isTodayDate && !isSelected && (
                  <div className="w-1 h-1 bg-primary rounded-full mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="m3-card bg-primary-container/40 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Flame className="text-primary" size={24} />
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Streak</span>
          </div>
          <div>
            <span className="text-4xl font-bold text-on-primary-container">{profile?.currentStreak || 0}</span>
            <span className="text-sm font-medium text-on-primary-container/60 ml-2">days</span>
          </div>
        </div>
        <div className="m3-card bg-secondary-container/40 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <TrendingUp className="text-secondary" size={24} />
            </div>
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Progress</span>
          </div>
          <div>
            <span className="text-4xl font-bold text-on-secondary-container">
              {activeTasks.length > 0 ? `${completionRate}%` : '—'}
            </span>
            <span className="text-sm font-medium text-on-secondary-container/60 ml-2">
              {activeTasks.length > 0 ? 'done' : 'no tasks'}
            </span>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="text-center py-2">
        <h2 className="text-2xl font-bold mb-1">
          {isSameDay(parseISO(selectedDate), new Date()) ? getMotivationalMessage() : format(parseISO(selectedDate), 'MMMM do, yyyy')}
        </h2>
        <p className="text-on-surface-variant flex items-center justify-center gap-2">
          <CalendarIcon size={16} />
          {isSameDay(parseISO(selectedDate), new Date()) ? 'Today' : format(parseISO(selectedDate), 'EEEE')}
        </p>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-outline">Tasks for this day</h3>
          <button 
            onClick={() => setIsAdding(true)}
            className="p-2 bg-primary-container text-primary rounded-full hover:shadow-md transition-all"
          >
            <Plus size={20} />
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {isAdding && (
            <motion.form
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onSubmit={handleAddTask}
              className="m3-card !p-4 border-2 border-primary/20"
            >
              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-primary uppercase tracking-wider">
                <CalendarIcon size={14} />
                Planning for {isSameDay(parseISO(selectedDate), new Date()) ? 'Today' : format(parseISO(selectedDate), 'MMM do')}
              </div>
              <input
                autoFocus
                type="text"
                placeholder="What's your goal?"
                className="m3-input mb-4"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              
              <div className="flex gap-2 mb-4">
                {!showStartTime && (
                  <button
                    type="button"
                    onClick={() => setShowStartTime(true)}
                    className="flex items-center gap-2 text-sm text-primary font-bold hover:bg-primary/10 p-2 rounded-lg transition-colors w-fit"
                  >
                    <Clock size={16} />
                    Add Start Time
                  </button>
                )}
                {!showReminder && (
                  <button
                    type="button"
                    onClick={() => setShowReminder(true)}
                    className="flex items-center gap-2 text-sm text-primary font-bold hover:bg-primary/10 p-2 rounded-lg transition-colors w-fit"
                  >
                    <Bell size={16} />
                    Add Reminder
                  </button>
                )}
              </div>

              {showStartTime && (
                <div className="flex flex-col gap-1 mb-4 bg-primary/5 p-3 rounded-xl border border-primary/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-primary uppercase flex items-center gap-1">
                      <Clock size={14} />
                      Start Time
                    </label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowStartTime(false);
                        setStartTime('');
                      }}
                      className="text-xs font-bold text-error hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="m3-input !py-2 text-lg bg-surface"
                    required={showStartTime}
                  />
                </div>
              )}

              {showReminder && (
                <div className="flex flex-col gap-1 mb-4 bg-primary/5 p-3 rounded-xl border border-primary/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-primary uppercase flex items-center gap-1">
                      <Bell size={14} />
                      Reminder Time
                    </label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowReminder(false);
                        setReminderTime('');
                      }}
                      className="text-xs font-bold text-error hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <input 
                    type="time" 
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="m3-input !py-2 text-lg bg-surface"
                    required={showReminder}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAdding(false);
                    setReminderTime('');
                    setStartTime('');
                    setShowReminder(false);
                    setShowStartTime(false);
                  }}
                  className="px-4 py-2 text-sm font-bold text-outline hover:text-on-surface"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="m3-button-primary py-2 px-6 text-sm"
                >
                  Add Task
                </button>
              </div>
            </motion.form>
          )}

          {activeTasks.map((task) => {
            const isCompleted = completions.some(c => c.taskId === task.id && c.date === activeDate && c.completed);
            return (
              <motion.div
                layout
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`m3-card !p-3 group flex items-center gap-3 transition-all ${
                  isCompleted ? 'opacity-60 bg-surface-variant/10' : 'hover:bg-surface-variant/50'
                }`}
              >
                <div 
                  onClick={() => toggleTask(task.id, !isCompleted)}
                  className={`transition-all cursor-pointer p-1 rounded-full hover:bg-primary/10 ${
                    isCompleted ? 'text-primary' : 'text-outline'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-base ${isCompleted ? 'line-through' : ''}`}>
                    {task.title}
                  </h4>
                  {task.startTime && (
                    <div className="flex items-center gap-1 mt-1 text-xs font-medium text-primary">
                      <Clock size={12} />
                      {formatTime12Hour(task.startTime)}
                    </div>
                  )}
                  {task.description && (
                    <p className="text-xs text-on-surface-variant">{task.description}</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="p-2 text-outline hover:text-error transition-colors md:opacity-0 md:group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {activeTasks.length === 0 && !isAdding && (
          <div className="text-center py-8 border-2 border-dashed border-outline/20 rounded-3xl flex flex-col items-center gap-4">
            <p className="text-on-surface-variant">No tasks for this date.</p>
            <button
              onClick={copyFromYesterday}
              className="m3-button-tonal text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Copy from Yesterday
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
