import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';

export interface DropdownOption {
  value: string;
  labelAr: string;
  labelEn: string;
  icon?: ReactNode;
  color?: string;
  bg?: string;
}

interface PremiumDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  rtl: boolean;
  className?: string;
  placeholderAr?: string;
  placeholderEn?: string;
}

export default function PremiumDropdown({ 
  value, 
  onChange, 
  options, 
  rtl, 
  className = "",
  placeholderAr = "اختر...",
  placeholderEn = "Select..."
}: PremiumDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('scroll', updateCoords);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

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

  const currentOption = options.find(o => o.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef} dir={rtl ? 'rtl' : 'ltr'}>
      {/* Trigger Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.05em] border transition-all duration-300 w-full shadow-sm bg-white/80 dark:bg-[#111]/60 backdrop-blur-md border-slate-200 dark:border-white/10 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/5 ${currentOption?.color || 'text-slate-600 dark:text-slate-300'}`}
      >
        <div className="flex items-center gap-2 max-w-[85%]">
           {currentOption?.icon && (
             <div className={`p-1 rounded-lg shrink-0 ${currentOption.bg || 'bg-slate-100 dark:bg-white/10'}`}>
                {currentOption.icon}
             </div>
           )}
           <span className="truncate">
             {currentOption ? (rtl ? currentOption.labelAr : currentOption.labelEn) : (rtl ? placeholderAr : placeholderEn)}
           </span>
        </div>
        <ChevronDown 
          size={12} 
          className={`transition-transform duration-300 opacity-30 group-hover:opacity-100 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </motion.button>

      {/* Dropdown Menu Portal */}
      {isOpen && createPortal(
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ 
               position: 'absolute', 
               top: coords.top, 
               left: coords.left, 
               width: coords.width,
               zIndex: 9999 
            }}
            className="p-1 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
            dir={rtl ? 'rtl' : 'ltr'}
          >
            <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto scrollbar-none">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group/item ${
                    value === opt.value 
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30' 
                      : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1 rounded-md transition-colors ${value === opt.value ? 'bg-white/20 text-white' : opt.bg || 'bg-slate-100 dark:bg-white/10 group-hover/item:bg-white/10'}`}>
                      {opt.icon}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">{rtl ? opt.labelAr : opt.labelEn}</span>
                  </div>
                  {value === opt.value && <Check size={12} className="text-white" />}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
