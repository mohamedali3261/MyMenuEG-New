import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { Plus, Save, Loader2, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { api } from '../../../api';
import { resolveAssetUrl } from '../../../utils/assetUrl';
import PremiumDropdown from '../../../components/ui/PremiumDropdown';
import ConfirmModal from '../components/ConfirmModal';
import LogoCard from './LogoCard';
import type { MarqueeLogo, MarqueeSettings } from './types';

export default function LogosTab() {
  const { rtl, showToast } = useStore();
  const [logos, setLogos] = useState<MarqueeLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [marqueeSettings, setMarqueeSettings] = useState<MarqueeSettings>({
    id: 'main',
    enabled: true,
  });
  const [formData, setFormData] = useState({
    id: '',
    image_url: '',
    name_ar: '',
    name_en: '',
    strip: '1',
    order_index: 0,
    type: 'image',
    text_ar: '',
    text_en: '',
    color: '#ffffff',
    background_color: '#1a1a1a',
    speed: 30,
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });

  useEffect(() => {
    fetchLogos();
    fetchMarqueeSettings();
  }, []);

  const fetchMarqueeSettings = async () => {
    try {
      const res = await api.get('/marquee-logos/settings');
      setMarqueeSettings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarqueeSettingsSave = async () => {
    setSaving(true);
    try {
      const res = await api.post('/marquee-logos/settings', marqueeSettings);
      showToast(rtl ? 'تم الحفظ بنجاح' : 'Saved successfully');
      if (res.data.settings) {
        setMarqueeSettings(res.data.settings);
      } else {
        await fetchMarqueeSettings();
      }
    } catch {
      showToast(rtl ? 'فشل الحفظ' : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const fetchLogos = () => {
    setLoading(true);
    api
      .get('/marquee-logos')
      .then((res) => setLogos(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setSaving(true);
    const fd = new FormData();
    fd.append('image', e.target.files[0]);
    fd.append('page', 'marquee');

    try {
      const res = await api.post('/upload', fd);
      if (formData.image_url) {
        await api.delete('/upload', { data: { url: formData.image_url } });
      }
      setFormData({ ...formData, image_url: res.data.url });
      showToast(rtl ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
    } catch {
      showToast(rtl ? 'فشل رفع الصورة' : 'Upload failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (formData.type === 'image' && !formData.image_url) return showToast(rtl ? 'يرجى رفع صورة أولاً' : 'Please upload an image first', 'error');
    if (formData.type === 'text' && !formData.text_ar && !formData.text_en) return showToast(rtl ? 'يرجى إدخال النص أولاً' : 'Please enter text first', 'error');
    setSaving(true);
    try {
      await api.post('/marquee-logos', {
        ...formData,
        order_index: formData.order_index || logos.filter((l) => l.strip === formData.strip).length,
      });
      showToast(rtl ? 'تم الحفظ بنجاح' : 'Saved successfully');
      setShowForm(false);
      setFormData({ id: '', image_url: '', name_ar: '', name_en: '', strip: '1', order_index: 0, type: 'image', text_ar: '', text_en: '', color: '#ffffff', background_color: '#1a1a1a', speed: 30 });
      fetchLogos();
    } catch {
      showToast(rtl ? 'فشل الحفظ' : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      const logoToDelete = logos.find(l => l.id === deleteModal.id);
      if (logoToDelete?.image_url) {
        await api.delete('/upload', { data: { url: logoToDelete.image_url } });
      }
      await api.delete(`/marquee-logos/${deleteModal.id}`);
      fetchLogos();
      setDeleteModal({ isOpen: false, id: null });
      showToast(rtl ? 'تم الحذف بنجاح' : 'Deleted successfully');
    } catch {
      showToast(rtl ? 'فشل الحذف' : 'Failed to delete', 'error');
    }
  };

  const openEdit = (logo: MarqueeLogo) => {
    setFormData(logo);
    setShowForm(true);
  };

  const strip1Logos = logos.filter((l) => l.strip === '1');
  const strip2Logos = logos.filter((l) => l.strip === '2');

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        {!showForm && (
          <button
            onClick={() => {
              setFormData({ id: '', image_url: '', name_ar: '', name_en: '', strip: '1', order_index: 0, type: 'image', text_ar: '', text_en: '', color: '#ffffff', background_color: '#1a1a1a', speed: 30 });
              setShowForm(true);
            }}
            className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl font-black text-sm transition-all duration-300 bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-600"
          >
            <span className="w-7 h-7 rounded-lg bg-white/30 flex items-center justify-center">
              <Plus size={16} strokeWidth={3} />
            </span>
            <span>{rtl ? 'إضافة عنصر' : 'Add Item'}</span>
          </button>
        )}

        {/* Enable/Disable Toggle */}
        <button
          onClick={() => {
            const newEnabled = !marqueeSettings.enabled;
            setMarqueeSettings({ ...marqueeSettings, enabled: newEnabled });
          }}
          className={`relative w-16 h-8 rounded-full transition-all duration-300 ease-out ${
            marqueeSettings.enabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <div
            className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ease-out ${
              marqueeSettings.enabled ? 'left-9' : 'left-1'
            }`}
          />
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-card p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold">
              {formData.id ? (rtl ? 'تعديل عنصر' : 'Edit Item') : (rtl ? 'إضافة عنصر جديد' : 'Add New Item')}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors">
              {rtl ? 'إلغاء' : 'Cancel'}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Text Data */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{rtl ? 'النوع' : 'Type'}</label>
                <PremiumDropdown
                  value={formData.type}
                  rtl={rtl}
                  onChange={(val: string) => setFormData({ ...formData, type: val })}
                  options={[
                    { value: 'image', labelAr: 'صورة (Image)', labelEn: 'Image' },
                    { value: 'text', labelAr: 'نص (Text)', labelEn: 'Text' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{rtl ? 'الشريط' : 'Strip'}</label>
                <PremiumDropdown
                  value={formData.strip}
                  rtl={rtl}
                  onChange={(val: string) => setFormData({ ...formData, strip: val })}
                  options={[
                    { value: '1', labelAr: 'الشريط الأول (↙ يمين)', labelEn: 'Strip 1 (Left ←)' },
                    { value: '2', labelAr: 'الشريط الثاني (↗ يسار)', labelEn: 'Strip 2 (Right →)' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{rtl ? 'الاسم (عربي)' : 'Name (Arabic)'}</label>
                  <input
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{rtl ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              {formData.type === 'text' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">{rtl ? 'النص (عربي)' : 'Text (Arabic)'}</label>
                    <textarea
                      value={formData.text_ar}
                      onChange={(e) => setFormData({ ...formData, text_ar: e.target.value })}
                      className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{rtl ? 'النص (إنجليزي)' : 'Text (English)'}</label>
                    <textarea
                      value={formData.text_en}
                      onChange={(e) => setFormData({ ...formData, text_en: e.target.value })}
                      className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none"
                      rows={2}
                      dir="ltr"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{rtl ? 'لون النص' : 'Text Color'}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-10 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-2 text-sm focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{rtl ? 'لون الخلفية' : 'Background Color'}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                      className="w-12 h-10 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                      className="flex-1 bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-2 text-sm focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{rtl ? 'سرعة الحركة (ثانية)' : 'Animation Speed (sec)'}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="120"
                    value={formData.speed}
                    onChange={(e) => setFormData({ ...formData, speed: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-16 text-center font-bold bg-slate-100 dark:bg-white/5 rounded-lg px-2 py-1">{formData.speed}s</span>
                </div>
              </div>
            </div>

            {/* Image Upload - only for image type */}
            {formData.type === 'image' && (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-6 bg-slate-50 dark:bg-white/5">
                {formData.image_url ? (
                  <div className="relative group w-full aspect-video rounded-2xl overflow-hidden">
                    <img src={resolveAssetUrl(formData.image_url)} className="w-full h-full object-contain p-4" alt="" />
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <ImageIcon className="text-white" size={40} />
                      <input type="file" onChange={handleImageUpload} className="hidden" accept=".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp" />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-3 cursor-pointer p-12">
                    <div className="w-16 h-16 bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center">
                      <ImageIcon size={32} />
                    </div>
                    <span className="font-semibold text-slate-500">{rtl ? 'اضغط لرفع اللوجو' : 'Upload Logo Image'}</span>
                    <input type="file" onChange={handleImageUpload} className="hidden" accept=".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp" />
                  </label>
                )}
                <p className="mt-4 text-xs text-slate-500 text-center">{rtl ? 'يفضل لوجو بخلفية شفافة (PNG/WebP)' : 'Prefer logo with transparent background (PNG/WebP)'}</p>
              </div>
            )}

            {/* Text Preview - only for text type */}
            {formData.type === 'text' && (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-6 bg-slate-50 dark:bg-white/5">
                <div className="w-full aspect-video rounded-2xl flex items-center justify-center p-4" style={{ backgroundColor: formData.background_color }}>
                  <span className="text-2xl font-bold px-4" style={{ color: formData.color }}>
                    {rtl ? formData.text_ar || 'نص تجريبي' : formData.text_en || 'Sample Text'}
                  </span>
                </div>
                <p className="mt-4 text-xs text-slate-500 text-center">{rtl ? 'معاينة النص بالألوان المختارة' : 'Text preview with selected colors'}</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-4 border-t border-white/10 pt-6">
            <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl hover:bg-white/5 transition-colors">
              {rtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all duration-300 bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:scale-105 active:scale-95"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {rtl ? 'حفظ العنصر' : 'Save Item'}
            </button>
          </div>
        </div>
      )}

      {/* Logos Grid by Strip */}
      {!showForm && (
        <div className="space-y-8">
          {/* Strip 1 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-primary-500" />
              <h2 className="text-xl font-bold">{rtl ? 'الشريط الأول' : 'Strip 1'} <span className="text-sm font-normal text-slate-500">({rtl ? 'يتحرك لليسار ↙' : 'Moves Left ←'})</span></h2> 
            </div>
            {strip1Logos.length === 0 ? (
              <div className="glass-card p-10 text-center">
                <p className="text-slate-500">{rtl ? 'لا توجد عناصر في الشريط الأول' : 'No items in Strip 1'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {strip1Logos.map((logo, idx) => (
                  <LogoCard key={logo.id} logo={logo} idx={idx} rtl={rtl} onEdit={openEdit} onDelete={(id) => setDeleteModal({ isOpen: true, id })} />
                ))}
              </div>
            )}
          </div>

          {/* Strip 2 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-accent-500" />
              <h2 className="text-xl font-bold">{rtl ? 'الشريط الثاني' : 'Strip 2'} <span className="text-sm font-normal text-slate-500">({rtl ? 'يتحرك لليمين ↗' : 'Moves Right →'})</span></h2>
            </div>
            {strip2Logos.length === 0 ? (
              <div className="glass-card p-10 text-center">
                <p className="text-slate-500">{rtl ? 'لا توجد عناصر في الشريط الثاني' : 'No items in Strip 2'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {strip2Logos.map((logo, idx) => (
                  <LogoCard key={logo.id} logo={logo} idx={idx} rtl={rtl} onEdit={openEdit} onDelete={(id) => setDeleteModal({ isOpen: true, id })} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-4 border-t border-white/10 pt-6">
        <button
          onClick={handleMarqueeSettingsSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all duration-300 bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:scale-105 active:scale-95"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {rtl ? 'حفظ الإعدادات' : 'Save Settings'}
        </button>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title={rtl ? 'تأكيد حذف العنصر' : 'Confirm Item Deletion'}
        message={rtl ? 'هل أنت متأكد؟ سيتم حذف العنصر نهائياً.' : 'Are you sure? The item will be permanently removed.'}
        rtl={rtl}
      />
    </>
  );
}
