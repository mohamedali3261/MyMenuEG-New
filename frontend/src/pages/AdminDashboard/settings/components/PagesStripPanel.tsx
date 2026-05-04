import { useState, useEffect, useRef } from 'react';
import { useStore } from '../../../../store/store';
import { ImagePlus, Trash2, Loader2, LayoutGrid, Save, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../../api';
import { resolveAssetUrl } from '../../../../utils/assetUrl';
import toast from 'react-hot-toast';

interface StripPage {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  status: string;
  image_url?: string;
  order_index: number;
}

const COLORS = [
  'from-primary-500/20 to-primary-600/10',
  'from-accent-500/20 to-accent-600/10',
  'from-blue-500/20 to-blue-600/10',
  'from-emerald-500/20 to-emerald-600/10',
  'from-violet-500/20 to-violet-600/10',
  'from-rose-500/20 to-rose-600/10',
  'from-amber-500/20 to-amber-600/10',
  'from-cyan-500/20 to-cyan-600/10',
];

export default function PagesStripPanel() {
  const { rtl, fetchInitialData } = useStore();
  const [pages, setPages] = useState<StripPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchPages = () => {
    setLoading(true);
    api.get('/pages')
      .then(res => {
        const active = res.data.filter((p: StripPage) => p.status === 'active' && p.id !== 'home');
        setPages(active);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPages(); }, []);

  const handleUpload = async (pageId: string, file: File) => {
    setUploadingId(pageId);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('page', 'pages');
    try {
      const res = await api.post('/upload', fd);
      setPages(prev => prev.map(p => p.id === pageId ? { ...p, image_url: res.data.url } : p));
      toast.success(rtl ? 'تم رفع الصورة' : 'Image uploaded');
    } catch {
      toast.error(rtl ? 'فشل رفع الصورة' : 'Upload failed');
    } finally {
      setUploadingId(null);
    }
  };

  const handleRemoveImage = (pageId: string) => {
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, image_url: '' } : p));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        pages.map(p => api.post('/pages', {
          id: p.id,
          name_ar: p.name_ar,
          name_en: p.name_en,
          slug: p.slug,
          image_url: p.image_url || null
        }))
      );
      toast.success(rtl ? 'تم حفظ التغييرات' : 'Changes saved');
      fetchInitialData();
    } catch {
      toast.error(rtl ? 'فشل الحفظ' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(pages.map(p => ({ id: p.id, image_url: p.image_url }))) !== 
    JSON.stringify(pages.map(p => ({ id: p.id, image_url: p.image_url }))); // placeholder

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LayoutGrid size={24} className="text-primary-500" />
            {rtl ? 'صور الشريط اللانهائي' : 'Infinite Strip Images'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {rtl ? 'إدارة صور بطاقات الصفحات في الشريط المتحرك بالرئيسية' : 'Manage page card images in the homepage marquee strip'}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all duration-300 bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {rtl ? 'حفظ التغييرات' : 'Save Changes'}
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {rtl ? 'لا توجد صفحات نشطة' : 'No active pages'}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {pages.map((page, i) => {
            const name = rtl ? page.name_ar : page.name_en;
            const initials = name.substring(0, 2).toUpperCase();
            const colorClass = COLORS[i % COLORS.length];
            const isUploading = uploadingId === page.id;

            return (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group/card"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 transition-all duration-300 group-hover/card:shadow-lg group-hover/card:shadow-primary-500/10">
                  {page.image_url ? (
                    <>
                      <img
                        src={resolveAssetUrl(page.image_url)}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover/card:opacity-100">
                        <label className="bg-white text-slate-700 p-2 rounded-lg hover:scale-110 transition cursor-pointer">
                          <ImagePlus size={16} />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            ref={el => { fileRefs.current[page.id] = el; }}
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleUpload(page.id, file);
                            }}
                          />
                        </label>
                        <button
                          onClick={() => handleRemoveImage(page.id)}
                          className="bg-red-500 text-white p-2 rounded-lg hover:scale-110 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className={`w-full h-full bg-gradient-to-br ${colorClass} flex flex-col items-center justify-center cursor-pointer hover:brightness-110 transition-all`}>
                      {isUploading ? (
                        <Loader2 size={24} className="text-primary-500 animate-spin" />
                      ) : (
                        <>
                          <span className="text-3xl font-black text-primary-500/60 dark:text-primary-400/60 mb-2">
                            {initials}
                          </span>
                          <div className="flex items-center gap-1 text-primary-500/80">
                            <ImagePlus size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                              {rtl ? 'رفع صورة' : 'Upload'}
                            </span>
                          </div>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        ref={el => { fileRefs.current[page.id] = el; }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(page.id, file);
                        }}
                      />
                    </label>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate flex-1">
                    {name}
                  </p>
                  {page.image_url && (
                    <CheckCircle2 size={14} className="text-primary-500 shrink-0" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
