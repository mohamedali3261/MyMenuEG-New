import { useState, useEffect } from 'react';
import { useStore } from '../../../../store/store';
import { api } from '../../../../api';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import SaveButton from '../../../../components/SaveButton';

export default function NotFoundSettingsPanel() {
  const { rtl, notfoundSettings, updateNotFoundSettings } = useStore();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(notfoundSettings);

  useEffect(() => {
    setSettings(notfoundSettings);
  }, [notfoundSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/settings', { notfound_settings: JSON.stringify(settings) });
      updateNotFoundSettings(settings);
      toast.success(rtl ? 'تم الحفظ بنجاح' : 'Saved successfully');
    } catch {
      toast.error(rtl ? 'فشل الحفظ' : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof typeof settings, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 p-6 mb-8">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
        <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
          <AlertCircle size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {rtl ? 'إعدادات صفحة الخطأ 404' : '404 Page Settings'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {rtl ? 'تحكم في نصوص الصفحة المفقودة.' : 'Manage texts for the Not Found page.'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-2">{rtl ? 'العنوان الرئيسي (عربي)' : 'Main Title (Ar)'}</label>
            <input type="text" value={settings.titleAr} onChange={e => handleChange('titleAr', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-3 outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-2">{rtl ? 'العنوان الرئيسي (إنجليزي)' : 'Main Title (En)'}</label>
            <input type="text" value={settings.titleEn} onChange={e => handleChange('titleEn', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-3 outline-none focus:border-primary-500" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 block mb-2">{rtl ? 'الوصف الفرعي (عربي)' : 'Description (Ar)'}</label>
            <textarea rows={2} value={settings.descAr} onChange={e => handleChange('descAr', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-3 outline-none focus:border-primary-500 line-clamp-3 resize-y" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 block mb-2">{rtl ? 'الوصف الفرعي (إنجليزي)' : 'Description (En)'}</label>
            <textarea rows={2} value={settings.descEn} onChange={e => handleChange('descEn', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-3 outline-none focus:border-primary-500 line-clamp-3 resize-y" />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <SaveButton
          onClick={handleSave}
          isSaving={saving}
          rtl={rtl}
          color="glass"
          checkHasChanges={false}
        />
      </div>
    </div>
  );
}
