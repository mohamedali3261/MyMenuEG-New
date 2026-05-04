import { Save, Loader2 } from 'lucide-react';

interface SaveButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isSaving?: boolean;
  hasChanges?: boolean;
  rtl?: boolean;
  color?: 'primary' | 'rose' | 'red' | 'glass';
  checkHasChanges?: boolean;
  glass?: boolean;
}

export default function SaveButton({ 
  onClick, 
  disabled = false, 
  isSaving = false, 
  hasChanges = true,
  rtl = false,
  color = 'primary',
  checkHasChanges = true,
  glass = true
}: SaveButtonProps) {
  const colorClasses = {
    primary: 'bg-primary-500/90 backdrop-blur-md text-white shadow-lg shadow-primary-500/20 hover:bg-primary-500',
    rose: 'bg-rose-500/90 backdrop-blur-md text-white shadow-lg shadow-rose-500/20 hover:bg-rose-500',
    red: 'bg-red-500/90 backdrop-blur-md text-white hover:bg-red-500',
    glass: 'bg-white/20 dark:bg-white/10 backdrop-blur-md text-slate-900 dark:text-white border border-white/30 shadow-lg hover:bg-white/30 dark:hover:bg-white/20'
  };

  const shouldDisable = disabled || isSaving || (checkHasChanges && !hasChanges);

  return (
    <button
      onClick={onClick}
      disabled={shouldDisable}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all duration-300 ${
        checkHasChanges && !hasChanges
          ? 'bg-slate-100/50 dark:bg-white/5 text-slate-400 cursor-not-allowed opacity-50 backdrop-blur-sm'
          : glass ? colorClasses[color] : colorClasses[color].replace('/90', '').replace('backdrop-blur-md', '')
      } ${color !== 'red' ? 'hover:scale-105 active:scale-95' : ''} disabled:opacity-50`}
    >
      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
      {rtl ? 'حفظ التغييرات' : 'Save Changes'}
    </button>
  );
}
