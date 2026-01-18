import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, 
  Package, 
  Wallet, 
  LineChart, 
  X,
  Check,
  Zap,
  Trash2,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Scale,
  Ruler,
  MoonStar,
  Sparkles,
  Download,
  Database,
  Loader2
} from 'lucide-react';
import Tracker from './components/Tracker';
import Warehouse from './components/Warehouse';
import BudgetWallet from './components/BudgetWallet';
import Dashboard from './components/Dashboard';
import { CoffeeLog, CoffeeBean, UserStats, UserProfile, SleepDifficulty } from './types';
import { DEFAULT_AVATARS } from './constants';
import { db, requestPersistence } from './db';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tracker' | 'warehouse' | 'wallet' | 'dashboard'>('tracker');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [logs, setLogs] = useState<CoffeeLog[]>([]);
  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    monthlyBudget: 500,
    savingsGoal: 'Polaroid 600 Film',
    goalPrice: 150
  });
  
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Coffee Lover',
    avatar: 'user',
    dailyLimit: 400,
    preferredDrink: 'Americano',
    weight: 65,
    height: 170,
    sleepDifficulty: 'Normal'
  });

  // Load Data from IndexedDB on startup
  useEffect(() => {
    const initData = async () => {
      try {
        await requestPersistence();
        const [savedLogs, savedBeans, savedStats, savedProfile] = await Promise.all([
          db.get('coffee_logs'),
          db.get('coffee_beans'),
          db.get('user_stats'),
          db.get('user_profile')
        ]);
        
        if (savedLogs) setLogs(savedLogs);
        if (savedBeans) setBeans(savedBeans);
        if (savedStats) setUserStats(savedStats);
        if (savedProfile) setProfile(savedProfile);
      } catch (e) {
        console.error("Failed to load data from IndexedDB", e);
      } finally {
        setTimeout(() => setIsInitialLoading(false), 800);
      }
    };
    initData();
  }, []);

  // Sync Data to IndexedDB on changes
  useEffect(() => {
    if (isInitialLoading) return; // Prevent overwriting DB with initial state
    const saveData = async () => {
      await db.set('coffee_logs', logs);
      await db.set('coffee_beans', beans);
      await db.set('user_stats', userStats);
      await db.set('user_profile', profile);
    };
    saveData();
  }, [logs, beans, userStats, profile, isInitialLoading]);

  const recommendedLimit = useMemo(() => {
    let base = profile.weight * 5;
    if (profile.sleepDifficulty === 'Hard') base *= 0.7;
    if (profile.sleepDifficulty === 'Normal') base *= 0.85;
    return Math.round(Math.min(Math.max(base, 50), 600));
  }, [profile.weight, profile.sleepDifficulty]);

  const addLog = (log: CoffeeLog) => {
    setLogs(prev => [log, ...prev]);
    if (log.mode === 'HOME') {
      const dose = log.details?.beanWeight || 18;
      const targetBeanId = log.beanId || beans.find(b => b.hasBeenOpened && !b.isArchived && b.currentWeight >= dose)?.id;
      if (targetBeanId) {
        const targetBean = beans.find(b => b.id === targetBeanId);
        if (targetBean) {
          updateBean(targetBeanId, { currentWeight: Math.max(0, targetBean.currentWeight - dose) });
        }
      }
    }
  };

  const deleteLog = (id: string) => setLogs(prev => prev.filter(log => log.id !== id));
  const updateLog = (id: string, updates: Partial<CoffeeLog>) => {
    setLogs(prev => prev.map(log => log.id === id ? { ...log, ...updates } : log));
  };

  const addBean = (bean: CoffeeBean) => setBeans(prev => [bean, ...prev]);
  const updateBean = (id: string, updates: Partial<CoffeeBean>) => {
    setBeans(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };
  const deleteBean = (id: string) => setBeans(prev => prev.filter(b => b.id !== id));

  const exportData = () => {
    const data = { logs, beans, userStats, profile, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coffee-head-backup-${new Date().toLocaleDateString()}.json`;
    a.click();
    alert('Backup generated. Save it to iCloud or a notes app.');
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (imported.logs) setLogs(imported.logs);
          if (imported.beans) setBeans(imported.beans);
          if (imported.userStats) setUserStats(imported.userStats);
          if (imported.profile) setProfile(imported.profile);
          alert('Success! Your footprints have returned.');
        } catch (err) { alert('Invalid backup file.'); }
      };
      reader.readAsText(file);
    }
  };

  const clearAllData = () => {
    if (confirm('Wipe everything? This cannot be undone.')) {
      indexedDB.deleteDatabase(db.name);
      localStorage.clear();
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'tracker', icon: Coffee, label: 'Tracker' },
    { id: 'warehouse', icon: Package, label: 'Beans' },
    { id: 'wallet', icon: Wallet, label: 'Wallet' },
    { id: 'dashboard', icon: LineChart, label: 'Insight' },
  ] as const;

  const renderAvatar = (avatar: string, size: number = 24, className: string = "") => {
    if (avatar.startsWith('data:image')) return <img src={avatar} className={`w-full h-full object-cover ${className}`} alt="Avatar" />;
    const preset = DEFAULT_AVATARS.find(a => a.id === avatar) || DEFAULT_AVATARS[0];
    const IconComp = preset.icon;
    return <IconComp size={size} className={className} />;
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F2ED] text-[#3C2A21]">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
           <div className="w-20 h-20 bg-white rounded-[32px] shadow-2xl flex items-center justify-center mx-auto mb-6 border border-[#E5E2DD]">
             <Coffee size={40} className="text-[#3C2A21]" />
           </div>
           <div className="flex items-center gap-2 justify-center">
             <Loader2 size={16} className="animate-spin text-[#D4A373]" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Restoring Experience</p>
           </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-[#F5F2ED] relative pb-24 shadow-2xl overflow-hidden">
      <header className="p-8 pt-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="serif text-3xl font-bold tracking-tight text-[#3C2A21]">Coffee Head</h1>
            <p className="text-xs uppercase tracking-widest text-[#D4A373] mt-1 font-semibold">{profile.name} · 咖啡脑袋</p>
          </div>
          <button onClick={() => setIsProfileOpen(true)} className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#E5E2DD] active:scale-95 transition-transform overflow-hidden group">
            <div className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform">
              {renderAvatar(profile.avatar, 24, "text-[#3C2A21]")}
            </div>
          </button>
        </div>
      </header>

      <main className="flex-1 px-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            {activeTab === 'tracker' && <Tracker logs={logs} beans={beans} profile={profile} onAddLog={addLog} onDeleteLog={deleteLog} onUpdateLog={updateLog} />}
            {activeTab === 'warehouse' && <Warehouse beans={beans} onAddBean={addBean} onUpdateBean={updateBean} onDeleteBean={deleteBean} />}
            {activeTab === 'wallet' && <BudgetWallet logs={logs} beans={beans} userStats={userStats} onUpdateStats={setUserStats} />}
            {activeTab === 'dashboard' && <Dashboard logs={logs} beans={beans} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isProfileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProfileOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 z-[110] p-8 bg-[#F5F2ED] rounded-t-[48px] shadow-2xl border-t border-[#E5E2DD] max-w-md mx-auto max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="w-12 h-1.5 bg-[#E5E2DD] rounded-full mx-auto mb-8" />
              <div className="flex justify-between items-center mb-8">
                <h3 className="serif text-2xl font-bold text-[#3C2A21]">Profile Settings</h3>
                <button onClick={() => setIsProfileOpen(false)} className="p-3 bg-white rounded-full text-[#3C2A21]/20"><X size={20} /></button>
              </div>

              <div className="space-y-8 pb-12">
                <div className="bg-white rounded-[32px] p-6 shadow-sm space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-1"><Scale size={12} /> Weight (kg)</label>
                         <input type="number" value={profile.weight} onChange={e => setProfile({...profile, weight: Number(e.target.value)})} className="w-full bg-[#F5F2ED] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#D4A373] focus:outline-none" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-1"><Ruler size={12} /> Height (cm)</label>
                         <input type="number" value={profile.height} onChange={e => setProfile({...profile, height: Number(e.target.value)})} className="w-full bg-[#F5F2ED] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#D4A373] focus:outline-none" />
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-1"><MoonStar size={12} /> Sleep Difficulty</label>
                      <div className="flex bg-[#F5F2ED] p-1 rounded-[20px] gap-1">
                        {(['Easy', 'Normal', 'Hard'] as SleepDifficulty[]).map(level => (
                           <button key={level} onClick={() => setProfile({...profile, sleepDifficulty: level})} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${profile.sleepDifficulty === level ? 'bg-[#3C2A21] text-white shadow-md' : 'text-[#3C2A21]/40'}`}>{level}</button>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-2"><Database size={12} /> Data Persistence</h4>
                  <div className="bg-white rounded-[32px] p-6 shadow-sm space-y-4">
                     <div className="flex items-center gap-4">
                        <button onClick={exportData} className="flex-1 bg-[#F5F2ED] p-5 rounded-2xl flex flex-col items-center gap-2 hover:bg-white border border-transparent hover:border-[#D4A373] transition-all">
                           <Download size={20} className="text-[#D4A373]" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-[#3C2A21]">Export JSON</span>
                        </button>
                        <label className="flex-1 bg-[#F5F2ED] p-5 rounded-2xl flex flex-col items-center gap-2 hover:bg-white border border-transparent hover:border-[#D4A373] cursor-pointer transition-all">
                           <ImageIcon size={20} className="text-[#D4A373]" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-[#3C2A21]">Import JSON</span>
                           <input type="file" accept=".json" onChange={importData} className="hidden" />
                        </label>
                     </div>
                     <p className="text-[9px] text-[#3C2A21]/40 font-bold px-2 italic text-center">Using IndexedDB for stability. Export and save to iCloud to be 100% safe.</p>
                  </div>
                </div>

                <div className="pt-4"><button onClick={clearAllData} className="w-full bg-white border border-red-100 text-red-400 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><Trash2 size={14} /> Wipe All Records</button></div>
                <div className="pt-4"><button onClick={() => setIsProfileOpen(false)} className="w-full bg-[#3C2A21] text-white py-6 rounded-[32px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3"><Check size={20} /> Close Profile</button></div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-[#E5E2DD] px-8 py-4 flex justify-between items-center z-50">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === id ? 'text-[#D4A373] scale-110' : 'text-[#3C2A21]/40'}`}>
            <Icon size={activeTab === id ? 28 : 24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;