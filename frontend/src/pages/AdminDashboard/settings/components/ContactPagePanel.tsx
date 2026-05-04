import { useState, useEffect } from 'react';
import { useStore } from '../../../../store/store';
import { api } from '../../../../api';
import { MessageSquare, Phone, Mail, MapPin, Clock, Type, Send, CheckCircle2, Globe, Sparkles, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import SaveButton from '../../../../components/SaveButton';

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

const InputGroup = ({ label, icon: Icon, children }: { label: string, icon: IconComponent, children: React.ReactNode }) => (
  <div className="space-y-2 group">
    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1 group-focus-within:text-primary-500 transition-colors">
      <Icon size={14} className="text-slate-400 group-focus-within:text-primary-500 transition-colors" />
      {label}
    </label>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title, desc }: { icon: IconComponent, title: string, desc: string }) => (
  <div className="flex items-start gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-white/5">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 flex items-center justify-center text-primary-500 shadow-inner">
      <Icon size={24} />
    </div>
    <div className="pt-1">
      <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">{desc}</p>
    </div>
  </div>
);

export default function ContactPagePanel() {
  const { rtl, contactSettings, updateContactSettings } = useStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(contactSettings);

  useEffect(() => {
    setForm(contactSettings);
  }, [contactSettings]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/settings', {
        contact_settings: JSON.stringify(form)
      });
      updateContactSettings(form);
      toast.success(rtl ? 'تم حفظ إعدادات صفحة التواصل' : 'Contact page settings saved');
    } catch {
      toast.error(rtl ? 'فشل الحفظ' : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 shadow-sm";
  const textareaClass = `${inputClass} resize-y min-h-[100px] leading-relaxed`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#0f172a] rounded-3xl p-8 md:p-10 mb-10 border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-sm"
    >
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="flex items-center gap-4 mb-12">
        <div className="p-4 bg-primary-500/10 rounded-2xl text-primary-500">
           <MessageSquare size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
             {rtl ? 'إعدادات صفحة التواصل' : 'Contact Page Settings'}
             <Sparkles size={20} className="text-amber-400" />
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
             {rtl ? 'تخصيص كافة النصوص والمعلومات في صفحة اتصل بنا بسهولة واحترافية' : 'Easily and professionally customize all text and info on the Contact Us page'}
          </p>
        </div>
      </div>

      <div className="space-y-16">
        
        {/* Hero Section Content */}
        <section className="bg-slate-50/50 dark:bg-white/[0.02] p-8 rounded-3xl border border-slate-100 dark:border-white/5">
          <SectionHeader 
            icon={Globe}
            title={rtl ? 'النصوص الرئيسية (Hero)' : 'Main Header Content'}
            desc={rtl ? 'العناوين والنصوص الافتتاحية التي تظهر في الواجهة العلوية لصفحة التواصل لدعوة الزوار لمراسلتك.' : 'The main titles and introductory texts appearing at the top of the contact page to invite visitors to message you.'}
          />
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            <InputGroup label={rtl ? 'العنوان (عربي)' : 'Title (Arabic)'} icon={Type}>
               <input type="text" value={form.heroTitleAr} onChange={e => setForm({...form, heroTitleAr: e.target.value})} className={inputClass} />
            </InputGroup>
            <InputGroup label={rtl ? 'العنوان (إنجليزي)' : 'Title (English)'} icon={Type}>
               <input type="text" value={form.heroTitleEn} onChange={e => setForm({...form, heroTitleEn: e.target.value})} className={inputClass} />
            </InputGroup>
            <InputGroup label={rtl ? 'الوصف (عربي)' : 'Subtitle (Arabic)'} icon={Type}>
               <textarea rows={3} value={form.heroSubtitleAr} onChange={e => setForm({...form, heroSubtitleAr: e.target.value})} className={textareaClass} />
            </InputGroup>
            <InputGroup label={rtl ? 'الوصف (إنجليزي)' : 'Subtitle (English)'} icon={Type}>
               <textarea rows={3} value={form.heroSubtitleEn} onChange={e => setForm({...form, heroSubtitleEn: e.target.value})} className={textareaClass} />
            </InputGroup>
          </div>
        </section>

        {/* Contact info Section */}
        <section className="bg-slate-50/50 dark:bg-white/[0.02] p-8 rounded-3xl border border-slate-100 dark:border-white/5">
          <SectionHeader 
            icon={Phone}
            title={rtl ? 'معلومات الاتصال المباشر' : 'Direct Contact Information'}
            desc={rtl ? 'تفاصيل أرقام الهواتف والبريد الإلكتروني ومواقع العمل لكي يسهل على العملاء الوصول إليك.' : 'Details of phone numbers, email, and locations to make it easy for customers to reach you.'}
          />
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            <InputGroup label={rtl ? 'رقم الواتساب' : 'WhatsApp Number'} icon={MessageSquare}>
               <input dir="ltr" type="text" placeholder="+20 123 456 789" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} className={inputClass} />
            </InputGroup>
            <InputGroup label={rtl ? 'رقم الهاتف' : 'Phone Number'} icon={Phone}>
               <input dir="ltr" type="text" placeholder="+20 123 456 789" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputClass} />
            </InputGroup>
            <InputGroup label={rtl ? 'البريد الإلكتروني' : 'Email Address'} icon={Mail}>
               <input dir="ltr" type="email" placeholder="contact@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputClass} />
            </InputGroup>
            <div className="hidden md:block"></div> {/* Spacer for grid alignment */}
            
            <div className="md:col-span-2 grid md:grid-cols-2 gap-x-8 gap-y-6 pt-4 border-t border-slate-200 dark:border-white/5">
              <InputGroup label={rtl ? 'العنوان الجغرافي (عربي)' : 'Address (Arabic)'} icon={MapPin}>
                 <input type="text" placeholder="القاهرة، مصر" value={form.addressAr} onChange={e => setForm({...form, addressAr: e.target.value})} className={inputClass} />
              </InputGroup>
              <InputGroup label={rtl ? 'العنوان الجغرافي (إنجليزي)' : 'Address (English)'} icon={MapPin}>
                 <input type="text" placeholder="Cairo, Egypt" value={form.addressEn} onChange={e => setForm({...form, addressEn: e.target.value})} className={inputClass} />
              </InputGroup>
              <InputGroup label={rtl ? 'مواعيد العمل (عربي)' : 'Work Hours (Arabic)'} icon={Clock}>
                 <input type="text" placeholder="الأحد - الخميس: 9 ص - 5 م" value={form.workingHoursAr} onChange={e => setForm({...form, workingHoursAr: e.target.value})} className={inputClass} />
              </InputGroup>
              <InputGroup label={rtl ? 'مواعيد العمل (إنجليزي)' : 'Work Hours (English)'} icon={Clock}>
                 <input type="text" placeholder="Sun - Thu: 9 AM - 5 PM" value={form.workingHoursEn} onChange={e => setForm({...form, workingHoursEn: e.target.value})} className={inputClass} />
              </InputGroup>
            </div>
          </div>
        </section>

        {/* Form Settings */}
        <section className="bg-slate-50/50 dark:bg-white/[0.02] p-8 rounded-3xl border border-slate-100 dark:border-white/5">
          <SectionHeader 
            icon={Send}
            title={rtl ? 'إعدادات نموذج المراسلة (Contact Form)' : 'Contact Form Settings'}
            desc={rtl ? 'النصوص التوجيهية ونصوص الأزرار الخاصة بالنموذج الذي يمكن للعميل تعبئته لإرسال رسالة مباشرة لك.' : 'Guiding texts and button texts for the form that a customer fills out to send you a direct message.'}
          />
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            <InputGroup label={rtl ? 'عنوان النموذج (عربي)' : 'Form Title (Arabic)'} icon={Type}>
               <input type="text" value={form.formTitleAr} onChange={e => setForm({...form, formTitleAr: e.target.value})} className={inputClass} />
            </InputGroup>
            <InputGroup label={rtl ? 'عنوان النموذج (إنجليزي)' : 'Form Title (English)'} icon={Type}>
               <input type="text" value={form.formTitleEn} onChange={e => setForm({...form, formTitleEn: e.target.value})} className={inputClass} />
            </InputGroup>
            <InputGroup label={rtl ? 'الوصف التوجيهي (عربي)' : 'Form Subtitle (Arabic)'} icon={Type}>
               <input type="text" value={form.formSubtitleAr} onChange={e => setForm({...form, formSubtitleAr: e.target.value})} className={inputClass} />
            </InputGroup>
            <InputGroup label={rtl ? 'الوصف التوجيهي (إنجليزي)' : 'Form Subtitle (English)'} icon={Type}>
               <input type="text" value={form.formSubtitleEn} onChange={e => setForm({...form, formSubtitleEn: e.target.value})} className={inputClass} />
            </InputGroup>
            <InputGroup label={rtl ? 'نص زر الإرسال (عربي)' : 'Submit Button Text (Arabic)'} icon={Send}>
               <input type="text" value={form.submitBtnAr} onChange={e => setForm({...form, submitBtnAr: e.target.value})} className={inputClass} />
            </InputGroup>
            <InputGroup label={rtl ? 'نص زر الإرسال (إنجليزي)' : 'Submit Button Text (English)'} icon={Send}>
               <input type="text" value={form.submitBtnEn} onChange={e => setForm({...form, submitBtnEn: e.target.value})} className={inputClass} />
            </InputGroup>
          </div>
        </section>

        {/* Social Media Links Section */}
        <section className="bg-slate-50/50 dark:bg-white/[0.02] p-8 rounded-3xl border border-slate-100 dark:border-white/5">
          <SectionHeader 
            icon={Share2}
            title={rtl ? 'روابط التواصل الاجتماعي' : 'Social Media Links'}
            desc={rtl ? 'أضف روابط المنصات لتظهر في الفوتر، اترك الحقل فارغاً لإخفاء الأيقونة الخاصة به.' : 'Add platform URLs to display in the footer, leave blank to hide its icon.'}
          />
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            <InputGroup label={rtl ? 'رابط فيسبوك' : 'Facebook URL'} icon={Share2}>
               <input dir="ltr" type="url" placeholder="https://facebook.com/..." value={form.facebookUrl || ''} onChange={e => setForm({...form, facebookUrl: e.target.value})} className={inputClass} />
            </InputGroup>
            <InputGroup label={rtl ? 'رابط انستجرام' : 'Instagram URL'} icon={Share2}>
               <input dir="ltr" type="url" placeholder="https://instagram.com/..." value={form.instagramUrl || ''} onChange={e => setForm({...form, instagramUrl: e.target.value})} className={inputClass} />
            </InputGroup>
            <InputGroup label={rtl ? 'رابط تويتر / X' : 'Twitter / X URL'} icon={Share2}>
               <input dir="ltr" type="url" placeholder="https://twitter.com/..." value={form.twitterUrl || ''} onChange={e => setForm({...form, twitterUrl: e.target.value})} className={inputClass} />
            </InputGroup>
            <InputGroup label={rtl ? 'رابط تيك توك' : 'TikTok URL'} icon={Share2}>
               <input dir="ltr" type="url" placeholder="https://tiktok.com/@..." value={form.tiktokUrl || ''} onChange={e => setForm({...form, tiktokUrl: e.target.value})} className={inputClass} />
            </InputGroup>
            <InputGroup label={rtl ? 'رابط سناب شات' : 'Snapchat URL'} icon={Share2}>
               <input dir="ltr" type="url" placeholder="https://snapchat.com/add/..." value={form.snapchatUrl || ''} onChange={e => setForm({...form, snapchatUrl: e.target.value})} className={inputClass} />
            </InputGroup>
            <InputGroup label={rtl ? 'رابط لينكد إن' : 'LinkedIn URL'} icon={Share2}>
               <input dir="ltr" type="url" placeholder="https://linkedin.com/company/..." value={form.linkedinUrl || ''} onChange={e => setForm({...form, linkedinUrl: e.target.value})} className={inputClass} />
            </InputGroup>
            <InputGroup label={rtl ? 'رابط يوتيوب' : 'YouTube URL'} icon={Share2}>
               <input dir="ltr" type="url" placeholder="https://youtube.com/..." value={form.youtubeUrl || ''} onChange={e => setForm({...form, youtubeUrl: e.target.value})} className={inputClass} />
            </InputGroup>
          </div>
        </section>

      </div>

      {/* Save Button Container */}
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10 flex justify-end">
         <SaveButton
          onClick={handleSave}
          isSaving={loading}
          rtl={rtl}
          color="glass"
          checkHasChanges={false}
         />
      </div>
    </motion.div>
  );
}
