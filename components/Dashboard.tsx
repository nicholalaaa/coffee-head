import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoffeeLog, CoffeeBean } from '../types';
import { BRANDS } from '../constants';
import { BrandLogo } from './Tracker';
import { 
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import { 
  Share2, 
  Calendar,
  Coffee,
  Clock,
  Quote,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Banknote,
  Zap,
  Target,
  Award
} from 'lucide-react';

interface DashboardProps {
  logs: CoffeeLog[];
  beans: CoffeeBean[];
}

const Dashboard: React.FC<DashboardProps> = ({ logs, beans }) => {
  // 1. Month Navigation Logic
  const [viewDate, setViewDate] = useState(new Date());
  
  const nextMonth = () => {
    const next = new Date(viewDate);
    next.setMonth(next.getMonth() + 1);
    if (next <= new Date()) setViewDate(next);
  };

  const prevMonth = () => {
    const prev = new Date(viewDate);
    prev.setMonth(prev.getMonth() - 1);
    setViewDate(prev);
  };

  const isCurrentMonth = viewDate.getMonth() === new Date().getMonth() && 
                        viewDate.getFullYear() === new Date().getFullYear();

  // 2. Filter logs for the selected month
  const monthlyLogs = useMemo(() => {
    return logs.filter(log => {
      const d = new Date(log.timestamp);
      return d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
    });
  }, [logs, viewDate]);

  // 3. Stats calculation
  const stats = useMemo(() => {
    const totalSpent = monthlyLogs.reduce((acc, l) => acc + l.price, 0);
    const totalCaffeine = monthlyLogs.reduce((acc, l) => acc + l.caffeine, 0);
    const coffeeCount = monthlyLogs.length;
    
    // Most frequent brand
    const brandCounts: Record<string, number> = {};
    monthlyLogs.forEach(l => {
      if (l.brandId) brandCounts[l.brandId] = (brandCounts[l.brandId] || 0) + 1;
    });
    const topBrandId = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topBrand = BRANDS.find(b => b.id === topBrandId);

    return { totalSpent, totalCaffeine, coffeeCount, topBrand };
  }, [monthlyLogs]);

  // 4. Daily average for the selected month
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const dailyData = useMemo(() => {
    const data = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, count: 0 }));
    monthlyLogs.forEach(log => {
      const day = new Date(log.timestamp).getDate();
      data[day - 1].count += 1;
    });
    return data;
  }, [monthlyLogs, daysInMonth]);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-24">
      {/* Header & Month Switcher */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="serif text-2xl font-bold text-[#3C2A21]">Archive</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#D4A373]">Review your footprints</p>
        </div>
        <div className="flex items-center bg-white rounded-full p-1 border border-[#E5E2DD] shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-[#F5F2ED] rounded-full transition-colors text-[#3C2A21]">
            <ChevronLeft size={16} />
          </button>
          <span className="px-4 text-[10px] font-black uppercase tracking-widest text-[#3C2A21]">
            {viewDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
          </span>
          <button 
            onClick={nextMonth} 
            disabled={isCurrentMonth}
            className={`p-2 rounded-full transition-colors ${isCurrentMonth ? 'text-[#E5E2DD]' : 'hover:bg-[#F5F2ED] text-[#3C2A21]'}`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mx-2">
        <div className="bg-[#3C2A21] text-white p-6 rounded-[32px] shadow-lg flex flex-col justify-between h-36">
           <Banknote size={20} className="text-[#D4A373]" />
           <div>
              <p className="text-2xl font-black">¥{stats.totalSpent.toFixed(0)}</p>
              <p className="text-[9px] font-bold uppercase opacity-40 tracking-widest">Total Spent</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-[#E5E2DD] shadow-lg flex flex-col justify-between h-36">
           <Zap size={20} className="text-[#D4A373]" />
           <div>
              <p className="text-2xl font-black text-[#3C2A21]">{stats.totalCaffeine}</p>
              <p className="text-[9px] font-bold uppercase text-[#3C2A21]/30 tracking-widest">Total mg</p>
           </div>
        </div>
      </div>

      {/* Performance Card */}
      <section className="bg-white rounded-[40px] p-8 shadow-xl border border-[#E5E2DD] mx-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-[#D4A373]/10">
          <Award size={80} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Target size={20} className="text-[#D4A373]" />
            <h3 className="serif text-xl font-bold">Monthly Highlight</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F5F2ED] flex items-center justify-center text-[#3C2A21]">
                <Coffee size={24} />
              </div>
              <div>
                <span className="block text-2xl font-black text-[#3C2A21]">{stats.coffeeCount}</span>
                <span className="text-[10px] font-bold uppercase text-[#3C2A21]/40 tracking-widest">Sips this month</span>
              </div>
            </div>

            {stats.topBrand && (
              <div className="flex items-center gap-4">
                <BrandLogo brand={stats.topBrand} size="w-12 h-12" />
                <div>
                  <span className="block text-xl font-black text-[#3C2A21]">{stats.topBrand.name}</span>
                  <span className="text-[10px] font-bold uppercase text-[#3C2A21]/40 tracking-widest">Most visited brand</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Heatmap/Bar chart of daily intake */}
      <section className="bg-white rounded-[40px] p-8 shadow-xl border border-[#E5E2DD] mx-2">
        <div className="flex justify-between items-center mb-6">
          <h3 className="serif text-xl font-bold flex items-center gap-2 text-[#3C2A21]">
            <Calendar size={20} className="text-[#D4A373]" /> Daily Intensity
          </h3>
          <span className="text-[10px] font-black text-[#3C2A21]/20 uppercase">Sips / Day</span>
        </div>
        <div className="h-48 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3C2A21" strokeOpacity={0.05} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 8, fontWeight: 'bold', fill: '#3C2A21', opacity: 0.2 }} 
                interval={4}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 8, fontWeight: 'bold', fill: '#3C2A21', opacity: 0.2 }}
                allowDecimals={false}
                width={25}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {dailyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.count > 0 ? '#3C2A21' : '#F5F2ED'} 
                    fillOpacity={entry.count > 2 ? 1 : 0.6}
                    onClick={() => setSelectedDay(entry.day)}
                    className="cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Selected Day Logs - Monthly context */}
      <AnimatePresence>
        {monthlyLogs.length > 0 && (
          <section className="mx-2 space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Clock size={18} className="text-[#D4A373]" />
              <h3 className="serif text-xl font-bold text-[#3C2A21]">Full Log History</h3>
            </div>
            
            <div className="space-y-3">
              {monthlyLogs.map(log => {
                const brand = BRANDS.find(b => b.id === log.brandId);
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white p-5 rounded-[28px] shadow-sm border border-[#E5E2DD] flex flex-col gap-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <BrandLogo brand={brand} size="w-10 h-10" />
                        <div>
                          <span className="block font-black text-[#3C2A21] text-xs">{log.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-bold text-[#D4A373] uppercase">
                              {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-[#3C2A21]">¥{log.price}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </AnimatePresence>

      {monthlyLogs.length === 0 && (
        <div className="mx-2 p-12 bg-white/40 border-2 border-dashed border-[#E5E2DD] rounded-[40px] text-center">
          <Coffee size={40} className="mx-auto text-[#3C2A21]/5 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3C2A21]/20">No data for this period</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;