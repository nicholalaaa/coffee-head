
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoffeeLog, CoffeeBean } from '../types';
import { BRANDS } from '../constants';
import { BrandLogo } from './Tracker';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  XAxis,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  Share2, 
  Calendar,
  Coffee,
  Clock,
  Quote
} from 'lucide-react';

interface DashboardProps {
  logs: CoffeeLog[];
  beans: CoffeeBean[];
}

const Dashboard: React.FC<DashboardProps> = ({ logs, beans }) => {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().setHours(0,0,0,0));

  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(0,0,0,0);
      days.push(d.getTime());
    }
    return days;
  }, []);

  const groupedLogs = useMemo(() => {
    const groups: Record<number, CoffeeLog[]> = {};
    logs.forEach(log => {
      const dateKey = new Date(log.timestamp).setHours(0,0,0,0);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return groups;
  }, [logs]);

  const weeklyData = useMemo(() => {
    return calendarDays.slice(-7).map(time => {
      const count = (groupedLogs[time] || []).length;
      return { 
        day: new Date(time).toLocaleDateString([], { weekday: 'short' }), 
        count 
      };
    });
  }, [calendarDays, groupedLogs]);

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-24">
      <div className="flex justify-between items-center px-2">
        <h2 className="serif text-2xl font-bold text-[#3C2A21]">Insight</h2>
        <button className="bg-white p-3 rounded-full border border-[#E5E2DD] shadow-sm text-[#3C2A21]/40 hover:text-[#D4A373] transition-colors">
          <Share2 size={20} />
        </button>
      </div>

      {/* Coffee Streaks */}
      <section className="bg-white rounded-[40px] p-6 shadow-xl border border-[#E5E2DD] mx-2 overflow-hidden">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40">Coffee Streaks</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A373]">Past 14 Days</span>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 px-2 scroll-smooth no-scrollbar">
          {calendarDays.map(time => {
            const date = new Date(time);
            const isSelected = selectedDay === time;
            const hasLogs = (groupedLogs[time] || []).length > 0;
            return (
              <button
                key={time}
                onClick={() => setSelectedDay(time)}
                className={`flex-shrink-0 w-12 h-20 rounded-full flex flex-col items-center justify-center transition-all ${
                  isSelected ? 'bg-[#3C2A21] text-white shadow-lg' : 'bg-[#F5F2ED] text-[#3C2A21]/40'
                }`}
              >
                <span className="text-[8px] font-black uppercase mb-1">{date.toLocaleDateString([], { weekday: 'short' })}</span>
                <span className="text-sm font-black mb-2">{date.getDate()}</span>
                {hasLogs && (
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#D4A373]' : 'bg-[#D4A373]/60'}`} />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Daily Logs Timeline */}
      <section className="mx-2 space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Clock size={18} className="text-[#D4A373]" />
          <h3 className="serif text-xl font-bold text-[#3C2A21]">
            {new Date(selectedDay).toLocaleDateString([], { month: 'short', day: 'numeric' })} Logs
          </h3>
        </div>
        
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {(!groupedLogs[selectedDay] || groupedLogs[selectedDay].length === 0) ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="bg-white/40 border-2 border-dashed border-[#E5E2DD] rounded-[32px] p-12 text-center"
              >
                <Coffee size={32} className="mx-auto text-[#3C2A21]/10 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/20">No caffeine records for this day</p>
              </motion.div>
            ) : (
              groupedLogs[selectedDay].map(log => {
                const brand = BRANDS.find(b => b.id === log.brandId);
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-[32px] shadow-sm border border-[#E5E2DD] flex flex-col gap-4 group hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <BrandLogo brand={brand} size="w-12 h-12" />
                        <div>
                          <span className="block font-black text-[#3C2A21] text-sm">{log.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-bold text-[#D4A373] uppercase">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-[8px] font-black text-[#3C2A21]/10">·</span>
                            <span className="text-[8px] font-bold text-[#3C2A21]/40 uppercase">¥{log.price}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-[#3C2A21]">{log.caffeine}</span>
                        <span className="text-[8px] font-black text-[#D4A373] ml-1 uppercase">mg</span>
                      </div>
                    </div>
                    {log.thoughts && (
                      <div className="flex items-start gap-2 bg-[#F5F2ED] p-4 rounded-2xl border-l-4 border-[#D4A373]">
                        <Quote size={12} className="text-[#D4A373] mt-1 shrink-0" />
                        <p className="text-[12px] italic text-[#3C2A21]/60 leading-relaxed font-medium">{log.thoughts}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Weekly Intensity Chart */}
      <section className="bg-white rounded-[40px] p-8 shadow-xl border border-[#E5E2DD] mx-2">
        <h3 className="serif text-xl font-bold mb-6 flex items-center gap-2 text-[#3C2A21]">
          <Calendar size={20} className="text-[#D4A373]" /> Weekly Intensity
        </h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#3C2A21', opacity: 0.4 }} 
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.count > 2 ? '#3C2A21' : '#D4A373'} 
                    fillOpacity={entry.count === 0 ? 0.1 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
