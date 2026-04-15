import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { LogIn, CheckCircle2 } from 'lucide-react';

export function Auth() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-primary-container rounded-[2rem] flex items-center justify-center mb-6 mx-auto shadow-xl">
          <CheckCircle2 size={48} className="text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-on-surface mb-2">Consistency</h1>
        <p className="text-on-surface-variant max-w-xs mx-auto">
          Track your daily tasks and build long-lasting habits with ease.
        </p>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={signIn}
        className="m3-button-primary flex items-center gap-3 px-8"
      >
        <LogIn size={20} />
        Sign in with Google
      </motion.button>
      
      <p className="mt-12 text-xs text-outline font-medium uppercase tracking-[0.2em]">
        Your journey starts here
      </p>
    </div>
  );
}
