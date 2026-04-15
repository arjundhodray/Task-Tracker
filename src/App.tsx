import { AuthProvider, useAuth } from './hooks/useAuth';
import { Dashboard } from './components/Dashboard';
import { Stats } from './components/Stats';
import { Alarm } from './components/Alarm';
import { Wishlist } from './components/Wishlist';
import { History } from './components/History';
import { Auth } from './components/Auth';
import { AlarmManager } from './components/AlarmManager';
import { useState } from 'react';
import { LayoutDashboard, BarChart3, LogOut, Moon, Sun, AlarmClock, Gift, History as HistoryIcon, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stats' | 'alarm' | 'wishlist' | 'history'>('dashboard');
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-24">
      <header className="px-6 py-4 flex justify-between items-center sticky top-0 bg-surface/80 backdrop-blur-md z-10 border-b border-outline/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-tertiary flex items-center justify-center shadow-lg shadow-primary/20 text-on-primary">
            <CheckSquare size={22} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
            Task Tracker
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-surface-variant transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-full hover:bg-error-container text-error transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Dashboard />
            </motion.div>
          )}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Stats />
            </motion.div>
          )}
          {activeTab === 'alarm' && (
            <motion.div
              key="alarm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alarm />
            </motion.div>
          )}
          {activeTab === 'wishlist' && (
            <motion.div
              key="wishlist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Wishlist />
            </motion.div>
          )}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <History />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 w-full rounded-none bg-surface border-t border-outline/10 flex justify-around items-center h-[70px] z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'dashboard' ? 'text-primary scale-110' : 'text-on-surface-variant opacity-60'
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[8px] font-bold uppercase tracking-wider">Today</span>
        </button>
        <button
          onClick={() => setActiveTab('alarm')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'alarm' ? 'text-primary scale-110' : 'text-on-surface-variant opacity-60'
          }`}
        >
          <AlarmClock size={20} />
          <span className="text-[8px] font-bold uppercase tracking-wider">Reminder</span>
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'wishlist' ? 'text-primary scale-110' : 'text-on-surface-variant opacity-60'
          }`}
        >
          <Gift size={20} />
          <span className="text-[8px] font-bold uppercase tracking-wider">Wishlist</span>
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'stats' ? 'text-primary scale-110' : 'text-on-surface-variant opacity-60'
          }`}
        >
          <BarChart3 size={20} />
          <span className="text-[8px] font-bold uppercase tracking-wider">Stats</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'history' ? 'text-primary scale-110' : 'text-on-surface-variant opacity-60'
          }`}
        >
          <HistoryIcon size={20} />
          <span className="text-[8px] font-bold uppercase tracking-wider">History</span>
        </button>
      </nav>
      
      <AlarmManager />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
