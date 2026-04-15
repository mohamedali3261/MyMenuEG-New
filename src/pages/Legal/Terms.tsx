import { motion } from 'framer-motion';
import { useStore } from '../../store/store';
import { Scale, FileText } from 'lucide-react';

export default function Terms() {
  const { rtl } = useStore();

  const sectionsEn = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service."
    },
    {
      title: "2. Use License",
      content: "Permission is granted to temporarily download one copy of the materials (information or software) on MyMenuEG's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title."
    },
    {
      title: "3. Disclaimer",
      content: "The materials on MyMenuEG's website are provided on an 'as is' basis. MyMenuEG makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."
    },
    {
      title: "4. Limitations",
      content: "In no event shall MyMenuEG or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on MyMenuEG's website."
    },
    {
      title: "5. Revisions and Errata",
      content: "The materials appearing on MyMenuEG's website could include technical, typographical, or photographic errors. MyMenuEG does not warrant that any of the materials on its website are accurate, complete, or current."
    }
  ];

  const sectionsAr = [
    {
      title: "1. قبول الشروط",
      content: "من خلال الوصول إلى هذا الموقع واستخدامه، فإنك تقبل وتوافق على الالتزام بشروط وأحكام هذه الاتفاقية. إذا كنت لا توافق على الالتزام بهذه الشروط، يرجى عدم استخدام هذه الخدمة."
    },
    {
      title: "2. ترخيص الاستخدام",
      content: "يُمنح الإذن لتنزيل نسخة واحدة مؤقتًا من المواد (المعلومات أو البرامج) على موقع MyMenuEG للمشاهدة العابرة الشخصية وغير التجارية فقط. هذا هو منح ترخيص، وليس نقل ملكية."
    },
    {
      title: "3. إخلاء المسؤولية",
      content: "يتم توفير المواد الموجودة على موقع MyMenuEG على أساس 'كما هي'. لا تقدم MyMenuEG أي ضمانات، صريحة أو ضمنية، وتنكر بموجب هذا وتلغي جميع الضمانات الأخرى بما في ذلك على سبيل المثال لا الحصر، الضمانات الضمنية أو شروط القابلية للتسويق، والملائمة لغرض معين، أو عدم التعدي على الملكية الفكرية أو أي انتهاك آخر للحقوق."
    },
    {
      title: "4. القيود",
      content: "لا تتحمل شركة MyMenuEG أو مورديها بأي حال من الأحوال المسؤولية عن أي أضرار (بما في ذلك، على سبيل المثال لا الحصر، الأضرار الناجمة عن فقدان البيانات أو الأرباح، أو بسبب انقطاع الأعمال) الناشئة عن استخدام أو عدم القدرة على استخدام المواد الموجودة على موقع الشركة."
    },
    {
      title: "5. المراجعات والأخطاء المطبعية",
      content: "قد تتضمن المواد التي تظهر على موقع MyMenuEG أخطاء تقنية أو مطبعية أو فوتوغرافية. لا تضمن الشركة أن أيًا من المواد الموجودة على موقعها الإلكتروني دقيقة أو كاملة أو حديثة."
    }
  ];

  const sections = rtl ? sectionsAr : sectionsEn;

  return (
    <div className="min-h-screen py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-primary-500/10 flex items-center justify-center text-primary-500 shadow-xl shadow-primary-500/10 border border-primary-500/20">
             <Scale size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
            {rtl ? 'الشروط والأحكام' : 'Terms & Conditions'}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
            {rtl ? 'يرجى قراءة الشروط والأحكام بعناية قبل استخدام موقعنا وخدماتنا.' : 'Please read these terms and conditions carefully before using our website.'}
          </p>
        </motion.div>

        {/* Content */}
        <div className="space-y-8">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-8 md:p-10 bg-white/5 dark:bg-[#0b1120]/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:border-primary-500/30 transition-colors"
            >
              <div className="flex items-start gap-6">
                <div className="hidden md:flex mt-1 w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 items-center justify-center text-slate-400 group-hover:text-primary-500 group-hover:bg-primary-500/10 transition-colors shrink-0">
                  <FileText size={24} />
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
          ))}
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
