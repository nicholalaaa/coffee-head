
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoffeeLog, CoffeeMode, Brand, CoffeeBean, UserProfile } from '../types';
import { BRANDS, COFFEE_QUOTES, HOME_PRESETS } from '../constants';
import { 
  Plus, 
  Clock, 
  MessageSquareQuote, 
  Coffee as CoffeeIcon,
  ShoppingBag,
  X,
  Keyboard,
  Settings2,
  IceCream,
  Milk,
  Minimize2,
  Maximize2,
  Check,
  Zap,
  Flame,
  Droplets,
  Layers,
  Banknote,
  Trash2,
  History as HistoryIcon,
  Moon,
  Edit2,
  Quote,
  PackageCheck,
  AlertCircle,
  AlertTriangle,
  Beaker,
  ThermometerSnowflake,
  Wind
} from 'lucide-react';
import { AreaChart, Area, XAxis, ReferenceLine, ResponsiveContainer } from 'recharts';

interface TrackerProps {
  logs: CoffeeLog[];
  beans: CoffeeBean[];
  profile: UserProfile;
  onAddLog: (log: CoffeeLog) => void;
  onDeleteLog?: (id: string) => void; 
  onUpdateLog?: (id: string, updates: Partial<CoffeeLog>) => void;
}

const IconMap: Record<string, any> = {
  Zap: Zap,
  Flame: Flame,
  Droplets: Droplets,
  Layers: Layers,
  Milk: Milk,
  Wind: Wind,
  ThermometerSnowflake: ThermometerSnowflake,
  Coffee: CoffeeIcon
};

export const BrandLogo: React.FC<{ brand: Brand | undefined; size?: string; className?: string }> = ({ brand, size = 'w-14 h-14', className = '' }) => {
  const [error, setError] = useState(false);
  if (!brand) return <div className={`${size} rounded-full bg-[#3C2A21] text-white flex items-center justify-center font-bold ${className}`}>H</div>;
  return (
    <div className={`${size} rounded-full overflow-hidden border-2 border-[#F5F2ED] bg-white flex items-center justify-center ${className}`}>
      {!error ? (
        <img 
          src={brand.logo} 
          alt={brand.name} 
          className="w-full h-full object-contain p-1" 
          onError={() => setError(true)} 
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center font-black text-lg" style={{ backgroundColor: brand.color, color: '#FFFFFF' }}>
          {brand.name.charAt(0)}
        </div>
      )}
    </div>
  );
};

const Tracker: React.FC<TrackerProps> = ({ logs, beans, profile, onAddLog, onDeleteLog, onUpdateLog }) => {
  const [mode, setMode] = useState<CoffeeMode>(CoffeeMode.BRAND);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [timeOffset, setTimeOffset] = useState(0);
  const [thoughts, setThoughts] = useState('');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  const SLEEP_THRESHOLD = 50;

  const halfLifeMinutes = useMemo(() => {
    const weightFactor = 70 / profile.weight; 
    const sleepFactors = { Easy: 0.8, Normal: 1.0, Hard: 1.4 };
    const sleepFactor = sleepFactors[profile.sleepDifficulty] || 1.0;
    return 300 * weightFactor * sleepFactor;
  }, [profile.weight, profile.sleepDifficulty]);

  const [activeForm, setActiveForm] = useState<{
    name: string;
    baseCaffeine: number;
    basePrice: number;
    extraCost?: number;
    mode: CoffeeMode;
    brandId?: string;
    beanId?: string;
  } | null>(null);

  const [formDetails, setFormDetails] = useState<CoffeeLog['details']>({
    size: 'Medium',
    milk: 'Whole',
    ice: 'Normal Ice',
    beanWeight: 18
  });

  const [editablePrice, setEditablePrice] = useState<number>(0);
  const [editableCaffeine, setEditableCaffeine] = useState<number>(0);

  const todayLogs = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return logs.filter(log => log.timestamp >= today);
  }, [logs]);

  const todayTotalIntake = useMemo(() => {
    return todayLogs.reduce((acc, log) => acc + log.caffeine, 0);
  }, [todayLogs]);

  const limitStatus = useMemo(() => {
    const ratio = todayTotalIntake / profile.dailyLimit;
    if (ratio >= 1) return 'over';
    if (ratio >= 0.8) return 'approaching';
    return 'safe';
  }, [todayTotalIntake, profile.dailyLimit]);

  const openedBeans = useMemo(() => {
    return beans.filter(b => b.hasBeenOpened && !b.isArchived);
  }, [beans]);

  // Handle price/caffeine calculation overrides
  useEffect(() => {
    if (activeForm && !editingLogId) {
      if (activeForm.mode === CoffeeMode.BRAND) {
        let calcCaffeine = activeForm.baseCaffeine;
        let calcPrice = activeForm.basePrice;
        if (formDetails?.size === 'Small') {
          calcCaffeine = Math.round(calcCaffeine * 0.8);
          calcPrice = Math.max(0, calcPrice - 3);
        } else if (formDetails?.size === 'Large') {
          calcCaffeine = Math.round(calcCaffeine * 1.3);
          calcPrice += 5;
        }
        setEditableCaffeine(calcCaffeine);
        setEditablePrice(calcPrice);
      } else if (activeForm.mode === CoffeeMode.HOME) {
        const selectedBeanId = activeForm.beanId;
        const bean = beans.find(b => b.id === selectedBeanId);
        const dose = formDetails?.beanWeight || 18;
        const extraCost = activeForm.extraCost || 0;
        
        if (bean) {
          const calculatedPrice = (bean.price / bean.totalWeight) * dose + extraCost;
          setEditablePrice(Number(calculatedPrice.toFixed(1)));
        } else {
          setEditablePrice(activeForm.basePrice + extraCost);
        }
        setEditableCaffeine(activeForm.baseCaffeine);
      }
    }
  }, [activeForm, formDetails?.size, formDetails?.beanWeight, activeForm?.beanId, beans, editingLogId]);

  const calculateCaffeine = (currentTimestamp: number) => {
    return logs.reduce((acc, log) => {
      const elapsedMinutes = (currentTimestamp - log.timestamp) / 60000;
      if (elapsedMinutes < 0) return acc;
      const remaining = log.caffeine * Math.pow(0.5, elapsedMinutes / halfLifeMinutes);
      return acc + remaining;
    }, 0);
  };

  const currentCaffeine = calculateCaffeine(Date.now());
  const estSleepTime = useMemo(() => {
    if (currentCaffeine < SLEEP_THRESHOLD) return "Ready to Sleep";
    const minutesToThreshold = halfLifeMinutes * Math.log2(currentCaffeine / SLEEP_THRESHOLD);
    const date = new Date(Date.now() + minutesToThreshold * 60000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [currentCaffeine, halfLifeMinutes]);

  const chartData = useMemo(() => {
    const data = [];
    const now = Date.now();
    for (let i = 0; i <= 24; i++) {
      const timestamp = now + i * 60 * 60 * 1000;
      const hours = new Date(timestamp).getHours();
      data.push({
        time: `${hours}:00`,
        value: Math.round(calculateCaffeine(timestamp)),
        showLabel: i % 4 === 0 || i === 0 || i === 24
      });
    }
    return data;
  }, [logs, halfLifeMinutes]);

  const handleSaveLog = () => {
    if (!activeForm || !activeForm.name) return;
    
    const logData = {
      timestamp: Date.now() - (timeOffset * 60000),
      name: activeForm.name,
      caffeine: editableCaffeine,
      price: editablePrice,
      mode: activeForm.mode,
      brandId: activeForm.brandId,
      beanId: activeForm.beanId,
      thoughts,
      details: { ...formDetails }
    };

    if (editingLogId && onUpdateLog) {
      onUpdateLog(editingLogId, logData);
    } else {
      const newLog: CoffeeLog = {
        id: Math.random().toString(36).substr(2, 9),
        ...logData
      };
      onAddLog(newLog);
    }
    
    resetForm();
  };

  const handleEditClick = (log: CoffeeLog) => {
    const diffMins = Math.max(0, Math.floor((Date.now() - log.timestamp) / 60000));
    setEditingLogId(log.id);
    setActiveForm({
      name: log.name,
      baseCaffeine: log.caffeine, 
      basePrice: log.price,
      mode: log.mode,
      brandId: log.brandId,
      beanId: log.beanId
    });
    setFormDetails(log.details || { size: 'Medium', milk: 'Whole', ice: 'Normal Ice', beanWeight: 18 });
    setThoughts(log.thoughts || '');
    setEditableCaffeine(log.caffeine);
    setEditablePrice(log.price);
    setTimeOffset(diffMins);
  };

  const resetForm = () => {
    setActiveForm(null);
    setEditingLogId(null);
    setThoughts('');
    setTimeOffset(0);
    setSelectedBrand(null);
    setFormDetails({
      size: 'Medium',
      milk: 'Whole',
      ice: 'Normal Ice',
      beanWeight: 18
    });
  };

  const predictedIntakeAfterSave = useMemo(() => {
    if (!activeForm) return 0;
    const currentBase = todayTotalIntake;
    const editingCaffeine = editingLogId ? (logs.find(l => l.id === editingLogId)?.caffeine || 0) : 0;
    return currentBase - editingCaffeine + editableCaffeine;
  }, [activeForm, todayTotalIntake, editingLogId, editableCaffeine, logs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* 1. Metabolism Curve Section */}
      <section className={`bg-white rounded-[40px] p-6 shadow-xl border relative overflow-hidden transition-all duration-500 ${limitStatus === 'over' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#E5E2DD]'}`}>
        <div className="flex justify-between items-start relative z-10 mb-2">
          <div className={`${limitStatus === 'over' ? 'animate-bounce' : ''}`}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-[10px] font-black text-[#3C2A21]/40 uppercase tracking-widest">Active Caffeine</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-black tracking-tighter transition-colors duration-500 ${
                limitStatus === 'over' ? 'text-red-500' : limitStatus === 'approaching' ? 'text-orange-500' : currentCaffeine < SLEEP_THRESHOLD ? 'text-[#D4A373]' : 'text-[#3C2A21]'
              }`}>
                {Math.round(currentCaffeine)}
              </span>
              <span className={`text-sm font-bold uppercase ${limitStatus === 'over' ? 'text-red-400' : 'text-[#D4A373]'}`}>mg</span>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-[10px] font-black text-[#3C2A21]/40 uppercase tracking-widest flex items-center justify-end gap-1">
              {currentCaffeine < SLEEP_THRESHOLD && <Moon size={10} className="text-[#D4A373]" />}
              Est. Sleep
            </h3>
            <div className={`text-xl font-black transition-colors duration-500 ${
              currentCaffeine < SLEEP_THRESHOLD ? 'text-[#D4A373]' : 'text-[#3C2A21]'
            }`}>
              {estSleepTime}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 py-1 bg-[#F5F2ED] rounded-2xl mb-4">
           <div className="flex items-center gap-2 pl-2">
              <div className={`w-1.5 h-1.5 rounded-full ${limitStatus === 'over' ? 'bg-red-500' : limitStatus === 'approaching' ? 'bg-orange-500' : 'bg-[#D4A373]'}`} />
              <span className="text-[9px] font-black uppercase text-[#3C2A21]/40 tracking-wider">Today's Intake</span>
           </div>
           <div className="pr-2">
              <span className={`text-[10px] font-black ${limitStatus === 'over' ? 'text-red-500' : 'text-[#3C2A21]'}`}>
                {todayTotalIntake} <span className="opacity-30">/ {profile.dailyLimit} mg</span>
              </span>
           </div>
        </div>
        
        <div className="h-32 w-full -mx-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorCaffeine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={limitStatus === 'over' ? "#ef4444" : "#D4A373"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={limitStatus === 'over' ? "#ef4444" : "#D4A373"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={(props) => {
                const { x, y, payload, index } = props;
                if (!chartData[index].showLabel) return null;
                return <text x={x} y={y + 12} fill="#3C2A21" fillOpacity={0.3} fontSize={8} fontWeight="bold" textAnchor="middle">{payload.value}</text>;
              }} interval={0} />
              <ReferenceLine y={SLEEP_THRESHOLD} stroke="#D4A373" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={limitStatus === 'over' ? "#ef4444" : currentCaffeine < SLEEP_THRESHOLD ? "#D4A373" : "#3C2A21"} 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorCaffeine)" 
                animationDuration={1500} 
                strokeOpacity={0.8} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 2. Journaling Quick Entry */}
      <div className="px-2">
        <div className="relative group">
          <textarea 
            placeholder="Journal this Sip..." 
            value={thoughts} 
            onChange={(e) => setThoughts(e.target.value)} 
            className="w-full h-20 p-5 bg-white rounded-[28px] border border-[#E5E2DD] shadow-sm focus:outline-none focus:ring-4 focus:ring-[#D4A373]/10 transition-all resize-none text-[12px] leading-relaxed" 
          />
          <div className="absolute top-4 right-6 text-[#3C2A21]/10 group-focus-within:text-[#D4A373]/30 transition-colors pointer-events-none">
            <MessageSquareQuote size={20} />
          </div>
        </div>
      </div>

      {/* 3. Mode Select */}
      <div className="flex bg-[#E5E2DD]/40 p-1.5 rounded-[32px] gap-2 mx-2">
        <button onClick={() => setMode(CoffeeMode.BRAND)} className={`flex-1 py-4 rounded-[26px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${mode === CoffeeMode.BRAND ? 'bg-white shadow-lg text-[#3C2A21]' : 'text-[#3C2A21]/40'}`}><ShoppingBag size={14} /> Brand/Cafe</button>
        <button onClick={() => setMode(CoffeeMode.HOME)} className={`flex-1 py-4 rounded-[26px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${mode === CoffeeMode.HOME ? 'bg-white shadow-lg text-[#3C2A21]' : 'text-[#3C2A21]/40'}`}><CoffeeIcon size={14} /> Home-made</button>
      </div>

      {/* 4. Choice Grid */}
      <section className="space-y-4 px-2">
        {mode === CoffeeMode.BRAND ? (
          <div className="grid grid-cols-3 gap-4">
            {BRANDS.map(brand => (
              <button key={brand.id} onClick={() => setSelectedBrand(brand)} className={`flex flex-col items-center gap-3 p-4 rounded-[32px] transition-all border-2 ${selectedBrand?.id === brand.id ? 'bg-[#3C2A21] border-[#3C2A21] scale-105 shadow-2xl' : 'bg-white border-white shadow-sm'}`}><BrandLogo brand={brand} /><span className={`text-[10px] font-black uppercase tracking-widest text-center ${selectedBrand?.id === brand.id ? 'text-white' : 'text-[#3C2A21]'}`}>{brand.name}</span></button>
            ))}
            <button onClick={() => { setActiveForm({ name: '', baseCaffeine: 140, basePrice: 25, mode: CoffeeMode.BRAND }); setTimeOffset(0); }} className="flex flex-col items-center justify-center gap-3 p-4 rounded-[32px] bg-white border-2 border-dashed border-[#E5E2DD] transition-all hover:border-[#D4A373] text-[#3C2A21]/40"><div className="w-14 h-14 rounded-full border-2 border-dashed border-[#E5E2DD] flex items-center justify-center"><Plus size={24} /></div><span className="text-[10px] font-black uppercase">Other</span></button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {HOME_PRESETS.map(preset => {
              const IconComp = IconMap[preset.iconType] || CoffeeIcon;
              return (
                <button 
                  key={preset.name} 
                  onClick={() => { 
                    const firstAvailableBean = openedBeans[0];
                    setActiveForm({ 
                      name: preset.name, 
                      baseCaffeine: preset.caffeine, 
                      basePrice: 0, 
                      extraCost: preset.extraCost,
                      mode: CoffeeMode.HOME,
                      beanId: firstAvailableBean?.id
                    }); 
                    setFormDetails(prev => ({ ...prev, beanWeight: preset.defaultBean })); 
                    setTimeOffset(0); 
                  }} 
                  className="bg-white p-5 rounded-[32px] text-left shadow-sm border border-[#E5E2DD] hover:border-[#D4A373] transition-all group active:scale-95"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: preset.color || '#F5F2ED' }}>
                      <IconComp size={20} className="text-[#3C2A21]" />
                    </div>
                    <div className="px-2 py-0.5 bg-[#F5F2ED] rounded-full text-[8px] font-black uppercase text-[#D4A373]">{preset.caffeine}mg</div>
                  </div>
                  <span className="block font-black text-[#3C2A21] text-sm group-hover:text-[#D4A373]">{preset.name}</span>
                  <span className="text-[10px] text-[#3C2A21]/40 font-bold leading-tight">{preset.description}</span>
                </button>
              );
            })}
            <button 
              onClick={() => { setActiveForm({ name: '', baseCaffeine: 100, basePrice: 5, mode: CoffeeMode.HOME, beanId: openedBeans[0]?.id }); setTimeOffset(0); }} 
              className="bg-white p-5 rounded-[32px] border-2 border-dashed border-[#E5E2DD] hover:border-[#D4A373] transition-all flex flex-col justify-center items-center gap-2 group min-h-[140px]"
            >
              <Plus size={32} className="text-[#E5E2DD] group-hover:text-[#D4A373]" />
              <span className="text-[10px] font-black uppercase text-[#3C2A21]/40">Manual Brew</span>
            </button>
          </div>
        )}
      </section>

      {/* 5. Today's History */}
      <section className="pt-4 px-2">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="serif text-xl font-bold flex items-center gap-2"><HistoryIcon size={20} className="text-[#D4A373]" /> History</h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40">{todayLogs.length} sips</span>
        </div>
        
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {todayLogs.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/40 border-2 border-dashed border-[#E5E2DD] rounded-[32px] p-8 text-center"><p className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/20">No records found</p></motion.div>
            ) : (
              todayLogs.map(log => {
                const brand = BRANDS.find(b => b.id === log.brandId);
                const isCurrentlyEditing = editingLogId === log.id;
                
                return (
                  <motion.div
                    key={log.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`bg-white p-5 rounded-[28px] shadow-sm border transition-all duration-300 flex flex-col gap-3 group ${isCurrentlyEditing ? 'border-[#D4A373] bg-[#FDFBF7] ring-1 ring-[#D4A373]' : 'border-[#E5E2DD]'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <BrandLogo brand={brand} size="w-10 h-10" />
                        <div className="flex-1">
                          <span className="block text-xs font-black text-[#3C2A21]">{log.name}</span>
                          <div className="flex items-center gap-2">
                             <span className="text-[8px] font-bold text-[#D4A373] uppercase">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             <span className="text-[8px] font-black text-[#3C2A21]/20">·</span>
                             <span className="text-[8px] font-bold text-[#3C2A21]/40 uppercase tracking-widest">{log.caffeine}mg</span>
                             <span className="text-[8px] font-black text-[#3C2A21]/20">·</span>
                             <span className="text-[8px] font-bold text-[#3C2A21]/60 uppercase tracking-widest">¥{log.price.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(log)} className="p-2 text-[#3C2A21] hover:text-[#D4A373]"><Edit2 size={14} /></button>
                        {onDeleteLog && (
                          <button onClick={() => onDeleteLog(log.id)} className="p-2 text-[#3C2A21] hover:text-red-400"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Brand Selection Sheet */}
      <AnimatePresence>
        {selectedBrand && mode === CoffeeMode.BRAND && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedBrand(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
            />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[90] p-6 bg-white rounded-t-[48px] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] border-t border-[#E5E2DD] max-w-md mx-auto"
            >
              <div className="w-12 h-1.5 bg-[#F5F2ED] rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-center mb-8 px-4">
                <div className="flex items-center gap-4">
                  <BrandLogo brand={selectedBrand} size="w-12 h-12" />
                  <h4 className="serif text-2xl font-bold" style={{ color: selectedBrand.color }}>{selectedBrand.name} Menu</h4>
                </div>
                <button onClick={() => setSelectedBrand(null)} className="p-3 bg-[#F5F2ED] rounded-full text-[#3C2A21]/40 hover:text-red-400 transition-colors"><X size={20} /></button>
              </div>
              <div className="space-y-3 pb-40 max-h-[500px] overflow-y-auto px-2 no-scrollbar">
                {selectedBrand.bestSellers.map(item => (
                  <button key={item.name} onClick={() => { setActiveForm({ name: `${selectedBrand.name} ${item.name}`, baseCaffeine: item.baseCaffeine, basePrice: item.basePrice, mode: CoffeeMode.BRAND, brandId: selectedBrand.id }); setTimeOffset(0); }} className="w-full p-5 rounded-[28px] text-left flex justify-between items-center transition-all bg-[#F5F2ED] hover:bg-white hover:ring-2 hover:ring-[#3C2A21]/10 border border-transparent shadow-sm">
                    <div>
                      <span className="block font-black text-[#3C2A21]">{item.name}</span>
                      <span className="text-[10px] font-bold text-[#D4A373] uppercase tracking-widest">¥{item.basePrice} · {item.baseCaffeine}mg</span>
                    </div>
                    <Plus size={20} className="text-[#3C2A21]" />
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md">
            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} className="bg-[#F5F2ED] w-full max-w-md rounded-t-[48px] sm:rounded-[48px] p-8 shadow-2xl space-y-8 max-h-[95vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#D4A373]">
                    {editingLogId ? <Edit2 size={24} /> : <Plus size={24} />}
                  </div>
                  <div>
                    <h3 className="serif text-2xl font-bold">{editingLogId ? 'Modify Record' : 'Customize Sip'}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/30">Details determine the flavor</p>
                  </div>
                </div>
                <button onClick={resetForm} className="p-3 bg-white rounded-full text-[#3C2A21]/20 hover:text-red-400"><X size={20} /></button>
              </div>
              
              <div className="space-y-8 pb-32">
                 { predictedIntakeAfterSave > profile.dailyLimit && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 border border-red-100 p-5 rounded-[32px] flex items-center gap-4">
                       <AlertTriangle size={20} className="text-red-500 shrink-0" />
                       <div>
                          <p className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-0.5">Caffeine Ceiling Warning</p>
                          <p className="text-[11px] text-red-800/60 leading-tight font-bold">This sip will push you to {predictedIntakeAfterSave}mg, exceeding your daily limit.</p>
                       </div>
                    </motion.div>
                 )}

                 <div className="bg-white rounded-[32px] p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-1 flex items-center gap-2">
                          <Clock size={12} /> Log Timeline
                       </label>
                       <div className="px-3 py-1 bg-[#F5F2ED] rounded-full">
                          <span className="text-[10px] font-black text-[#D4A373]">
                            {timeOffset === 0 ? 'Just now' : `${Math.floor(timeOffset / 60)}h ${timeOffset % 60}m ago`}
                          </span>
                        </div>
                    </div>
                    <input 
                      type="range" min="0" max="720" step="15" 
                      value={timeOffset}
                      onChange={(e) => setTimeOffset(parseInt(e.target.value))}
                      className="w-full accent-[#3C2A21] h-1.5 bg-[#F5F2ED] rounded-lg appearance-none cursor-pointer"
                    />
                 </div>

                <div className="space-y-6">
                  <div className="space-y-2 px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-1">Drink Name</label>
                    <input autoFocus={activeForm.name === ''} type="text" placeholder="e.g. Seasonal Latte" value={activeForm.name} onChange={e => setActiveForm({...activeForm, name: e.target.value})} className="w-full bg-white rounded-[24px] p-5 text-sm font-bold shadow-sm border border-transparent focus:border-[#D4A373] focus:outline-none transition-all" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-1"><Banknote size={12} /> Cost (¥)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={editablePrice} 
                        onChange={e => setEditablePrice(Number(e.target.value))} 
                        className="w-full bg-white rounded-[20px] p-4 text-sm font-black text-[#D4A373] shadow-sm border border-transparent focus:border-[#D4A373] focus:outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-1"><Zap size={12} /> Caffeine (mg)</label>
                      <input type="number" value={editableCaffeine} onChange={e => setEditableCaffeine(Number(e.target.value))} className={`w-full bg-white rounded-[20px] p-4 text-sm font-black shadow-sm border border-transparent focus:border-[#D4A373] focus:outline-none ${predictedIntakeAfterSave > profile.dailyLimit ? 'text-red-500' : 'text-[#3C2A21]'}`} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 bg-white rounded-[32px] p-6 shadow-sm">
                  {activeForm.mode === CoffeeMode.BRAND ? (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 flex items-center gap-2"><Minimize2 size={12} /> Size Options</label>
                      <div className="flex bg-[#F5F2ED] p-1 rounded-[24px] gap-1">
                        {(['Small', 'Medium', 'Large'] as const).map(s => (
                          <button key={s} onClick={() => setFormDetails({...formDetails, size: s})} className={`flex-1 py-3 rounded-[20px] text-[10px] font-black uppercase transition-all ${formDetails?.size === s ? 'bg-[#3C2A21] text-white shadow-md' : 'text-[#3C2A21]/40'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 flex items-center justify-between">
                        <span className="flex items-center gap-1"><Beaker size={12} /> Dose (g)</span>
                        <span className="text-[#D4A373] font-black">{formDetails?.beanWeight}g</span>
                      </label>
                      <input 
                        type="range" min="5" max="40" step="0.5" 
                        value={formDetails?.beanWeight || 18}
                        onChange={(e) => setFormDetails({...formDetails, beanWeight: parseFloat(e.target.value)})}
                        className="w-full accent-[#3C2A21] h-1.5 bg-[#F5F2ED] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 flex items-center gap-2"><Milk size={12} /> Milk Selection</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Whole', 'Oat', 'Soy', 'Coconut', 'None'] as const).map(m => (
                        <button key={m} onClick={() => setFormDetails({...formDetails, milk: m})} className={`py-2 rounded-xl text-[9px] font-black uppercase transition-all ${formDetails?.milk === m ? 'bg-[#D4A373] text-white shadow-md' : 'bg-[#F5F2ED] text-[#3C2A21]/40'}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 flex items-center gap-2"><ThermometerSnowflake size={12} /> Temperature/Ice</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['No Ice', 'Less Ice', 'Normal Ice', 'Extra Ice'] as const).map(i => (
                        <button key={i} onClick={() => setFormDetails({...formDetails, ice: i})} className={`py-2 rounded-xl text-[9px] font-black uppercase transition-all ${formDetails?.ice === i ? 'bg-[#D4A373] text-white shadow-md' : 'bg-[#F5F2ED] text-[#3C2A21]/40'}`}>
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {activeForm.mode === CoffeeMode.HOME && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center justify-between">
                      <span className="flex items-center gap-1"><PackageCheck size={12} /> Origin Selection</span>
                    </label>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
                      {openedBeans.length > 0 ? (
                        openedBeans.map(bean => (
                          <button
                            key={bean.id}
                            onClick={() => setActiveForm({...activeForm, beanId: bean.id})}
                            className={`flex-shrink-0 px-5 py-3 rounded-full text-[10px] font-black transition-all border-2 ${
                              activeForm.beanId === bean.id 
                                ? 'bg-[#3C2A21] border-[#3C2A21] text-white shadow-lg' 
                                : 'bg-white border-white text-[#3C2A21] shadow-sm'
                            }`}
                          >
                            {bean.name}
                          </button>
                        ))
                      ) : (
                        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 w-full flex items-center gap-4">
                           <AlertCircle size={20} className="text-amber-500 shrink-0" />
                           <p className="text-[10px] font-bold text-amber-800/60 leading-tight uppercase">Open a bag in the Warehouse first.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3 px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-2">
                    <MessageSquareQuote size={12} /> Coffee Thoughts
                  </label>
                  <textarea 
                    placeholder="Capture the vibe..." 
                    value={thoughts} 
                    onChange={(e) => setThoughts(e.target.value)} 
                    className="w-full h-24 p-5 bg-white rounded-[32px] shadow-sm focus:ring-2 focus:ring-[#D4A373] focus:outline-none transition-all resize-none text-[12px] font-medium leading-relaxed" 
                  />
                </div>
              </div>

              <div className="pt-4 sticky bottom-0 bg-[#F5F2ED] pb-6">
                <button 
                  disabled={!activeForm.name} 
                  onClick={handleSaveLog} 
                  className={`w-full py-6 rounded-[32px] font-black uppercase tracking-widest shadow-2xl active:scale-95 disabled:opacity-30 transition-all flex items-center justify-center gap-3 ${
                    predictedIntakeAfterSave > profile.dailyLimit ? 'bg-red-500 text-white' : 'bg-[#3C2A21] text-white'
                  }`}
                >
                  <Check size={20} /> {editingLogId ? 'Update Record' : 'Log Footprint'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tracker;
