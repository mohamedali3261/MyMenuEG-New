import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { resolveAssetUrl } from '../../../utils/assetUrl';
import type { MarqueeLogo } from './types';

export default function LogoCard({ logo, idx, rtl, onEdit, onDelete }: { logo: MarqueeLogo; idx: number; rtl: boolean; onEdit: (l: MarqueeLogo) => void; onDelete: (id: string) => void }) {
  return (
    <div className="glass-card overflow-hidden group hover:border-primary-500/30 transition-all duration-300">
      <div className="aspect-video rounded-t-xl overflow-hidden relative bg-white/5 p-3 flex items-center justify-center">
        {logo.image_url ? (
          <img src={resolveAssetUrl(logo.image_url)} className="max-w-full max-h-full object-contain" alt="" />
        ) : (
          <ImageIcon size={32} className="text-slate-400" />
        )}
        <div className="absolute top-2 left-2 bg-primary-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">
          {idx + 1}
        </div>
      </div>
      <div className="p-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold truncate">{rtl ? logo.name_ar : logo.name_en}</h3>
          <span className="text-[10px] text-slate-500 uppercase font-bold">
            {logo.strip === '1' ? (rtl ? 'شريط 1' : 'Strip 1') : (rtl ? 'شريط 2' : 'Strip 2')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(logo)} className="p-2 rounded-lg hover:bg-primary-500/10 text-primary-500 transition-colors" title={rtl ? 'تعديل' : 'Edit'}>
            <ImageIcon size={16} />
          </button>
          <button onClick={() => onDelete(logo.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors" title={rtl ? 'حذف' : 'Delete'}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
