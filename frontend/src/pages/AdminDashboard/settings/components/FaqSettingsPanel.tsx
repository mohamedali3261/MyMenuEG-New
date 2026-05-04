import { useState, useEffect } from 'react';
import { useStore } from '../../../../store/store';
import { api } from '../../../../api';
import { HelpCircle, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import SaveButton from '../../../../components/SaveButton';

type FaqItem = {
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
};

export default function FaqSettingsPanel() {
  const { rtl, faqSettings, updateFaqSettings } = useStore();
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState(faqSettings.items);
  const [enabled, setEnabled] = useState(faqSettings.enabled);

  useEffect(() => {
    setItems(faqSettings.items);
    setEnabled(faqSettings.enabled);
  }, [faqSettings]);

  const handleSave = async () => {
    setSaving(true);
    const newSettings = { enabled, items };
    try {
      await api.post('/settings', { faq_settings: JSON.stringify(newSettings) });
      updateFaqSettings(newSettings);
      toast.success(rtl ? 'تم الحفظ بنجاح' : 'Saved successfully');
    } catch {
      toast.error(rtl ? 'فشل الحفظ' : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    setItems([...items, { qAr: 'سؤال جديد', qEn: 'New Question', aAr: 'إجابة جديدة', aEn: 'New Answer' }]);
  };

  const removeItem = (index: number) => {
    const newArr = [...items];
    newArr.splice(index, 1);
    setItems(newArr);
  };

  const updateItem = (index: number, key: keyof FaqItem, value: string) => {
    const newArr = [...items];
    newArr[index][key] = value;
    setItems(newArr);
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 p-6 mb-8">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
        <div className="p-3 bg-primary-500/10 text-primary-500 rounded-xl">
          <HelpCircle size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {rtl ? 'إعدادات الأسئلة الشائعة (FAQ)' : 'FAQ Settings'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {rtl ? 'تحكم في صفحة الأسئلة الشائعة.' : 'Manage your FAQ page.'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
          />
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {rtl ? 'تفعيل صفحة الأسئلة الشائعة' : 'Enable FAQ Page'}
          </span>
        </label>

        {enabled && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
               <h3 className="font-bold">{rtl ? 'الأسئلة' : 'Questions'}</h3>
               <button onClick={addItem} className="flex items-center gap-2 text-primary-500 bg-primary-500/10 px-4 py-2 rounded-lg font-bold text-sm">
                 <Plus size={16} />
                 {rtl ? 'إضافة سؤال' : 'Add Question'}
               </button>
            </div>
            
            {items.map((item, index) => (
              <div key={index} className="grid md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 relative">
                 <button onClick={() => removeItem(index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-2 z-10 transition">
                   <Trash2 size={16} />
                 </button>
                 <div>
                   <label className="text-xs font-bold text-slate-500 block mb-1">{rtl ? 'السؤال (عربي)' : 'Question (Ar)'}</label>
                   <input type="text" value={item.qAr} onChange={e => updateItem(index, 'qAr', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-3 outline-none focus:border-primary-500" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-500 block mb-1">{rtl ? 'السؤال (إنجليزي)' : 'Question (En)'}</label>
                   <input type="text" value={item.qEn} onChange={e => updateItem(index, 'qEn', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-3 outline-none focus:border-primary-500" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-500 block mb-1">{rtl ? 'الإجابة (عربي)' : 'Answer (Ar)'}</label>
                   <textarea rows={3} value={item.aAr} onChange={e => updateItem(index, 'aAr', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-3 outline-none focus:border-primary-500 line-clamp-3 resize-y" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-500 block mb-1">{rtl ? 'الإجابة (إنجليزي)' : 'Answer (En)'}</label>
                   <textarea rows={3} value={item.aEn} onChange={e => updateItem(index, 'aEn', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-3 outline-none focus:border-primary-500 line-clamp-3 resize-y" />
                 </div>
              </div>
            ))}
          </div>
        )}

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
