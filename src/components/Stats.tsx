import { useTasks } from '../hooks/useTasks';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { Trophy, Target, Award, Database, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { format, subDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, subMonths, subYears, startOfYear } from 'date-fns';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import React, { useState, useMemo } from 'react';

type TimeRange = '7d' | '1m' | '1y';

export function Stats() {
  const { stats } = useTasks();
  const { profile, user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const seedData = async () => {
    if (!user) return;
    const days = 365; // Seed a full year for testing
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const percentage = Math.floor(Math.random() * 60) + 40; // 40-100%
      const statId = `${user.uid}_${date}`;
      await setDoc(doc(db, 'dailyStats', statId), {
        userId: user.uid,
        date,
        completedCount: Math.floor(percentage / 20),
        totalCount: 5,
        percentage
      });
    }
  };

  const chartData = useMemo(() => {
    const now = new Date();
    let daysToFetch = 7;
    let formatStr = 'MMM dd';

    if (timeRange === '1m') {
      daysToFetch = 30;
    } else if (timeRange === '1y') {
      daysToFetch = 365;
      formatStr = 'MMM';
    }

    const rawData = Array.from({ length: daysToFetch }, (_, i) => {
      const date = format(subDays(now, i), 'yyyy-MM-dd');
      const dayStat = stats.find(s => s.date === date);
      return {
        date: format(subDays(now, i), formatStr),
        percentage: dayStat ? dayStat.percentage : 0,
        fullDate: date,
        month: format(subDays(now, i), 'yyyy-MM')
      };
    }).reverse();

    if (timeRange === '1y') {
      // Aggregate by month for the yearly view
      const monthlyData: { [key: string]: { date: string, total: number, count: number } } = {};
      rawData.forEach(d => {
        if (!monthlyData[d.month]) {
          monthlyData[d.month] = { date: format(parseISO(d.fullDate), 'MMM'), total: 0, count: 0 };
        }
        monthlyData[d.month].total += d.percentage;
        monthlyData[d.month].count += 1;
      });
      return Object.values(monthlyData).map(m => ({
        date: m.date,
        percentage: Math.round(m.total / m.count)
      }));
    }

    return rawData;
  }, [stats, timeRange]);

  const averageCompletion = stats.length > 0
    ? Math.round(stats.reduce((acc, curr) => acc + curr.percentage, 0) / stats.length)
    : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-variant p-3 rounded-xl shadow-lg border border-outline/20">
          <p className="text-xs font-bold uppercase tracking-wider text-outline mb-1">
            {payload[0].payload.date}
          </p>
          <p className="text-lg font-bold text-primary">
            {Math.round(payload[0].value)}% {timeRange === '1y' ? 'Avg.' : ''} Completed
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Progress</h2>
        <p className="text-on-surface-variant">Consistency is the key to success.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="m3-card bg-tertiary-container/30 flex items-center gap-4">
          <div className="p-3 bg-tertiary/10 rounded-2xl">
            <Trophy className="text-tertiary" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-tertiary">Longest Streak</p>
            <p className="text-2xl font-bold">{profile?.longestStreak || 0} days</p>
          </div>
        </div>
        <div className="m3-card bg-primary-container/30 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Target className="text-primary" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Avg. Completion</p>
            <p className="text-2xl font-bold">{averageCompletion}%</p>
          </div>
        </div>
        <div className="m3-card bg-secondary-container/30 flex items-center gap-4">
          <div className="p-3 bg-secondary/10 rounded-2xl">
            <Award className="text-secondary" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">Total Days</p>
            <p className="text-2xl font-bold">{stats.length} days</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="m3-card flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-outline">
            {timeRange === '7d' ? 'Last 7 Days' : timeRange === '1m' ? 'Last 30 Days' : 'Last 12 Months'}
          </h3>
          
          <div className="flex bg-surface-variant/30 p-1 rounded-xl w-full md:w-auto">
            {(['7d', '1m', '1y'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  timeRange === range 
                    ? 'bg-primary text-on-primary shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface-variant/50'
                }`}
              >
                {range === '7d' ? '7D' : range === '1m' ? '1M' : '1Y'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPct" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(121, 116, 126, 0.1)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--color-outline)', fontSize: 10, fontWeight: 500 }}
                dy={10}
                interval={timeRange === '7d' ? 0 : timeRange === '1m' ? 5 : 0}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--color-outline)', fontSize: 10 }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="percentage" 
                stroke="var(--color-primary)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPct)"
                dot={timeRange === '7d' ? { r: 4, fill: 'var(--color-primary)', strokeWidth: 2, stroke: 'var(--color-surface)' } : false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="m3-card bg-surface-variant/20 text-center italic">
        <p className="text-on-surface-variant">
          "Success is the sum of small efforts, repeated day in and day out."
        </p>
        <p className="text-xs font-bold mt-2 not-italic text-outline">— Robert Collier</p>
      </div>

      {/* Dev Tools */}
      <div className="pt-8 flex justify-center">
        <button 
          onClick={seedData}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors"
        >
          <Database size={14} />
          Seed Test Data
        </button>
      </div>
    </div>
  );
}
