import { motion } from 'framer-motion';
import { useStore } from '../../store/store';
import { ShieldAlert, Lock, Eye, Database } from 'lucide-react';

export default function Privacy() {
  const { rtl } = useStore();

  const sectionsEn = [
    {
      icon: Eye,
      title: "1. Information Collection",
      content: "We collect information from you when you register on our site, place an order, subscribe to our newsletter, respond to a survey or fill out a form. The collected information includes your name, email address, phone number, and address."
    },
    {
      icon: Database,
      title: "2. Use of Information",
      content: "Any of the information we collect from you may be used to personalize your experience, improve our website, improve customer service, process transactions, and send periodic emails regarding your order or other products and services."
    },
    {
      icon: Lock,
      title: "3. Information Protection",
      content: "We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. We offer the use of a secure server for all data processing."
    },
    {
      icon: ShieldAlert,
      title: "4. Information Sharing",
      content: "We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential."
    }
  ];

  const sectionsAr = [
    {
      icon: Eye,
      title: "1. جمع المعلومات",
      content: "نقوم بجمع المعلومات منك عند التسجيل في موقعنا أو تقديم طلب أو الاشتراك في نشرتنا الإخبارية أو الرد على استبيان أو ملء نموذج. تتضمن المعلومات التي تم جمعها اسمك وعنوان بريدك الإلكتروني ورقم هاتفك وعنوانك."
    },
    {
      icon: Database,
      title: "2. استخدام المعلومات",
      content: "يمكن استخدام أي من المعلومات التي نجمعها منك لتخصيص تجربتك، وتحسين موقعنا على الويب، وتحسين خدمة العملاء، ومعالجة المعاملات، وإرسال رسائل بريد إلكتروني دورية بخصوص طلبك أو المنتجات والخدمات الأخرى."
    },
    {
      icon: Lock,
      title: "3. حماية المعلومات",
      content: "نحن ننفذ مجموعة متنوعة من الإجراءات الأمنية للحفاظ على سلامة معلوماتك الشخصية عند تقديم طلب أو إدخال أو إرسال أو الوصول إلى معلوماتك الشخصية. نحن نقدم استخدام خادم آمن لجميع عمليات معالجة البيانات."
    },
    {
      icon: ShieldAlert,
      title: "4. مشاركة المعلومات",
      content: "نحن لا نبيع أو نتاجر أو ننقل معلوماتك الشخصية إلى أطراف خارجية. لا يشمل ذلك الأطراف الثالثة الموثوقة التي تساعدنا في تشغيل موقعنا على الويب أو إجراء أعمالنا أو خدمتك، طالما وافقت هذه الأطراف على الحفاظ على سرية هذه المعلومات."
    }
  ];

  const sections = rtl ? sectionsAr : sectionsEn;

  return (
    <div className="min-h-screen py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-green-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-xl shadow-blue-500/10 border border-blue-500/20">
             <ShieldAlert size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
            {rtl ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
            {rtl ? 'نحن نحترم خصوصيتك ونهتم بحماية بياناتك الشخصية.' : 'We respect your privacy and are committed to protecting your personal data.'}
          </p>
        </motion.div>

        {/* Content */}
        <div className="space-y-8">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-8 md:p-10 bg-white/5 dark:bg-[#0b1120]/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-colors"
              >
                <div className="flex items-start gap-6">
                  <div className="hidden md:flex mt-1 w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-colors shrink-0">
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-4">
                      {section.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-loose font-medium text-sm md:text-base">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Footer Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center text-sm font-bold text-slate-400"
        >
          {rtl ? 'آخر تحديث: ' : 'Last Updated: '} 
          {new Date().toLocaleDateString(rtl ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </motion.div>
      </div>
    </div>
  );
}
