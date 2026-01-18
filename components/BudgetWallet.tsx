
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoffeeLog, CoffeeBean, UserStats } from '../types';
import { 
  TrendingUp, 
  PiggyBank, 
  Settings2, 
  ChevronRight,
  TrendingDown,
  Target,
  X,
  Check,
  Edit3,
  CreditCard,
  Rocket,
  Coffee,
  Info,
  CalendarDays,
  AlertCircle
} from 'lucide-react';

interface WalletProps {
  logs: CoffeeLog[];
  beans: CoffeeBean[];
  userStats: UserStats;
  onUpdateStats: (stats: UserStats) => void;
}

const BudgetWallet: React.FC<WalletProps> = ({ logs, beans, userStats, onUpdateStats }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [tempStats, setTempStats] = useState<UserStats>(userStats);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // 1. Calculate the Dynamic Benchmark Price
  const { benchmarkPrice, benchmarkSource } = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const last30DaysCafeLogs = logs.filter(l => l.mode === 'BRAND' && l.timestamp > thirtyDaysAgo);
    
    if (last30DaysCafeLogs.length >= 5) {
      const avg = last30DaysCafeLogs.reduce((acc, l) => acc + l.price, 0) / last30DaysCafeLogs.length;
      return { benchmarkPrice: avg, benchmarkSource: 'Personalized (30d Avg)' };
    }
    
    // User can still manually override in settings, if they haven't, use 30
    const finalPrice = userStats.cafeBenchmark || 30;
    return { 
      benchmarkPrice: finalPrice, 
      benchmarkSource: userStats.cafeBenchmark ? 'Manual Override' : 'System Default' 
    };
  }, [logs, userStats.cafeBenchmark]);

  // 2. Calculate average cost per gram based on warehouse (FIXED: Defaults to 0)
  const avgBeanCostPerG = useMemo(() => {
    if (beans.length === 0) return 0; // No beans, no cost
    const totalCost = beans.reduce((acc, b) => acc + (b.price / b.totalWeight), 0);
    return totalCost / beans.length;
  }, [beans]);

  // 3. Precise savings calculation based on EACH log's actual input dose
  const { totalSavings, monthlyHomeCost } = useMemo(() => {
    const homeLogs = logs.filter(l => l.mode === 'HOME');
    let savings = 0;
    let currentMonthCost = 0;

    homeLogs.forEach(log => {
      const isThisMonth = new Date(log.timestamp).getMonth() === currentMonth;
      const dose = log.details?.beanWeight || 18; 
      
      // If we have no beans in warehouse, we can't calculate a real cost,
      // so we assume ¥0 home cost for historical logs if warehouse was empty (conservative)
      const costOfThisCup = dose * avgBeanCostPerG;
      
      savings += (benchmarkPrice - costOfThisCup);
      if (isThisMonth) {
        currentMonthCost += costOfThisCup;
      }
    });

    return { 
      totalSavings: Math.max(0, savings), 
      monthlyHomeCost: currentMonthCost 
    };
  }, [logs, avgBeanCostPerG, benchmarkPrice, currentMonth]);

  const monthlyLogs = logs.filter(log => {
    const d = new Date(log.timestamp);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const spent = monthlyLogs.reduce((acc, log) => acc + log.price, 0);
  const percentUsed = Math.min((spent / userStats.monthlyBudget) * 100, 100);

  const handleSave = () => {
    onUpdateStats(tempStats);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-in zoom-in duration-500 pb-12">
      <div className="flex justify-between items-center px-2">
        <h2 className="serif text-2xl font-bold">Coffee Wallet</h2>
        <div className="flex gap-2">
           <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-3 bg-white rounded-full shadow-sm border border-[#E5E2DD] text-[#3C2A21]/20 hover:text-[#D4A373] transition-colors"
          >
            <Info size={20} />
          </button>
          <button 
            onClick={() => setIsEditing(true)}
            className="p-3 bg-white rounded-full shadow-sm border border-[#E5E2DD] text-[#3C2A21]/40 hover:text-[#D4A373] transition-colors"
          >
            <Settings2 size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#3C2A21] text-white/80 p-6 rounded-[32px] text-[11px] leading-relaxed mx-2 space-y-3"
          >
            <p className="font-bold text-[#D4A373] mb-1 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={12} /> Smart Savings Engine
            </p>
            <div>
              <p className="text-white font-bold mb-1">1. Precise Cost Tracking</p>
              <p>Home-brew cost is calculated using your <span className="text-[#D4A373]">actual input weight (g)</span> for each session multiplied by your warehouse average bean price.</p>
            </div>
            <div>
              <p className="text-white font-bold mb-1">2. Dynamic Benchmark</p>
              <p>Current Baseline: <span className="text-[#D4A373]">¥{benchmarkPrice.toFixed(1)}</span></p>
              <p className="opacity-60 italic">Source: {benchmarkSource}</p>
            </div>
          </motion.div>
        )}

        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#F5F2ED] w-full max-w-sm rounded-[48px] p-8 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="serif text-2xl font-bold">Wallet Settings</h3>
                <button onClick={() => setIsEditing(false)} className="text-[#3C2A21]/20"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-2">
                    <CreditCard size={12} /> Monthly Budget (¥)
                  </label>
                  <input 
                    type="number"
                    value={tempStats.monthlyBudget}
                    onChange={e => setTempStats({...tempStats, monthlyBudget: Number(e.target.value)})}
                    className="w-full bg-white rounded-[24px] p-5 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#D4A373] focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-2">
                    <CalendarDays size={12} /> Manual Cafe Price (¥)
                  </label>
                  <div className="relative">
                    <input 
                      type="number"
                      placeholder="Overrides Dynamic Avg"
                      value={tempStats.cafeBenchmark || ''}
                      onChange={e => setTempStats({...tempStats, cafeBenchmark: e.target.value ? Number(e.target.value) : undefined})}
                      className="w-full bg-white rounded-[24px] p-5 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#D4A373] focus:outline-none"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] text-[#3C2A21]/20 font-bold uppercase">Base</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-2">
                    <Rocket size={12} /> Goal Setup Name
                  </label>
                  <input 
                    type="text"
                    value={tempStats.savingsGoal}
                    onChange={e => setTempStats({...tempStats, savingsGoal: e.target.value})}
                    className="w-full bg-white rounded-[24px] p-5 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#D4A373] focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-2">
                    <Target size={12} /> Goal Price (¥)
                  </label>
                  <input 
                    type="number"
                    value={tempStats.goalPrice}
                    onChange={e => setTempStats({...tempStats, goalPrice: Number(e.target.value)})}
                    className="w-full bg-white rounded-[24px] p-5 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#D4A373] focus:outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-[#3C2A21] text-white py-5 rounded-[28px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <Check size={20} /> Update Wallet
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Tube Budget Visual */}
      <div className="bg-white rounded-[40px] p-8 shadow-xl border border-[#E5E2DD] flex gap-8 items-center mx-2">
        <div className="relative w-16 h-48 bg-[#F5F2ED] rounded-full border-4 border-white shadow-inner overflow-hidden flex items-end">
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${percentUsed}%` }}
            className={`w-full relative transition-colors duration-500 ${percentUsed > 90 ? 'bg-red-500' : 'bg-[#3C2A21]'}`}
            style={{ borderRadius: '0 0 100px 100px' }}
          >
            <div className="absolute -top-1 left-0 right-0 h-2 bg-[#D4A373]/80 blur-[2px] rounded-full" />
          </motion.div>
          <div className="absolute inset-0 flex flex-col justify-between py-6 px-4 pointer-events-none">
            {[100, 75, 50, 25, 0].map(val => (
              <div key={val} className="h-px w-2 bg-[#3C2A21]/10 self-end" />
            ))}
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40">Monthly Out-of-Pocket</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#3C2A21]">¥{spent.toFixed(0)}</span>
              <span className="text-sm font-bold text-[#D4A373]">/ ¥{userStats.monthlyBudget}</span>
            </div>
          </div>
          <div className="p-4 bg-[#F5F2ED] rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase">
              <span>Limit Safe</span>
              <span className={`font-black ${spent > userStats.monthlyBudget ? 'text-red-500' : 'text-[#3C2A21]'}`}>
                ¥{(userStats.monthlyBudget - spent).toFixed(0)}
              </span>
            </div>
            <div className="h-1 bg-white rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${spent > userStats.monthlyBudget ? 'bg-red-400' : 'bg-[#D4A373]'}`} 
                style={{ width: `${spent > userStats.monthlyBudget ? 100 : 100 - percentUsed}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cost Efficiency Details */}
      <section className="grid grid-cols-2 gap-4 mx-2">
        <div className="bg-[#3C2A21] text-white p-6 rounded-[32px] shadow-lg flex flex-col justify-between h-40">
          <div>
            <TrendingDown size={24} className="text-[#D4A373] mb-2" />
            <span className="block text-[8px] font-black uppercase tracking-widest opacity-60">Avg. Home Unit Cost</span>
          </div>
          <div>
            <p className="text-2xl font-black">
              {avgBeanCostPerG > 0 ? `¥${(avgBeanCostPerG * 18).toFixed(1)}` : '¥0.0'}
            </p>
            <p className="text-[10px] mt-1 opacity-40">
              {avgBeanCostPerG > 0 ? 'est. per 18g dose' : 'No beans added'}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-[#E5E2DD] shadow-lg flex flex-col justify-between h-40">
          <div>
            <PiggyBank size={24} className="text-[#D4A373] mb-2" />
            <span className="block text-[8px] font-black uppercase tracking-widest text-[#3C2A21]/40">Accumulated Savings</span>
          </div>
          <div>
            <p className="text-2xl font-black text-[#3C2A21]">¥{totalSavings.toFixed(0)}</p>
            <p className="text-[10px] mt-1 text-[#3C2A21]/40">vs ¥{benchmarkPrice.toFixed(0)} Cafe Avg</p>
          </div>
        </div>
      </section>

      {/* Goal Progress Section */}
      <section className="bg-white p-8 rounded-[40px] shadow-xl border border-[#E5E2DD] relative overflow-hidden mx-2">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-[#F5F2ED] rounded-2xl text-[#3C2A21]">
            <Target size={24} />
          </div>
          <div className="text-right max-w-[60%]">
            <span className="block text-[8px] font-black uppercase tracking-widest text-[#3C2A21]/40">Goal Setup</span>
            <p className="font-black text-[#3C2A21] truncate leading-tight">{userStats.savingsGoal}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-4xl font-black text-[#3C2A21] tracking-tighter">
              {((totalSavings / userStats.goalPrice) * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] font-bold text-[#D4A373] uppercase tracking-widest">
              ¥{totalSavings.toFixed(0)} / ¥{userStats.goalPrice}
            </span>
          </div>
          <div className="h-4 bg-[#F5F2ED] rounded-full overflow-hidden p-1 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalSavings / userStats.goalPrice) * 100, 100)}%` }}
              className="h-full bg-gradient-to-r from-[#D4A373] to-[#3C2A21] rounded-full relative"
            >
               <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-[#3C2A21]/40 uppercase tracking-widest pt-2">
            <span>Current Fund</span>
            <span>Target Reached</span>
          </div>
        </div>
      </section>

      {/* Empty State Warning */}
      {beans.length === 0 && (
        <div className="mx-4 p-5 bg-amber-50 border border-amber-200 rounded-[32px] flex items-center gap-4">
          <div className="p-2 bg-amber-100 rounded-full text-amber-600">
            <AlertCircle size={20} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Setup Required</p>
            <p className="text-[9px] text-amber-700/60 leading-tight">Add your coffee beans in the Warehouse tab to enable precise cost tracking.</p>
          </div>
        </div>
      )}

      {/* Saving Tips */}
      <div className="mx-4 p-6 bg-[#D4A373]/5 border border-[#D4A373]/20 rounded-[32px] text-center">
        <p className="text-[10px] font-bold text-[#D4A373] uppercase tracking-[0.2em] mb-1">
          Opportunity Gain Insights
        </p>
        <p className="text-[9px] text-[#3C2A21]/40 font-bold uppercase tracking-widest">
          {benchmarkSource === 'Personalized (30d Avg)' 
            ? `Calculated based on your actual spending habits` 
            : `Using standard coffee market benchmarks`}
        </p>
      </div>
    </div>
  );
};

export default BudgetWallet;
