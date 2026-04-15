export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: string;
  active: boolean;
  startTime?: string;
}

export interface Completion {
  id: string;
  userId: string;
  taskId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface DailyStats {
  userId: string;
  date: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
}
