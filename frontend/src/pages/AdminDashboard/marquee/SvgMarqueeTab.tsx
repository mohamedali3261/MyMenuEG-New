import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { Plus, Trash2, Save, Loader2, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { api } from '../../../api';
import { resolveAssetUrl } from '../../../utils/assetUrl';
import PremiumDropdown from '../../../components/ui/PremiumDropdown';
import type { SvgMarqueeSettings, SvgMarqueeItem } from './types';

export default function SvgMarqueeTab() {
  const { rtl, showToast } = useStore();
  const [saving, setSaving] = useState(false);
  const [svgSettings, setSvgSettings] = useState<SvgMarqueeSettings & { items: SvgMarqueeItem[] }>({
    id: 'main',
    left_text_1: 'Sip, smile, repeat',
    left_text_2: 'Taste the sparkle',
    right_text_1: 'Sip, smile, repeat',
    right_text_2: 'Taste the sparkle',
    text_color: '#ff0000',
    animation_duration: 15,
    show_can: true,
    show_bg_svg: true,
    can_image_url: null,
    can_size: 200,
    font_family: 'Lilita One, sans-serif',
    enabled: true,
    items: [],
  });
  const [svgItemForm, setSvgItemForm] = useState<{ show: boolean; editId: string | null; type: string; image_url: string; text_ar: string; text_en: string; strip: string }>({
    show: false, editId: null, type: 'image', image_url: '', text_ar: '', text_en: '', strip: '1',
  });

  useEffect(() => {
    fetchSvgSettings();
  }, []);

  const fetchSvgSettings = () => {
    api
      .get('/svg-marquee')
      .then((res) => setSvgSettings(res.data))
      .catch(console.error);
  };

  const handleSvgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setSaving(true);
    const fd = new FormData();
    fd.append('image', e.target.files[0]);
    fd.append('page', 'marquee');

    try {
      const res = await api.post('/upload', fd);
      if (svgSettings.can_image_url) {
        await api.delete('/upload', { data: { url: svgSettings.can_image_url } });
      }
      setSvgSettings({ ...svgSettings, can_image_url: res.data.url });
      showToast(rtl ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
    } catch {
      showToast(rtl ? 'فشل رفع الصورة' : 'Upload failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSvgSave = async () => {
    setSaving(true);
    try {
      await api.post('/svg-marquee', svgSettings);
      showToast(rtl ? 'تم الحفظ بنجاح' : 'Saved successfully');
      fetchSvgSettings();
    } catch {
      showToast(rtl ? 'فشل الحفظ' : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSvgItemUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setSaving(true);
    const fd = new FormData();
    fd.append('image', e.target.files[0]);
    fd.append('page', 'marquee');
    try {
      const res = await api.post('/upload', fd);
      setSvgItemForm({ ...svgItemForm, image_url: res.data.url });
      showToast(rtl ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
    } catch {
      showToast(rtl ? 'فشل رفع الصورة' : 'Upload failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSvgItemSave = async () => {
    if (svgItemForm.type === 'image' && !svgItemForm.image_url) return showToast(rtl ? 'يرجى رفع صورة أولاً' : 'Please upload an image first', 'error');
    if (svgItemForm.type === 'text' && !svgItemForm.text_ar && !svgItemForm.text_en) return showToast(rtl ? 'يرجى إدخال النص أولاً' : 'Please enter text first', 'error');
    setSaving(true);
    try {
      const payload = {
        type: svgItemForm.type,
        image_url: svgItemForm.image_url || null,
        text_ar: svgItemForm.text_ar || null,
        text_en: svgItemForm.text_en || null,
        strip: svgItemForm.strip,
        order_index: svgSettings.items.filter(i => i.strip === svgItemForm.strip).length,
      };
      if (svgItemForm.editId) {
        await api.put(`/svg-marquee/items/${svgItemForm.editId}`, payload);
      } else {
        await api.post('/svg-marquee/items', payload);
      }
      showToast(rtl ? 'تم الحفظ بنجاح' : 'Saved successfully');
      setSvgItemForm({ show: false, editId: null, type: 'image', image_url: '', text_ar: '', text_en: '', strip: '1' });
      fetchSvgSettings();
    } catch {
      showToast(rtl ? 'فشل الحفظ' : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSvgItemDelete = async (id: string, imageUrl: string | null) => {
    try {
      if (imageUrl) await api.delete('/upload', { data: { url: imageUrl } });
      await api.delete(`/svg-marquee/items/${id}`);
      fetchSvgSettings();
      showToast(rtl ? 'تم الحذف بنجاح' : 'Deleted successfully');
    } catch {
      showToast(rtl ? 'فشل الحذف' : 'Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* SVG Marquee Settings */}
      <div className="glass-card p-8 space-y-8">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold">{rtl ? 'إعدادات الشريط الرسومي' : 'Graphical Strip Settings'}</h2>
          <button
            onClick={() => setSvgSettings({ ...svgSettings, enabled: !svgSettings.enabled })}
            className={`relative w-16 h-8 rounded-full transition-all duration-300 ease-out ${
              svgSettings.enabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ease-out ${
                svgSettings.enabled ? 'left-9' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Texts Section */}
        <div>
          <h3 className="text-lg font-bold mb-4">{rtl ? 'النصوص' : 'Texts'}</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-primary-500 uppercase">{rtl ? 'العمود الأيسر' : 'Left Column'}</h4>
              <div>
                <label className="block text-sm font-medium mb-1">{rtl ? 'النص الأول (يسار ←)' : 'Text 1 (Left ←)'}</label>
                <input
                  type="text"
                  value={svgSettings.left_text_1}
                  onChange={(e) => setSvgSettings({ ...svgSettings, left_text_1: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{rtl ? 'النص الثاني (يسار →) - Outline' : 'Text 2 (Left →) - Outline'}</label>
                <input
                  type="text"
                  value={svgSettings.left_text_2}
                  onChange={(e) => setSvgSettings({ ...svgSettings, left_text_2: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-accent-500 uppercase">{rtl ? 'العمود الأيمن' : 'Right Column'}</h4>
              <div>
                <label className="block text-sm font-medium mb-1">{rtl ? 'النص الأول (يمين ←) - Outline' : 'Text 1 (Right ←) - Outline'}</label>
                <input
                  type="text"
                  value={svgSettings.right_text_1}
                  onChange={(e) => setSvgSettings({ ...svgSettings, right_text_1: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{rtl ? 'النص الثاني (يمين →)' : 'Text 2 (Right →)'}</label>
                <input
                  type="text"
                  value={svgSettings.right_text_2}
                  onChange={(e) => setSvgSettings({ ...svgSettings, right_text_2: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Colors Section */}
        <div>
          <h3 className="text-lg font-bold mb-4">{rtl ? 'الألوان' : 'Colors'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">{rtl ? 'اللون الرئيسي' : 'Main Color'}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={svgSettings.text_color}
                  onChange={(e) => setSvgSettings({ ...svgSettings, text_color: e.target.value })}
                  className="w-12 h-10 rounded-lg cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={svgSettings.text_color}
                  onChange={(e) => setSvgSettings({ ...svgSettings, text_color: e.target.value })}
                  className="flex-1 bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-2 text-sm focus:border-primary-500 outline-none"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Animation & Display Section */}
        <div>
          <h3 className="text-lg font-bold mb-4">{rtl ? 'الحركة والعرض' : 'Animation & Display'}</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">{rtl ? 'مدة الحركة (ثانية)' : 'Animation Duration (sec)'}</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={svgSettings.animation_duration}
                  onChange={(e) => setSvgSettings({ ...svgSettings, animation_duration: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="w-16 text-center font-bold bg-slate-100 dark:bg-white/5 rounded-lg px-2 py-1">{svgSettings.animation_duration}s</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{rtl ? 'نوع الخط' : 'Font Family'}</label>
              <input
                type="text"
                value={svgSettings.font_family}
                onChange={(e) => setSvgSettings({ ...svgSettings, font_family: e.target.value })}
                className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={() => setSvgSettings({ ...svgSettings, show_can: !svgSettings.show_can })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                svgSettings.show_can
                  ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                  : 'bg-red-500/10 text-red-500 border border-red-500/30'
              }`}
            >
              {svgSettings.show_can ? <Eye size={16} /> : <EyeOff size={16} />}
              {rtl ? 'علبة الكان' : 'Can SVG'}
            </button>
            <button
              onClick={() => setSvgSettings({ ...svgSettings, show_bg_svg: !svgSettings.show_bg_svg })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                svgSettings.show_bg_svg
                  ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                  : 'bg-red-500/10 text-red-500 border border-red-500/30'
              }`}
            >
              {svgSettings.show_bg_svg ? <Eye size={16} /> : <EyeOff size={16} />}
              {rtl ? 'خلفية SVG' : 'BG SVG'}
            </button>
          </div>
        </div>

        {/* Can Image Upload */}
        <div>
          <h3 className="text-lg font-bold mb-4">{rtl ? 'صورة العلبة (اختياري)' : 'Can Image (optional)'}</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">{rtl ? 'حجم العلبة (بكسل)' : 'Can Size (px)'}</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="50"
                max="500"
                value={svgSettings.can_size || 200}
                onChange={(e) => setSvgSettings({ ...svgSettings, can_size: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="w-20 text-center font-bold bg-slate-100 dark:bg-white/5 rounded-lg px-2 py-1">{svgSettings.can_size || 200}px</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-6 bg-slate-50 dark:bg-white/5">
            {svgSettings.can_image_url ? (
              <div className="relative group w-full max-w-xs rounded-2xl overflow-hidden">
                <img src={resolveAssetUrl(svgSettings.can_image_url)} className="w-full h-auto object-contain p-4" alt="" />
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  <label className="cursor-pointer px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-bold">
                    {rtl ? 'تغيير' : 'Change'}
                    <input type="file" onChange={handleSvgImageUpload} className="hidden" accept=".png,.jpg,.jpeg,.gif,.webp" />
                  </label>
                  <button
                    onClick={() => setSvgSettings({ ...svgSettings, can_image_url: null })}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold"
                  >
                    {rtl ? 'حذف' : 'Remove'}
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-3 cursor-pointer p-8">
                <div className="w-16 h-16 bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center">
                  <ImageIcon size={32} />
                </div>
                <span className="font-semibold text-slate-500">{rtl ? 'اضغط لرفع صورة العلبة' : 'Upload Can Image'}</span>
                <input type="file" onChange={handleSvgImageUpload} className="hidden" accept=".png,.jpg,.jpeg,.gif,.webp" />
              </label>
            )}
          </div>
        </div>

        {/* SVG Items Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">{rtl ? 'عناصر الشريط' : 'Strip Items'}</h3>
            <button
              onClick={() => setSvgItemForm({ show: true, editId: null, type: 'image', image_url: '', text_ar: '', text_en: '', strip: '1' })}
              className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl font-black text-sm transition-all duration-300 bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-600"
            >
              <span className="w-7 h-7 rounded-lg bg-white/30 flex items-center justify-center">
                <Plus size={16} strokeWidth={3} />
              </span>
              <span>{rtl ? 'إضافة عنصر' : 'Add Item'}</span>
            </button>
          </div>

          {/* Add/Edit Item Form */}
          {svgItemForm.show && (
            <div className="glass-card p-6 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h4 className="text-base font-bold">
                  {svgItemForm.editId ? (rtl ? 'تعديل عنصر' : 'Edit Item') : (rtl ? 'إضافة عنصر جديد' : 'Add New Item')}
                </h4>
                <button onClick={() => setSvgItemForm({ show: false, editId: null, type: 'image', image_url: '', text_ar: '', text_en: '', strip: '1' })} className="text-slate-500 hover:text-white transition-colors">
                  {rtl ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{rtl ? 'النوع' : 'Type'}</label>
                    <PremiumDropdown
                      value={svgItemForm.type}
                      rtl={rtl}
                      onChange={(val: string) => setSvgItemForm({ ...svgItemForm, type: val })}
                      options={[
                        { value: 'image', labelAr: 'صورة (Image)', labelEn: 'Image' },
                        { value: 'text', labelAr: 'نص (Text)', labelEn: 'Text' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{rtl ? 'الشريط' : 'Strip'}</label>
                    <PremiumDropdown
                      value={svgItemForm.strip}
                      rtl={rtl}
                      onChange={(val: string) => setSvgItemForm({ ...svgItemForm, strip: val })}
                      options={[
                        { value: '1', labelAr: 'الشريط الأول (↙ يمين)', labelEn: 'Strip 1 (Left ←)' },
                        { value: '2', labelAr: 'الشريط الثاني (↗ يسار)', labelEn: 'Strip 2 (Right →)' },
                      ]}
                    />
                  </div>
                  {svgItemForm.type === 'text' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">{rtl ? 'النص (عربي)' : 'Text (Arabic)'}</label>
                        <input type="text" value={svgItemForm.text_ar} onChange={(e) => setSvgItemForm({ ...svgItemForm, text_ar: e.target.value })} className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{rtl ? 'النص (إنجليزي)' : 'Text (English)'}</label>
                        <input type="text" value={svgItemForm.text_en} onChange={(e) => setSvgItemForm({ ...svgItemForm, text_en: e.target.value })} className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none" dir="ltr" />
                      </div>
                    </div>
                  )}
                </div>
                {svgItemForm.type === 'image' && (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-6 bg-slate-50 dark:bg-white/5">
                    {svgItemForm.image_url ? (
                      <div className="relative group w-full aspect-video rounded-2xl overflow-hidden">
                        <img src={resolveAssetUrl(svgItemForm.image_url)} className="w-full h-full object-contain p-4" alt="" />
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <ImageIcon className="text-white" size={40} />
                          <input type="file" onChange={handleSvgItemUpload} className="hidden" accept=".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp" />
                        </label>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-3 cursor-pointer p-12">
                        <div className="w-16 h-16 bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center">
                          <ImageIcon size={32} />
                        </div>
                        <span className="font-semibold text-slate-500">{rtl ? 'اضغط لرفع الصورة' : 'Upload Image'}</span>
                        <input type="file" onChange={handleSvgItemUpload} className="hidden" accept=".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp" />
                      </label>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-4 border-t border-white/10 pt-4">
                <button onClick={() => setSvgItemForm({ show: false, editId: null, type: 'image', image_url: '', text_ar: '', text_en: '', strip: '1' })} className="px-6 py-3 rounded-xl hover:bg-white/5 transition-colors">
                  {rtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={handleSvgItemSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all duration-300 bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600">
                  {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  {rtl ? 'حفظ العنصر' : 'Save Item'}
                </button>
              </div>
            </div>
          )}

          {/* Items Grid */}
          {svgSettings.items.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <p className="text-slate-500">{rtl ? 'لا توجد عناصر بعد' : 'No items yet'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {['1', '2'].map(strip => {
                const stripItems = svgSettings.items.filter(i => i.strip === strip);
                if (stripItems.length === 0) return null;
                return (
                  <div key={strip}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-3 h-3 rounded-full ${strip === '1' ? 'bg-primary-500' : 'bg-accent-500'}`} />
                      <h4 className="text-sm font-bold">
                        {strip === '1' ? (rtl ? 'الشريط الأول' : 'Strip 1') : (rtl ? 'الشريط الثاني' : 'Strip 2')}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {stripItems.map((item) => (
                        <div key={item.id} className="glass-card overflow-hidden group hover:border-primary-500/30 transition-all duration-300">
                          <div className="aspect-square rounded-t-xl overflow-hidden relative bg-white/5 p-4 flex items-center justify-center">
                            {item.type === 'image' && item.image_url ? (
                              <img src={resolveAssetUrl(item.image_url)} className="max-w-full max-h-full object-contain" alt="" />
                            ) : (
                              <span className="text-sm font-bold text-center" style={{ color: svgSettings.text_color }}>
                                {rtl ? item.text_ar : item.text_en}
                              </span>
                            )}
                          </div>
                          <div className="p-2 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">
                              {item.type === 'image' ? (rtl ? 'صورة' : 'Image') : (rtl ? 'نص' : 'Text')}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setSvgItemForm({
                                  show: true, editId: item.id, type: item.type,
                                  image_url: item.image_url || '', text_ar: item.text_ar || '', text_en: item.text_en || '', strip: item.strip
                                })}
                                className="p-1.5 rounded-lg hover:bg-primary-500/10 text-primary-500 transition-colors"
                              >
                                <ImageIcon size={14} />
                              </button>
                              <button
                                onClick={() => handleSvgItemDelete(item.id, item.image_url)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4 border-t border-white/10 pt-6">
          <button
            onClick={handleSvgSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all duration-300 bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:scale-105 active:scale-95"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {rtl ? 'حفظ الإعدادات' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
