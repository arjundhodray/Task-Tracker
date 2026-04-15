import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, setDoc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';
import { Task, Completion, DailyStats } from '../types';
import { format, startOfDay, isYesterday, isToday, parseISO } from 'date-fns';

export function useTasks(selectedDate?: string) {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');
  const activeDate = selectedDate || today;

  useEffect(() => {
    if (!user) return;

    const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const completionsQuery = query(collection(db, 'completions'), where('userId', '==', user.uid));
    const statsQuery = query(collection(db, 'dailyStats'), where('userId', '==', user.uid));

    // Filter tasks to show only those created for the specific active date
    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      const allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      // Sort tasks by creation time descending (newest first, oldest at bottom)
      allTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTasks(allTasks);
    });

    const unsubCompletions = onSnapshot(completionsQuery, (snapshot) => {
      setCompletions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Completion)));
    });

    const unsubStats = onSnapshot(statsQuery, (snapshot) => {
      setStats(snapshot.docs.map(doc => doc.data() as DailyStats));
    });

    setLoading(false);

    return () => {
      unsubTasks();
      unsubCompletions();
      unsubStats();
    };
  }, [user]);

  // Automatically update daily stats when tasks or completions change
  useEffect(() => {
    const updateStats = async () => {
      if (!loading && user && tasks.length >= 0) {
        // Get all tasks for the specific active date
        const activeTasksForDate = tasks.filter(t => t.active && format(parseISO(t.createdAt), 'yyyy-MM-dd') === activeDate);
        const dateCompletions = completions.filter(c => 
          c.date === activeDate && 
          c.completed && 
          activeTasksForDate.some(t => t.id === c.taskId)
        );
        
        const totalCount = activeTasksForDate.length;
        const completedCount = dateCompletions.length;
        const percentage = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

        const statId = `${user.uid}_${activeDate}`;
        const statRef = doc(db, 'dailyStats', statId);
        
        // Only update if the data actually changed to avoid infinite loops
        const currentStat = stats.find(s => s.date === activeDate);
        if (!currentStat || currentStat.percentage !== percentage || currentStat.totalCount !== totalCount) {
          await setDoc(statRef, {
            userId: user.uid,
            date: activeDate,
            completedCount,
            totalCount,
            percentage
          });
        }

        // Streak logic (only if updating today and we hit 100%)
        if (activeDate === today && percentage === 100 && profile?.lastCompletedDate !== today) {
          let newStreak = 1;
          if (profile?.lastCompletedDate && (isYesterday(parseISO(profile.lastCompletedDate)) || isToday(parseISO(profile.lastCompletedDate)))) {
            newStreak = (profile.currentStreak || 0) + 1;
          }
          
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, profile?.longestStreak || 0),
            lastCompletedDate: today
          });
        }
      }
    };

    updateStats();
  }, [tasks, completions, activeDate, loading, user, today, profile, stats]);

  const addTask = async (title: string, description?: string, date?: string, startTime?: string) => {
    if (!user) return null;
    
    let createdAt = new Date().toISOString();
    if (date) {
      const now = new Date();
      const [year, month, day] = date.split('-');
      now.setFullYear(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      createdAt = now.toISOString();
    }

    const taskData: any = {
      userId: user.uid,
      title,
      description: description || '',
      createdAt,
      active: true
    };

    if (startTime) {
      taskData.startTime = startTime;
    }

    const docRef = await addDoc(collection(db, 'tasks'), taskData);
    
    return docRef.id;
  };

  const toggleTask = async (taskId: string, completed: boolean, targetDate?: string) => {
    if (!user) return;
    const dateToUse = targetDate || activeDate;
    const completionId = `${user.uid}_${taskId}_${dateToUse}`;
    const completionRef = doc(db, 'completions', completionId);
    
    await setDoc(completionRef, {
      id: completionId,
      userId: user.uid,
      taskId,
      date: dateToUse,
      completed
    });
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
    
    // Also clean up completions for this task (optional but good for data hygiene)
    const completionsQuery = query(
      collection(db, 'completions'), 
      where('taskId', '==', taskId),
      where('userId', '==', user.uid)
    );
    const completionsSnap = await getDocs(completionsQuery);
    completionsSnap.docs.forEach(async (d) => {
      await deleteDoc(d.ref);
    });

    // Also clean up alarms associated with this task
    const alarmsQuery = query(
      collection(db, 'alarms'), 
      where('taskId', '==', taskId),
      where('userId', '==', user.uid)
    );
    const alarmsSnap = await getDocs(alarmsQuery);
    alarmsSnap.docs.forEach(async (d) => {
      await deleteDoc(d.ref);
    });
  };

  return { tasks, completions, stats, loading, addTask, toggleTask, deleteTask, today, activeDate };
}
