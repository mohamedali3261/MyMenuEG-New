import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/store';
import { Phone, Mail, MapPin, Send, MessageSquare, Clock, Globe, ArrowRight, Type } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ContactInfoCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  titleAr: string;
  titleEn: string;
  valueEn: string;
  valueAr: string;
  link: string;
  rtl: boolean;
}

const ContactInfoCard = ({ icon: Icon, titleAr, titleEn, valueAr, valueEn, link, rtl }: ContactInfoCardProps) => (
  <motion.a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ y: -8, scale: 1.02 }}
    className="group p-8 glass-card border border-white/10 rounded-[2.5rem] flex items-center gap-6 hover:border-primary-500/40 transition-all shadow-2xl shadow-black/5 relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 blur-2xl -z-10 group-hover:bg-primary-500/10 transition-colors" />
    <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all duration-500 shadow-xl shadow-primary-500/10">
      <Icon size={28} />
    </div>
    <div className="flex-grow">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
        {rtl ? titleAr : titleEn}
      </h3>
      <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
        {rtl ? valueAr : valueEn}
      </p>
    </div>
    <div className={`p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:text-primary-500 group-hover:bg-primary-500/10 transition-all ${rtl ? 'rotate-180' : ''}`}>
      <ArrowRight size={16} />
    </div>
  </motion.a>
);

export default function Contact() {
  const { rtl, contactSettings } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success(rtl ? 'تم ارسال رسالتك بنجاح! سنتواصل معك قريباً.' : 'Message sent successfully! We will contact you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 1500);
  };

  const s = contactSettings;

  return (
    <div className="min-h-screen pb-20 px-4 md:px-10">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-[150px] -z-10" />
        
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 font-black text-[10px] uppercase tracking-[0.4em] shadow-lg shadow-primary-500/5">
            <Globe size={14} className="animate-pulse" />
            {rtl ? 'تواصل معنا' : 'Get In Touch'}
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-primary-600 dark:text-primary-400 tracking-tight leading-[0.95]">
            {rtl ? s.heroTitleAr : s.heroTitleEn} <br />
            <span className="text-accent-600 dark:text-accent-400">
              {rtl ? 'دائماً وأبداً' : 'Every Single Day'}
            </span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed opacity-80 pt-4">
            {rtl ? s.heroSubtitleAr : s.heroSubtitleEn}
          </p>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Contact Info Column */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <ContactInfoCard 
            rtl={rtl}
            icon={MessageSquare}
            titleAr="واتس اب"
            titleEn="WhatsApp"
            valueAr={s.whatsapp}
            valueEn={s.whatsapp}
            link={`https://wa.me/${s.whatsapp.replace(/[^0-9]/g, '')}`}
          />
          <ContactInfoCard 
            rtl={rtl}
            icon={Phone}
            titleAr="اتصل بنا"
            titleEn="Call Us"
            valueAr={s.phone}
            valueEn={s.phone}
            link={`tel:${s.phone.replace(/[^0-9]/g, '')}`}
          />
          <ContactInfoCard 
            rtl={rtl}
            icon={Mail}
            titleAr="البريد الإلكتروني"
            titleEn="Email Us"
            valueAr={s.email}
            valueEn={s.email}
            link={`mailto:${s.email}`}
          />
          <ContactInfoCard 
            rtl={rtl}
            icon={MapPin}
            titleAr="الموقع"
            titleEn="Visit Us"
            valueAr={s.addressAr}
            valueEn={s.addressEn}
            link="#"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-10 glass-card border border-primary-500/10 rounded-[3rem] mt-4 space-y-8 bg-primary-500/[0.03] relative overflow-hidden group shadow-2xl"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-[80px] -z-10 group-hover:scale-150 transition-transform duration-1000" />
             
             <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-xl shadow-primary-500/30">
                   <Clock size={28} />
                </div>
                <div>
                   <h4 className="font-black text-sm uppercase tracking-[0.2em]">{rtl ? 'ساعات العمل' : 'Working Hours'}</h4>
                   <p className="text-xs text-primary-500 font-bold">{rtl ? 'نحن متاحون لخدمتكم' : 'We are available for you'}</p>
                </div>
             </div>

             <div className="space-y-5">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                   <span className="text-slate-400 font-bold text-sm">{rtl ? 'الجدول الزمني' : 'Weekly Schedule'}</span>
                   <span className="font-black text-sm">{rtl ? s.workingHoursAr : s.workingHoursEn}</span>
                </div>
                <div className="flex justify-between items-center p-4">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
                      <span className="text-slate-400 font-bold text-sm">{rtl ? 'الحالة الحالية' : 'Current Status'}</span>
                   </div>
                   <span className="text-primary-500 font-black uppercase tracking-widest text-[11px] bg-primary-500/10 px-4 py-1.5 rounded-full border border-primary-500/20">
                      {rtl ? 'مفتوح الآن' : 'Open Now'}
                   </span>
                </div>
             </div>
          </motion.div>
        </div>

        {/* Contact Form Column */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-7"
        >
          <div className="p-12 glass-card border border-white/20 rounded-[4rem] shadow-2xl relative overflow-hidden h-full group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[100px] -z-10 group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/5 blur-[80px] -z-10" />
            
            <div className="mb-12 text-center lg:text-start">
               <h2 className="text-4xl font-black text-accent-600 dark:text-accent-400 mb-4 tracking-tight">
                 {rtl ? s.formTitleAr : s.formTitleEn}
               </h2>
               <p className="text-base text-slate-500 font-medium opacity-80">
                 {rtl ? s.formSubtitleAr : s.formSubtitleEn}
               </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6 rtl:mr-6 rtl:ml-0 flex items-center gap-2">
                    <Globe size={12} className="text-primary-500" />
                    {rtl ? 'الأسم بالكامل' : 'Full Name'}
                  </label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full h-18 bg-slate-100 dark:bg-white/5 border border-white/5 focus:border-primary-500/50 focus:bg-white dark:focus:bg-white/10 rounded-2xl px-8 font-bold outline-none transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6 rtl:mr-6 rtl:ml-0 flex items-center gap-2">
                    <Mail size={12} className="text-primary-500" />
                    {rtl ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    className="w-full h-18 bg-slate-100 dark:bg-white/5 border border-white/5 focus:border-primary-500/50 focus:bg-white dark:focus:bg-white/10 rounded-2xl px-8 font-bold outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6 rtl:mr-6 rtl:ml-0 flex items-center gap-2">
                    <Phone size={12} className="text-primary-500" />
                    {rtl ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <input 
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="+20 123 456 ..."
                    className="w-full h-18 bg-slate-100 dark:bg-white/5 border border-white/5 focus:border-primary-500/50 focus:bg-white dark:focus:bg-white/10 rounded-2xl px-8 font-bold outline-none transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6 rtl:mr-6 rtl:ml-0 flex items-center gap-2">
                    <MessageSquare size={12} className="text-primary-500" />
                    {rtl ? 'الموضوع' : 'Subject'}
                  </label>
                  <input 
                    type="text"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    placeholder={rtl ? "التصميم المخصص" : "Custom Design"}
                    className="w-full h-18 bg-slate-100 dark:bg-white/5 border border-white/5 focus:border-primary-500/50 focus:bg-white dark:focus:bg-white/10 rounded-2xl px-8 font-bold outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6 rtl:mr-6 rtl:ml-0 flex items-center gap-2">
                  <Type size={12} className="text-primary-500" />
                  {rtl ? 'الرسالة' : 'Your Message'}
                </label>
                <textarea 
                  required
                  rows={5}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  placeholder={rtl ? "اكتب رسالتك هنا..." : "Tell us what you need..."}
                  className="w-full bg-slate-100 dark:bg-white/5 border border-white/5 focus:border-primary-500/50 focus:bg-white dark:focus:bg-white/10 rounded-[2.5rem] p-8 font-bold outline-none transition-all resize-none shadow-inner min-h-[160px]"
                />
              </div>

              {/* Premium Submit Button */}
              <motion.button 
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full h-20 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 bg-[length:200%_100%] hover:bg-[100%_0] transition-all duration-700 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-primary-500/40 flex items-center justify-center gap-4 group disabled:opacity-70 overflow-hidden"
              >
                {/* Glint Effect */}
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-45 pointer-events-none"
                />

                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="animate-pulse">{rtl ? 'جاري الإرسال...' : 'Sending Now...'}</span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="normal"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-4"
                    >
                      <span>{rtl ? s.submitBtnAr : s.submitBtnEn}</span>
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 group-hover:translate-x-2 transition-all">
                        <Send size={18} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
