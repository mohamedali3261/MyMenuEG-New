import { MessageCircle, Copy, Check, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../../store/store';

export default function ProductShare() {
  const { rtl } = useStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    { 
      label: 'WhatsApp', 
      icon: <MessageCircle size={18} />, 
      color: 'bg-[#25D366]',
      link: `https://wa.me/?text=${encodeURIComponent(window.location.href)}`
    },
    { 
      label: 'Facebook', 
      icon: <Share2 size={18} />, 
      color: 'bg-[#1877F2]',
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
    }

  ];

  return (
    <div className="flex items-center gap-3 mt-6">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
        {rtl ? 'مشاركة المنتج:' : 'Share Product:'}
      </span>
      <div className="flex gap-2">
        {shareLinks.map((s, i) => (
          <a
            key={i}
            href={s.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform ${s.color}`}
            title={s.label}
          >
            {s.icon}
          </a>
        ))}
        <button
          onClick={handleCopy}
          className="relative p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:text-primary-500 transition-all"
          title={rtl ? 'نسخ الرابط' : 'Copy Link'}
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}
