import { Plus, Trash2 } from 'lucide-react';
import { resolveAssetUrl } from '../../../../../utils/assetUrl';
import type { FormData } from '../types';

interface Props {
  rtl: boolean;
  images: string[];
  setImages: (images: string[]) => void;
  handleGalleryImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  formData: FormData;
  updateForm: (key: keyof FormData, val: any) => void;
}

export function MediaSection({ rtl, images, handleGalleryImageUpload, removeImage, formData, updateForm }: Props) {
  const handleGalleryImageReplace = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    // This is essentially same as upload but replacing the index
    // For simplicity, we'll keep the existing logic or just let the main hook handle it
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <div>
            <h2 className="text-xl font-black">{rtl ? 'معرض صور المنتج' : 'Visual Portfolio'}</h2>
            <p className="text-xs text-slate-500">{rtl ? 'ارفع صور عالية الجودة لجذب العملاء' : 'High-resolution images sell faster'}</p>
          </div>
          <label className="btn-primary py-3 px-6 text-xs flex items-center gap-2 cursor-pointer rounded-2xl">
            <Plus size={16} /> {rtl ? 'إضافة صورة' : 'Add New Asset'}
            <input
              type="file"
              className="hidden"
              accept=".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp"
              onChange={handleGalleryImageUpload}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {images.map((img, i) => (
            <div key={i} className="group aspect-square rounded-3xl overflow-hidden border border-white/10 bg-black/20 relative shadow-2xl">
              <img src={resolveAssetUrl(img)} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center hover:bg-red-600 transition-all transform hover:scale-110 shadow-xl"
                >
                  <Trash2 size={24} />
                </button>
              </div>
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-white">
                #{i + 1}
              </div>
            </div>
          ))}
          <label className="aspect-square rounded-3xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-4 hover:bg-white/10 hover:border-primary-500/50 transition-all cursor-pointer group">
            <div className="w-16 h-16 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={32} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-primary-500">{rtl ? 'رفع صور' : 'Upload More'}</span>
            <input
              type="file"
              className="hidden"
              accept=".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp"
              onChange={handleGalleryImageUpload}
            />
          </label>
        </div>
      </div>

      <div className="glass-card p-8">
        <h2 className="text-xl font-black mb-8 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
          {rtl ? 'فيديو المنتج والعروض' : 'Motion Showcase'}
        </h2>
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">{rtl ? 'رابط الفيديو (YouTube / Vimeo / CDN)' : 'External Video URL'}</label>
          <input 
            value={formData.video_url} 
            onChange={e => updateForm('video_url', e.target.value)} 
            type="text" 
            placeholder="https://..." 
            className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold text-primary-500" 
          />
          <p className="text-[10px] text-slate-500">{rtl ? 'سيتم عرض الفيديو في صفحة المنتج الرئيسية لزيادة التفاعل' : 'Videos significantly improve conversion rates & user trust'}</p>
        </div>
      </div>
    </div>
  );
}
