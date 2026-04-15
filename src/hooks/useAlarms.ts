import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface AlarmItem {
  id: string;
  userId: string;
  time: string;
  label: string;
  ringtone: string;
  enabled: boolean;
  taskId?: string;
}

export function useAlarms() {
  const { user } = useAuth();
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const alarmsQuery = query(collection(db, 'alarms'), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(alarmsQuery, (snapshot) => {
      const fetchedAlarms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AlarmItem));
      // Sort by time
      fetchedAlarms.sort((a, b) => a.time.localeCompare(b.time));
      setAlarms(fetchedAlarms);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addAlarm = async (time: string, label: string, ringtone: string = 'default', taskId?: string) => {
    if (!user) return;
    const alarmData: any = {
      userId: user.uid,
      time,
      label,
      ringtone,
      enabled: true
    };
    
    if (taskId) {
      alarmData.taskId = taskId;
    }
    
    await addDoc(collection(db, 'alarms'), alarmData);
  };

  const toggleAlarm = async (id: string, enabled: boolean) => {
    if (!user) return;
    const alarmRef = doc(db, 'alarms', id);
    await updateDoc(alarmRef, { enabled });
  };

  const deleteAlarm = async (id: string) => {
    if (!user) return;
    const alarmRef = doc(db, 'alarms', id);
    await deleteDoc(alarmRef);
  };

  return { alarms, loading, addAlarm, toggleAlarm, deleteAlarm };
}
