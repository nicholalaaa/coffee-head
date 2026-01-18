
import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoffeeBean, FreshnessState } from '../types';
import { COFFEE_ORIGIN_LIST } from '../constants';
import { 
  Plus,
  Trash2, 
  Archive, 
  CheckCircle2, 
  Sparkles,
  Package,
  Edit3,
  X,
  Check,
  Calendar,
  Globe,
  Banknote,
  Weight,
  History,
  Layers,
  Image as ImageIcon,
  UploadCloud,
  Scissors,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';

interface WarehouseProps {
  beans: CoffeeBean[];
  onAddBean: (bean: CoffeeBean) => void;
  onUpdateBean: (id: string, updates: Partial<CoffeeBean>) => void;
  onDeleteBean: (id: string) => void;
}

const Warehouse: React.FC<WarehouseProps> = ({ beans, onAddBean, onUpdateBean, onDeleteBean }) => {
  const [editingBean, setEditingBean] = useState<CoffeeBean | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [rippingId, setRippingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFreshnessState = (roastDate: string) => {
    const elapsedDays = Math.floor((Date.now() - new Date(roastDate).getTime()) / (1000 * 60 * 60 * 24));
    if (elapsedDays <= 7) return FreshnessState.AGING;
    if (elapsedDays <= 25) return FreshnessState.PEAK;
    return FreshnessState.STALE;
  };

  const handleAddNew = () => {
    const newBeanTemplate: CoffeeBean = {
      id: '', // Will be generated on save
      name: '',
      origin: 'Ethiopia',
      roastDate: new Date().toISOString(),
      totalWeight: 250,
      currentWeight: 250,
      price: 0,
      flavorProfile: [],
      isArchived: false,
      hasBeenOpened: false
    };
    setEditingBean(newBeanTemplate);
    setIsAdding(true);
  };

  const handleSave = () => {
    if (editingBean) {
      if (isAdding) {
        const newBean = {
          ...editingBean,
          id: Math.random().toString(36).substr(2, 9)
        };
        onAddBean(newBean);
      } else {
        onUpdateBean(editingBean.id, editingBean);
      }
      setEditingBean(null);
      setIsAdding(false);
    }
  };

  const handleRipOpen = (id: string) => {
    setRippingId(id);
    setTimeout(() => {
      onUpdateBean(id, { 
        hasBeenOpened: true, 
        dateOpened: new Date().toISOString() 
      });
      setRippingId(null);
    }, 800);
  };

  const confirmDelete = () => {
    if (deletingId) {
      onDeleteBean(deletingId);
      setDeletingId(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingBean) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingBean({ ...editingBean, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const activeBeans = beans.filter(b => !b.isArchived);
  
  const groupedArchivedBeans = useMemo(() => {
    const archived = beans.filter(b => b.isArchived);
    const groups: Record<string, { bean: CoffeeBean; count: number }> = {};
    
    archived.forEach(bean => {
      const nameKey = bean.name.trim().toLowerCase();
      if (groups[nameKey]) {
        groups[nameKey].count += 1;
        if (!groups[nameKey].bean.imageUrl && bean.imageUrl) {
          groups[nameKey].bean = bean;
        }
      } else {
        groups[nameKey] = { bean, count: 1 };
      }
    });
    
    return Object.values(groups);
  }, [beans]);

  const getAestheticImage = (index: number) => {
    const images = [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=500&fit=crop&q=80",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=500&fit=crop&q=80",
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&h=500&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=400&h=500&fit=crop&q=80",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=500&fit=crop&q=80",
    ];
    return images[index % images.length];
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500 pb-12">
      <div className="flex justify-between items-center px-2">
        <h2 className="serif text-2xl font-bold text-[#3C2A21]">Warehouse</h2>
        <button 
          onClick={handleAddNew}
          className="bg-[#3C2A21] text-white px-6 py-3 rounded-[24px] flex items-center gap-2 font-bold text-sm shadow-xl active:scale-95 transition-all"
        >
          <Plus size={18} /> Add Bean
        </button>
      </div>

      <AnimatePresence>
        {deletingId && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-xs rounded-[32px] p-8 text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="serif text-xl font-bold text-[#3C2A21] mb-2">Delete Bean?</h3>
              <p className="text-xs text-[#3C2A21]/60 mb-8 leading-relaxed">
                This will permanently remove the record from your warehouse. Previous logs will remain.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmDelete}
                  className="bg-red-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-red-600 active:scale-95 transition-all"
                >
                  Confirm Delete
                </button>
                <button 
                  onClick={() => setDeletingId(null)}
                  className="text-[#3C2A21]/40 font-bold uppercase text-[10px] py-2 tracking-widest"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {editingBean && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6"
          >
            <motion.div 
              initial={{ y: 100 }} animate={{ y: 0 }}
              className="bg-[#F5F2ED] w-full max-w-md rounded-t-[48px] sm:rounded-[48px] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#3C2A21]">
                    {isAdding ? <ClipboardList size={20} /> : <Edit3 size={20} />}
                  </div>
                  <h3 className="serif text-2xl font-bold">{isAdding ? 'New Bean Arrival' : 'Edit Bean Info'}</h3>
                </div>
                <button 
                  onClick={() => { setEditingBean(null); setIsAdding(false); }} 
                  className="p-3 bg-white rounded-full text-[#3C2A21]/20 hover:text-[#3C2A21]/40"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 pb-20">
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-2">
                     <ImageIcon size={12} /> Bag Visual
                   </label>
                   <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="w-full aspect-video bg-white rounded-[32px] border-2 border-dashed border-[#E5E2DD] overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#D4A373] transition-all relative group"
                   >
                     {editingBean.imageUrl ? (
                       <img src={editingBean.imageUrl} alt="Bean bag" className="w-full h-full object-cover" />
                     ) : (
                       <div className="text-center space-y-1">
                         <UploadCloud size={32} className="mx-auto text-[#E5E2DD] group-hover:text-[#D4A373]" />
                         <span className="block text-[8px] font-bold text-[#3C2A21]/30">Upload Bag Photo</span>
                       </div>
                     )}
                   </div>
                   <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2">Bean Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ethiopia Yirgacheffe"
                      value={editingBean.name} 
                      onChange={e => setEditingBean({...editingBean, name: e.target.value})} 
                      className="w-full bg-white rounded-[24px] p-5 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#D4A373] focus:outline-none" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-1"><Globe size={12} /> Origin</label>
                      <select value={editingBean.origin} onChange={e => setEditingBean({...editingBean, origin: e.target.value})} className="w-full bg-white rounded-[20px] p-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#D4A373] focus:outline-none appearance-none">
                        {COFFEE_ORIGIN_LIST.map(country => <option key={country} value={country}>{country}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-1"><Calendar size={12} /> Roast Date</label>
                      <input type="date" value={editingBean.roastDate.split('T')[0]} onChange={e => setEditingBean({...editingBean, roastDate: new Date(e.target.value).toISOString()})} className="w-full bg-white rounded-[20px] p-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#D4A373] focus:outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-1"><Banknote size={12} /> Price (¥)</label>
                      <input type="number" value={editingBean.price} onChange={e => setEditingBean({...editingBean, price: Number(e.target.value)})} className="w-full bg-white rounded-[20px] p-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#D4A373] focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex items-center gap-1"><Weight size={12} /> Total Weight (g)</label>
                      <input type="number" value={editingBean.totalWeight} onChange={e => setEditingBean({...editingBean, totalWeight: Number(e.target.value)})} className="w-full bg-white rounded-[20px] p-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#D4A373] focus:outline-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/40 px-2 flex justify-between">
                      <span>Inventory Remaining</span>
                      <span className="font-black text-[#D4A373]">{editingBean.currentWeight}g</span>
                    </label>
                    <input type="range" min="0" max={editingBean.totalWeight} step="1" value={editingBean.currentWeight} onChange={e => setEditingBean({...editingBean, currentWeight: Number(e.target.value)})} className="w-full accent-[#3C2A21] h-2 bg-white rounded-lg appearance-none cursor-pointer" />
                  </div>

                  {!isAdding && (
                    <div className="flex gap-4 p-4 bg-[#FDFBF7] rounded-[24px] border border-[#E5E2DD]">
                      <div className="flex-1">
                        <span className="block text-[8px] font-black uppercase tracking-widest text-[#3C2A21]/30 mb-1">Status Control</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingBean({...editingBean, isArchived: !editingBean.isArchived})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${editingBean.isArchived ? 'bg-amber-100 text-amber-700 shadow-sm' : 'bg-white text-[#3C2A21]/40 border border-[#E5E2DD]'}`}>
                            {editingBean.isArchived ? 'Archived' : 'Active'}
                          </button>
                          <button onClick={() => setEditingBean({...editingBean, hasBeenOpened: !editingBean.hasBeenOpened})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${editingBean.hasBeenOpened ? 'bg-green-100 text-green-700 shadow-sm' : 'bg-white text-[#3C2A21]/40 border border-[#E5E2DD]'}`}>
                            {editingBean.hasBeenOpened ? 'Opened' : 'Sealed'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 sticky bottom-0 bg-[#F5F2ED] pb-4">
                <button 
                  disabled={!editingBean.name}
                  onClick={handleSave} 
                  className="w-full bg-[#3C2A21] text-white py-6 rounded-[32px] font-black uppercase tracking-widest shadow-2xl active:scale-95 disabled:opacity-30 transition-all flex items-center justify-center gap-3"
                >
                  <Check size={20} /> {isAdding ? 'Register Bean' : 'Update Bean Info'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6 px-2">
        {activeBeans.length === 0 && (
          <div className="bg-white/50 border-2 border-dashed border-[#E5E2DD] p-12 rounded-[40px] text-center">
            <p className="text-[#3C2A21]/30 font-bold uppercase text-xs tracking-widest">No active beans on shelf</p>
          </div>
        )}
        {activeBeans.map(bean => {
          const state = getFreshnessState(bean.roastDate);
          const isLow = bean.currentWeight < 18;
          const isRipping = rippingId === bean.id;

          return (
            <motion.div 
              key={bean.id} layout
              className={`bg-white rounded-[40px] p-8 shadow-xl border border-[#E5E2DD] relative overflow-hidden group transition-all ${
                isLow ? 'ring-2 ring-red-500 ring-offset-4 ring-offset-[#F5F2ED]' : ''
              }`}
            >
              <AnimatePresence>
                {isRipping && (
                  <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#3C2A21] z-[40] origin-top flex items-center justify-center">
                    <motion.div initial={{ rotate: -10 }} animate={{ rotate: 10 }} transition={{ repeat: Infinity, repeatType: 'reverse' }}>
                      <Scissors size={48} className="text-[#D4A373]" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A373]">{bean.origin}</span>
                    {isLow && <span className="text-[10px] font-black uppercase tracking-widest text-red-500 animate-breathe flex items-center gap-1"><AlertTriangle size={10} /> Last Cup!</span>}
                  </div>
                  <h3 className="serif text-2xl font-bold text-[#3C2A21]">{bean.name}</h3>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => { setIsAdding(false); setEditingBean({...bean}); }} className="p-3 bg-[#F5F2ED] text-[#3C2A21]/40 rounded-full hover:bg-[#3C2A21] hover:text-white transition-all shadow-sm">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => setDeletingId(bean.id)} className="p-3 bg-[#F5F2ED] text-[#3C2A21]/40 rounded-full hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {!bean.hasBeenOpened ? (
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRipOpen(bean.id)}
                  className="w-full aspect-video bg-[#FDFBF7] border-2 border-dashed border-[#D4A373] rounded-[32px] mb-6 flex flex-col items-center justify-center gap-3 group/rip hover:bg-[#D4A373]/5 transition-colors"
                >
                  <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center group-hover/rip:rotate-12 transition-transform">
                    <Scissors size={24} className="text-[#D4A373]" />
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-[#D4A373]">Degassing... Be patient</span>
                    <span className="text-xs font-bold text-[#3C2A21]">Rip open to start peak flavor</span>
                  </div>
                </motion.button>
              ) : (
                <div className="w-full aspect-video mb-6 rounded-[32px] overflow-hidden border border-[#E5E2DD] bg-[#F5F2ED]">
                  {bean.imageUrl ? (
                    <img src={bean.imageUrl} alt={bean.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#3C2A21]/10">
                      <ImageIcon size={48} />
                      <span className="text-[10px] font-black uppercase tracking-widest mt-2">Peak Flavor Session</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 mb-8 bg-[#F5F2ED]/30 p-4 rounded-[28px]">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className={state === FreshnessState.AGING ? 'text-[#B7C4CF]' : 'text-[#3C2A21]/20'}>Aging</span>
                  <span className={state === FreshnessState.PEAK ? 'text-[#D4A373]' : 'text-[#3C2A21]/20'}>Peak</span>
                  <span className={state === FreshnessState.STALE ? 'text-[#8C8C8C]' : 'text-[#3C2A21]/20'}>Stale</span>
                </div>
                <div className="h-2 w-full bg-[#F5F2ED] rounded-full overflow-hidden flex">
                  <div className={`h-full flex-1 border-r border-white ${state === FreshnessState.AGING ? 'bg-[#B7C4CF]' : 'bg-[#3C2A21]/10'}`} />
                  <div className={`h-full flex-[2] border-r border-white ${state === FreshnessState.PEAK ? 'bg-[#D4A373]' : 'bg-[#3C2A21]/10'}`} />
                  <div className={`h-full flex-1 ${state === FreshnessState.STALE ? 'bg-[#8C8C8C]' : 'bg-[#3C2A21]/10'}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#E5E2DD]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F5F2ED] flex items-center justify-center text-[#3C2A21]"><Sparkles size={18} /></div>
                  <div>
                    <span className="block text-[8px] font-black uppercase tracking-widest text-[#3C2A21]/40">Inventory</span>
                    <span className="font-bold text-sm text-[#3C2A21]">{bean.currentWeight}g <span className="text-[#3C2A21]/30">/ {bean.totalWeight}g</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <button onClick={() => onUpdateBean(bean.id, { isArchived: true })} className="w-10 h-10 rounded-2xl bg-[#3C2A21]/5 hover:bg-amber-50 hover:text-amber-600 flex items-center justify-center transition-colors"><Archive size={18} /></button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {groupedArchivedBeans.length > 0 && (
        <section className="pt-8 px-4">
          <div className="flex justify-between items-baseline mb-6">
            <h3 className="serif text-xl font-bold text-[#3C2A21]/40 flex items-center gap-2"><Archive size={18} /> Hall of Fame</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#3C2A21]/20">{groupedArchivedBeans.length} Varieties</span>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {groupedArchivedBeans.map(({ bean, count }, index) => (
              <motion.div 
                key={bean.id} initial={{ opacity: 0, rotate: index % 2 === 0 ? -2 : 2 }} animate={{ opacity: 1, rotate: index % 2 === 0 ? -1 : 1 }} whileHover={{ rotate: 0, scale: 1.05 }}
                className="bg-white p-3 pb-8 rounded-lg shadow-xl border border-[#E5E2DD] relative group flex flex-col items-center"
              >
                <div className="absolute -top-3 right-0 left-0 flex justify-center gap-2 z-20">
                  <button onClick={(e) => { e.stopPropagation(); setIsAdding(false); setEditingBean({...bean}); }} className="w-8 h-8 bg-[#3C2A21] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all border-2 border-white"><Edit3 size={14} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setDeletingId(bean.id); }} className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all border-2 border-white"><Trash2 size={14} /></button>
                </div>

                <div className="w-full aspect-square rounded-sm overflow-hidden mb-4 relative bg-[#F5F2ED]">
                  <img src={bean.imageUrl || getAestheticImage(index)} alt={bean.name} className={`w-full h-full object-cover grayscale opacity-80 transition-all duration-500`} />
                  {count > 1 && (
                    <div className="absolute top-2 right-2 bg-[#3C2A21] text-white px-2 py-1 rounded-full text-[10px] font-black shadow-lg flex items-center gap-1 z-10 border border-white/20">
                      <Layers size={10} />
                      x{count}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#3C2A21]/5" />
                </div>
                <div className="text-center space-y-1 w-full px-2">
                  <h4 className="serif text-sm font-bold text-[#3C2A21] truncate uppercase tracking-tight">{bean.name}</h4>
                  <p className="text-[8px] text-[#3C2A21]/40 font-black uppercase tracking-widest truncate">{bean.origin}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Warehouse;
