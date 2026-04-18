import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Activity, Ban } from 'lucide-react';

interface StatusDropdownProps {
  status: string;
  onChange: (newStatus: string) => void;
  rtl: boolean;
}

export default function StatusDropdown({ status, onChange, rtl }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const currentStatus = status?.toLowerCase() || 'active';

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  const options = [
    { 
      id: 'active', 
      labelAr: 'نشط', 
      labelEn: 'Active', 
      icon: <Activity size={14} />, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10' 
    },
    { 
      id: 'disabled', 
      labelAr: 'معطل', 
      labelEn: 'Disabled', 
      icon: <Ban size={14} />, 
      color: 'text-rose-500', 
      bg: 'bg-rose-500/10' 
    }
  ];

  const currentOption = options.find(o => o.id === currentStatus) || options[0];

  return (
    <div className="relative" ref={containerRef} dir={rtl ? 'rtl' : 'ltr'}>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center justify-between gap-2 px-3 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] border transition-all duration-300 w-[100px] shadow-sm ${
          currentStatus === 'active' 
            ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10 hover:shadow-emerald-500/10' 
            : 'bg-rose-500/5 text-rose-500 border-rose-500/20 hover:bg-rose-500/10 hover:shadow-rose-500/10'
        }`}
      >
        <div className="flex items-center gap-1.5">
           <div className={`w-1.5 h-1.5 rounded-full ${currentStatus === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
           {rtl ? currentOption.labelAr : currentOption.labelEn}
        </div>
        <ChevronDown 
          size={12} 
          className={`transition-transform duration-300 opacity-40 group-hover:opacity-100 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute left-0 right-0 z-[100] mt-1 p-1.5 bg-white/80 dark:bg-[#111]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
          >
            <div className="flex flex-col gap-1">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group/item ${
                    currentStatus === opt.id 
                      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' 
                      : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg transition-colors ${currentStatus === opt.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-100 dark:bg-white/10 group-hover/item:bg-white/20'}`}>
                      {opt.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{rtl ? opt.labelAr : opt.labelEn}</span>
                  </div>
                  {currentStatus === opt.id && <Check size={12} className="text-primary-500" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
