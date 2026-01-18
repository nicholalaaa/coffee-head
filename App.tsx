
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, 
  Package, 
  Wallet, 
  LineChart, 
  Plus, 
  Camera, 
  History, 
  Archive, 
  User, 
  ChevronRight,
  TrendingUp,
  MapPin,
  X,
  Check,
  Zap,
  Quote,
  Trash2,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Scale,
  Ruler,
  MoonStar,
  Sparkles,
  Info
} from 'lucide-react';
import Tracker from './components/Tracker';
import Warehouse from './components/Warehouse';
import BudgetWallet from './components/BudgetWallet';
import Dashboard from './components/Dashboard';
import { CoffeeLog, CoffeeBean, UserStats, UserProfile, SleepDifficulty } from './types';
import { DEFAULT_AVATARS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tracker' | 'warehouse' | 'wallet' | 'dashboard'>('tracker');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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

  const recommendedLimit = useMemo(() => {
    let base = profile.weight * 5;
    if (profile.sleepDifficulty === 'Hard') base *= 0.7;
    if (profile.sleepDifficulty === 'Normal') base *= 0.85;
    return Math.round(Math.min(Math.max(base, 50), 600));
  }, [profile.weight, profile.sleepDifficulty]);

  useEffect(() => {
    const savedLogs = localStorage.getItem('coffee_logs');
    const savedBeans = localStorage.getItem('coffee_beans');
    const savedStats = localStorage.getItem('user_stats');
    const savedProfile = localStorage.getItem('user_profile');
    
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedBeans) setBeans(JSON.parse(savedBeans));
    if (savedStats) setUserStats(JSON.parse(savedStats));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  useEffect(() => {
    localStorage.setItem('coffee_logs', JSON.stringify(logs));
    localStorage.setItem('coffee_beans', JSON.stringify(beans));
    localStorage.setItem('user_stats', JSON.stringify(userStats));
    localStorage.setItem('user_profile', JSON.stringify(profile));
  }, [logs, beans, userStats, profile]);

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

  const deleteLog = (id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  };

  const updateLog = (id: string, updates: Partial<CoffeeLog>) => {
    setLogs(prev => prev.map(log => log.id === id ? { ...log, ...updates } : log));
  };

  const addBean = (bean: CoffeeBean) => setBeans(prev => [bean, ...prev]);
  const updateBean = (id: string, updates: Partial<CoffeeBean>) => {
    setBeans(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBean = (id: string) => {
    setBeans(prev => prev.filter(b => b.id !== id));
  };

  const tabs = [
    { id: 'tracker', icon: Coffee, label: 'Tracker' },
    { id: 'warehouse', icon: Package, label: 'Beans' },
    { id: 'wallet', icon: Wallet, label: 'Wallet' },
    { id: 'dashboard', icon: LineChart, label: 'Insight' },
  ] as const;

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderAvatar = (avatar: string, size: number = 24, className: string = "") => {
    if (avatar.startsWith('data:image')) {
      return <img src={avatar} className={`w-full h-full object-cover ${className}`} alt="Avatar" />;
    }
    const preset = DEFAULT_AVATARS.find(a => a.id === avatar) || DEFAULT_AVATARS[0];
    const IconComp = preset.icon;
    return <IconComp size={size} className={className} />;
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-[#F5F2ED] relative pb-24 shadow-2xl overflow-hidden">
      <header className="p-8 pt-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="serif text-3xl font-bold tracking-tight text-[#3C2A21]">Coffee Head</h1>
            <p className="text-xs uppercase tracking-widest text-[#D4A373] mt-1 font-semibold">{profile.name} · 咖啡脑袋</p>
          </div>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#E5E2DD] active:scale-95 transition-transform overflow-hidden group"
          >
            <div className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform">
              {renderAvatar(profile.avatar, 24, "text-[#3C2A21]")}
            </div>
          </button>
        </div>
      </header>

      <main className="flex-1 px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'tracker' && (
              <Tracker 
                logs={logs} 
                beans={beans}
                profile={profile}
                onAddLog={addLog} 
                onDeleteLog={deleteLog} 
                onUpdateLog={updateLog} 
              />
            )}
            {activeTab === 'warehouse' && (
              <Warehouse 
                beans={beans} 
                onAddBean={addBean} 
                onUpdateBean={updateBean} 
                onDeleteBean={deleteBean} 
              />
            )}
            {activeTab === 'wallet' && <BudgetWallet logs={logs} beans={beans} userStats={userStats} onUpdateStats={setUserStats} />}
            {activeTab === 'dashboard' && <Dashboard logs={logs} beans={beans} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isProfileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsProfileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[110] p-8 bg-[#F5F2ED] rounded-t-[48px] shadow-2xl border-t border-[#E5E2DD] max-w-md mx-auto max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="w-12 h-1.5 bg-[#E5E2DD] rounded-full mx-auto mb-8" />
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="serif text-2xl font-bold text-[#3C2A21]">Edit Profile</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40">Personalize your journey</p>
                </div>
                <button onClick={() => setIsProfileOpen(false)} className="p-3 bg-white rounded-full text-[#3C2A21]/20 hover:text-red-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-2">
                    <ImageIcon size={12} /> Choose Your Vibe
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {DEFAULT_AVATARS.map(avatar => {
                      const isSelected = profile.avatar === avatar.id;
                      const Icon = avatar.icon;
                      return (
                        <button
                          key={avatar.id}
                          onClick={() => setProfile({...profile, avatar: avatar.id})}
                          className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${
                            isSelected ? 'bg-[#3C2A21] text-white shadow-lg scale-110' : 'bg-white text-[#3C2A21]/40 hover:bg-white/80'
                          }`}
                        >
                          <Icon size={20} />
                        </button>
                      );
                    })}
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all border-2 border-dashed ${
                        profile.avatar.startsWith('data:') ? 'border-[#3C2A21] bg-[#3C2A21] text-white' : 'border-[#E5E2DD] bg-white text-[#3C2A21]/40'
                      }`}
                    >
                      {profile.avatar.startsWith('data:') ? (
                         <img src={profile.avatar} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Upload size={16} />
                      )}
                    </button>
                  </div>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>

                <div className="bg-white rounded-[32px] p-6 shadow-sm space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-1">
                            <Scale size={12} /> Weight (kg)
                         </label>
                         <input 
                            type="number" 
                            value={profile.weight}
                            onChange={e => setProfile({...profile, weight: Number(e.target.value)})}
                            className="w-full bg-[#F5F2ED] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#D4A373] focus:outline-none"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-1">
                            <Ruler size={12} /> Height (cm)
                         </label>
                         <input 
                            type="number" 
                            value={profile.height}
                            onChange={e => setProfile({...profile, height: Number(e.target.value)})}
                            className="w-full bg-[#F5F2ED] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#D4A373] focus:outline-none"
                         />
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-1">
                         <MoonStar size={12} /> Sleep Difficulty (入睡难度)
                      </label>
                      <div className="flex bg-[#F5F2ED] p-1 rounded-[20px] gap-1">
                        {(['Easy', 'Normal', 'Hard'] as SleepDifficulty[]).map(level => (
                           <button
                             key={level}
                             onClick={() => setProfile({...profile, sleepDifficulty: level})}
                             className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${
                               profile.sleepDifficulty === level ? 'bg-[#3C2A21] text-white shadow-md' : 'text-[#3C2A21]/40'
                             }`}
                           >
                             {level}
                           </button>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2">咖位昵称 (Coffee Name)</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                    placeholder="Enter your coffee alias"
                    className="w-full bg-white rounded-[24px] p-5 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#D4A373] focus:outline-none"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40">每日咖啡因限额 (Daily Limit)</label>
                     <div className="flex items-center gap-2">
                        <span className="text-[#D4A373] font-black text-sm">{profile.dailyLimit} mg</span>
                     </div>
                  </div>

                  <div className="bg-white rounded-[32px] p-6 shadow-sm space-y-4">
                     <div className="flex items-center gap-4">
                        <div className="flex-1">
                           <input 
                              type="range" min="0" max="1000" step="10"
                              value={profile.dailyLimit}
                              onChange={e => setProfile({...profile, dailyLimit: parseInt(e.target.value)})}
                              className="w-full accent-[#3C2A21] h-1.5 bg-[#F5F2ED] rounded-lg appearance-none cursor-pointer"
                           />
                        </div>
                        <Zap size={20} className="text-[#D4A373]" />
                     </div>
                     
                     <div className="flex items-center justify-between p-4 bg-[#F5F2ED] rounded-2xl border border-dashed border-[#D4A373]/30">
                        <div className="flex items-center gap-3">
                           <Sparkles size={16} className="text-[#D4A373]" />
                           <div>
                              <p className="text-[10px] font-black text-[#3C2A21]/40 uppercase tracking-widest">AI Recommended</p>
                              <p className="text-sm font-black text-[#3C2A21]">{recommendedLimit} mg</p>
                           </div>
                        </div>
                        <button 
                           onClick={() => setProfile({...profile, dailyLimit: recommendedLimit})}
                           className="bg-[#D4A373] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 active:scale-95 transition-all"
                        >
                           Apply
                        </button>
                     </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2">偏好饮品 (Preferred Drink)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Americano', 'Latte', 'Flat White', 'Hand Drip', 'Dirty', 'Cold Brew', 'Mocha', 'Cappuccino', 'Oat Latte'].map(m => (
                      <button
                        key={m}
                        onClick={() => setProfile({...profile, preferredDrink: m})}
                        className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-tighter transition-all ${
                          profile.preferredDrink === m ? 'bg-[#3C2A21] text-white shadow-md' : 'bg-white text-[#3C2A21]/40'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-[#E5E2DD]">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-red-400 px-2 mb-4 flex items-center gap-2">
                    <AlertTriangle size={12} /> Data Management
                  </h4>
                  <button 
                    onClick={clearAllData}
                    className="w-full bg-white border border-red-100 text-red-400 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} /> Clear All Records
                  </button>
                </div>

                <div className="pt-4 pb-12">
                  <button 
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full bg-[#3C2A21] text-white py-6 rounded-[32px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <Check size={20} /> Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-[#E5E2DD] px-8 py-4 flex justify-between items-center z-50">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeTab === id ? 'text-[#D4A373] scale-110' : 'text-[#3C2A21]/40'
            }`}
          >
            <Icon size={activeTab === id ? 28 : 24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
