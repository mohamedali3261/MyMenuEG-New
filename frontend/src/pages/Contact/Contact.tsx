import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/store';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  MessageSquare, 
  Clock, 
  ArrowRight, 
  Type,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../api';

// SVG Icons for social media matching Footer.tsx for consistency
const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z"/>
  </svg>
);
const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
  </svg>
);
const SnapchatIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2c2 0 4 1.5 4 4c0 3 2 4 4 4c0 1.5-1 3-3 3c0 2-1 4-3 4c-1 3-2 3-2 3s-1 0-2-3c-2 0-3-2-3-4c-2 0-3-1.5-3-3c2 0 4-1 4-4c0-2.5 2-4 4-4z"/>
  </svg>
);
const LinkedInIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);
const YouTubeIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.1C2.5 7.1 2 8.8 2 12s.5 4.9.5 4.9c.3 1.1 1.2 2 2.3 2.1C7.1 19.5 12 19.5 12 19.5s4.9 0 7.2-.5c1.1-.1 2-1 2.3-2.1.5 0 .5-1.7.5-4.9s-.5-4.9-.5-4.9c-.3-1.1-1.2-2-2.3-2.1-2.3-.5-7.2-.5-7.2-.5s-4.9 0-7.2.5c-1.1.1-2 1-2.3 2.1z"/><path d="M9.7 15.5l6-3.5-6-3.5v7z"/>
  </svg>
);

export default function Contact() {
  const { rtl, contactSettings } = useStore();
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [customFileUrl, setCustomFileUrl] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await api.post('/upload/contact', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data && res.data.fileUrl) {
        setCustomFileUrl(res.data.fileUrl);
        toast.success(rtl ? 'تم رفع التصميم!' : 'Design Uploaded!');
      }
    } catch {
      toast.error(rtl ? 'فشل الرفع' : 'Upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = { ...formData, custom_file_url: customFileUrl || undefined, custom_notes: customNotes || undefined };
      await api.post('/contact', payload);
      toast.success(rtl ? 'تم ارسال رسالتك بنجاح! سنتواصل معك قريباً.' : 'Message sent successfully! We will contact you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setCustomFileUrl('');
      setCustomNotes('');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || (rtl ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const s = contactSettings;

  const socialLinks = [
    { icon: FacebookIcon, url: s.facebookUrl, hoverColor: 'hover:bg-[#1877F2]' },
    { icon: InstagramIcon, url: s.instagramUrl, hoverColor: 'hover:bg-[#E4405F]' },
    { icon: TwitterIcon, url: s.twitterUrl, hoverColor: 'hover:bg-[#1DA1F2]' },
    { icon: TikTokIcon, url: s.tiktokUrl, hoverColor: 'hover:bg-black dark:hover:bg-white dark:hover:text-black' },
    { icon: SnapchatIcon, url: s.snapchatUrl, hoverColor: 'hover:bg-[#FFFC00] hover:text-black' },
    { icon: YouTubeIcon, url: s.youtubeUrl, hoverColor: 'hover:bg-[#FF0000]' },
    { icon: LinkedInIcon, url: s.linkedinUrl, hoverColor: 'hover:bg-[#0A66C2]' },
  ].filter(link => link.url);

  return (
    <div className="min-h-screen relative transition-colors duration-700 overflow-hidden">
      {/* Immersive Background Elements - contained to prevent scrollbars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary-500/10 dark:bg-primary-500/20 blur-[100px] rounded-full" 
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-accent-500/10 dark:bg-accent-500/20 blur-[100px] rounded-full" 
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 lg:px-12 py-24">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm"
          >
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
             </span>
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
               {rtl ? 'نحن متاحون للرد' : 'We are live & active'}
             </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.95]"
          >
            {rtl ? s.heroTitleAr : s.heroTitleEn}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium"
          >
            {rtl ? s.heroSubtitleAr : s.heroSubtitleEn}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* Bento Grid - Quick Info */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* WhatsApp Card */}
            <motion.a
              href={`https://wa.me/${s.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.01 }}
              className="sm:col-span-2 p-8 bg-emerald-600 rounded-[2rem] text-white shadow-xl shadow-emerald-500/20 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -z-0 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-10">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <MessageSquare size={28} />
                  </div>
                  <div className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-transform ${rtl ? 'rotate-135 group-hover:rotate-180' : '-rotate-45 group-hover:rotate-0'}`}>
                    <ArrowRight size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{rtl ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}</h3>
                  <p className="text-xl md:text-2xl font-black tracking-tight">{s.whatsapp}</p>
                </div>
              </div>
            </motion.a>

            {/* General Info Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[1.5rem] shadow-sm flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center mb-6 group-hover:bg-primary-500 group-hover:text-white transition-all">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{rtl ? 'البريد الإلكتروني' : 'Email'}</h3>
                <p className="text-sm font-bold text-slate-900 dark:text-white break-all">{s.email}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[1.5rem] shadow-sm flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <Phone size={20} />
              </div>
              <div>
                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{rtl ? 'اتصل الآن' : 'Call Support'}</h3>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{s.phone}</p>
              </div>
            </motion.div>

            {/* Address Card */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="sm:col-span-2 p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] relative overflow-hidden group"
            >
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 dark:text-white/40 flex items-center justify-center border border-slate-200 dark:border-white/10">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{rtl ? 'موقعنا' : 'Our Office'}</h3>
                  <p className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    {rtl ? s.addressAr : s.addressEn}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Social Links Row */}
            <div className="sm:col-span-2 p-6 bg-primary-500 dark:bg-white/5 rounded-[2rem] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex -space-x-1.5 rtl:space-x-reverse">
                 {socialLinks.map((link, i) => (
                   <a 
                     key={i} 
                     href={link.url} 
                     target="_blank" rel="noopener noreferrer"
                     className={`w-11 h-11 rounded-full bg-white/20 border border-white/10 flex items-center justify-center transition-all hover:-translate-y-2 hover:text-white ${link.hoverColor} text-white`}
                     style={{ zIndex: 10 - i }}
                   >
                     <link.icon size={20} />
                   </a>
                 ))}
                 {socialLinks.length === 0 && <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Connect with us</p>}
               </div>
               
               <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                 <span className="text-[10px] font-black uppercase text-white tracking-widest">
                   {rtl ? s.workingHoursAr : s.workingHoursEn}
                 </span>
               </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            <div className="p-8 md:p-12 bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[3rem] shadow-2xl relative overflow-hidden h-full group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[80px] -z-10" />
              
              <div className="mb-10">
                 <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                   {rtl ? s.formTitleAr : s.formTitleEn}
                 </h2>
                 <p className="text-sm text-slate-500 dark:text-slate-400 font-medium opacity-80">
                   {rtl ? s.formSubtitleAr : s.formSubtitleEn}
                 </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                        {rtl ? 'الاسم بالكامل' : 'Full Name'}
                      </label>
                      <input 
                        type="text" required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full h-14 bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 focus:border-primary-500 focus:bg-white dark:focus:bg-black/40 rounded-xl px-5 font-bold outline-none transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                        {rtl ? 'البريد الإلكتروني' : 'Email'}
                      </label>
                      <input 
                        type="email" required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full h-14 bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 focus:border-primary-500 focus:bg-white dark:focus:bg-black/40 rounded-xl px-5 font-bold outline-none transition-all"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                        {rtl ? 'رقم الهاتف' : 'Phone'}
                      </label>
                      <input 
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full h-14 bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 focus:border-primary-500 focus:bg-white dark:focus:bg-black/40 rounded-xl px-5 font-bold outline-none transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                        {rtl ? 'موضوع الرسالة' : 'Subject'}
                      </label>
                      <input 
                        type="text"
                        value={formData.subject}
                        onChange={e => setFormData({...formData, subject: e.target.value})}
                        className="w-full h-14 bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 focus:border-primary-500 focus:bg-white dark:focus:bg-black/40 rounded-xl px-5 font-bold outline-none transition-all"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                     {rtl ? 'رسالتك' : 'Message'}
                   </label>
                   <textarea 
                     required rows={4} maxLength={500}
                     value={formData.message}
                     onChange={e => setFormData({...formData, message: e.target.value})}
                     className="w-full bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 focus:border-primary-500 focus:bg-white dark:focus:bg-black/40 rounded-2xl p-5 font-bold outline-none transition-all resize-none min-h-[120px]"
                   />
                </div>

                {/* Custom Design Section */}
                <div className="bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/10 p-4 rounded-2xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-indigo-900 dark:text-indigo-400 capitalize">{rtl ? 'تصميم مخصص' : 'Custom Design'}</h3>
                      <p className="text-xs text-indigo-700/60 dark:text-indigo-300/60 font-medium">{rtl ? 'قم بإرفاق لوجو أو شرح المطبوعات للطلب' : 'Attach your logo or printing instructions.'}</p>
                    </div>
                    <div className="relative overflow-hidden group">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*,.pdf,.ai,.psd" onChange={handleFileUpload} disabled={uploadingFile} />
                      <button className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${customFileUrl ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white group-hover:scale-105'}`}>
                        {uploadingFile ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : customFileUrl ? <CheckCircle2 size={16} /> : <UploadCloud size={16} />}
                        {customFileUrl ? (rtl ? 'تم الإرفاق!' : 'Uploaded!') : (rtl ? 'تصفح الملفات' : 'Browse Files')}
                      </button>
                    </div>
                  </div>
                  <textarea 
                    placeholder={rtl ? 'ملاحظات إضافية للتصميم (اختياري)...' : 'Additional design notes (optional)...'}
                    value={customNotes}
                    onChange={e => setCustomNotes(e.target.value)}
                    className="w-full h-16 bg-white dark:bg-black/20 border border-indigo-100 dark:border-indigo-500/10 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-none placeholder-indigo-300 dark:placeholder-indigo-700 transition-all font-medium"
                  />
                </div>

                <motion.button 
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full h-16 bg-primary-500 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary-500/10 flex items-center justify-center gap-3 disabled:opacity-70 transition-all hover:bg-primary-600 dark:hover:bg-primary-600"
                >
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div key="l" className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{rtl ? 'جاري الإرسال...' : 'Sending...'}</span>
                      </motion.div>
                    ) : (
                      <motion.div key="s" className="flex items-center gap-3">
                        <span>{rtl ? s.submitBtnAr : s.submitBtnEn}</span>
                        <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
