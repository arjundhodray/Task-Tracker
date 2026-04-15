import React, { useState } from 'react';
import { Gift, Plus, Trash2, ExternalLink, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WishlistItem {
  id: string;
  title: string;
  link?: string;
  completed?: boolean;
}

export function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([
    { id: '1', title: 'New Mechanical Keyboard', completed: false },
    { id: '2', title: 'Read "Atomic Habits"', completed: true }
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLink, setNewLink] = useState('');

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    const newItem: WishlistItem = {
      id: Date.now().toString(),
      title: newTitle,
      link: newLink,
      completed: false
    };
    
    setItems([newItem, ...items]);
    setIsAdding(false);
    setNewTitle('');
    setNewLink('');
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Wishlist</h2>
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
            onSubmit={addItem}
            className="m3-card bg-primary-container/20 border-2 border-primary/20 space-y-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary uppercase">Item Name</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="m3-input font-bold"
                placeholder="What do you want?"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-primary uppercase">Link (Optional)</label>
              <input 
                type="url" 
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                className="m3-input"
                placeholder="https://..."
              />
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
                Save Item
              </button>
            </div>
          </motion.form>
        )}

        {items.map((item) => (
          <motion.div
            layout
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`m3-card !p-3 group flex items-center gap-3 transition-all ${
              item.completed ? 'opacity-60 bg-surface-variant/10' : 'bg-surface-variant/20 hover:bg-surface-variant/40'
            }`}
          >
            <div 
              onClick={() => toggleItem(item.id)}
              className={`transition-all cursor-pointer p-1 rounded-full hover:bg-primary/10 flex-shrink-0 ${
                item.completed ? 'text-primary' : 'text-outline'
              }`}
            >
              {item.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </div>

            <div className="flex flex-col flex-1">
              <h4 className={`text-base font-bold ${item.completed ? 'line-through' : ''}`}>
                {item.title}
              </h4>
              {item.link && (
                <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium mt-0.5">
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={12} />
                    <span>Link</span>
                  </a>
                </div>
              )}
            </div>

            <button 
              onClick={() => deleteItem(item.id)}
              className="p-2 text-outline hover:text-error transition-colors md:opacity-0 md:group-hover:opacity-100 flex-shrink-0"
            >
              <Trash2 size={20} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {items.length === 0 && !isAdding && (
        <div className="text-center py-20 opacity-40">
          <Gift size={64} className="mx-auto mb-4" />
          <p>Your wishlist is empty</p>
        </div>
      )}
    </div>
  );
}
