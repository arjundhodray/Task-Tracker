import React from 'react';
import { useTasks } from '../hooks/useTasks';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, Circle, History as HistoryIcon } from 'lucide-react';
import { motion } from 'motion/react';

export function History() {
  const { tasks, completions } = useTasks();

  // Sort tasks by creation date (newest first)
  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
          <HistoryIcon size={24} />
        </div>
        <h2 className="text-3xl font-bold">History</h2>
      </div>

      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <HistoryIcon size={64} className="mx-auto mb-4" />
            <p>No task history yet</p>
          </div>
        ) : (
          sortedTasks.map(task => {
            // Find if this task has a completion record
            const completion = completions.find(c => c.taskId === task.id && c.completed);
            const isCompleted = !!completion;
            
            const startDate = format(parseISO(task.createdAt), 'MMM d, yyyy');
            const endDate = isCompleted ? format(parseISO(completion.date), 'MMM d, yyyy') : null;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={task.id}
                className={`m3-card !p-4 flex items-start gap-4 transition-all ${
                  isCompleted ? 'bg-surface-variant/20' : 'bg-surface-variant/40'
                }`}
              >
                <div className={`mt-1 ${isCompleted ? 'text-primary' : 'text-outline opacity-50'}`}>
                  {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-base ${isCompleted ? 'line-through opacity-70' : ''}`}>
                    {task.title}
                  </h4>
                  <div className="flex flex-col gap-1 mt-2 text-xs font-medium">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="px-2 py-0.5 bg-surface rounded-md border border-outline/10">
                        Started: {startDate}
                      </span>
                    </div>
                    {isCompleted && (
                      <div className="flex items-center gap-2 text-primary">
                        <span className="px-2 py-0.5 bg-primary/10 rounded-md">
                          Completed: {endDate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
