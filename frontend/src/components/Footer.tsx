import { Link } from 'react-router-dom';
import { useStore } from '../store/store';
import { resolveAssetUrl } from '../utils/assetUrl';
import { 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface FooterPage {
  id: string;
  slug: string;
  status?: string;
  name_ar: string;
  name_en: string;
}

// SVG Icons for social media to avoid lucide-react version issues with brand icons
const FacebookIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const TwitterIconSVG = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z"/>
  </svg>
);

const TikTokIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
  </svg>
);

const SnapchatIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2c2 0 4 1.5 4 4c0 3 2 4 4 4c0 1.5-1 3-3 3c0 2-1 4-3 4c-1 3-2 3-2 3s-1 0-2-3c-2 0-3-2-3-4c-2 0-3-1.5-3-3c2 0 4-1 4-4c0-2.5 2-4 4-4z"/>
  </svg>
);

const LinkedInIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);

const YouTubeIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.1C2.5 7.1 2 8.8 2 12s.5 4.9.5 4.9c.3 1.1 1.2 2 2.3 2.1C7.1 19.5 12 19.5 12 19.5s4.9 0 7.2-.5c1.1-.1 2-1 2.3-2.1.5 0 .5-1.7.5-4.9s-.5-4.9-.5-4.9c-.3-1.1-1.2-2-2.3-2.1-2.3-.5-7.2-.5-7.2-.5s-4.9 0-7.2.5c-1.1.1-2 1-2.3 2.1z"/><path d="M9.7 15.5l6-3.5-6-3.5v7z"/>
  </svg>
);

export default function Footer() {
  const { rtl, branding, pages, contactSettings } = useStore();
  
  const contact = contactSettings || {
    phone: '+20 123 456 789',
    email: 'hello@mymenueg.com',
    addressAr: 'القاهرة، مصر',
    addressEn: 'Cairo, Egypt'
  };

  const activePages = pages.filter((p: FooterPage) => p.status === 'active' && p.id !== 'home');

  return (
    <footer className="relative pt-24 pb-12 overflow-hidden bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/10">
      {/* Background Blobs for specific Footer depth */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 dark:bg-primary-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-500/5 dark:bg-accent-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* Brand Section */}
          <div className="space-y-6 lg:col-span-5 md:col-span-3">
            <Link to="/" className="flex items-center gap-2 group">
               {branding.logoUrl ? (
                 <img src={resolveAssetUrl(branding.logoUrl)} alt={branding.storeName} className="h-12 w-auto object-contain transition-transform group-hover:scale-110" />
               ) : (
                 <div className="flex items-center">
                    <span className="text-primary-500 font-black text-3xl">{branding.storeName?.substring(0, 2)}</span>
                    <span className="text-slate-900 dark:text-white font-black text-3xl">{branding.storeName?.substring(2)}</span>
                 </div>
               )}
            </Link>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              {rtl 
                ? 'نحن نقدم أرقى حلول التغليف المبتكرة لمشروعك، بجودة عالمية وتصاميم عصرية تلبي تطلعاتك.' 
                : 'We provide the finest innovative packaging solutions for your project, with global quality and modern designs.'}
            </p>
                <div className="flex flex-wrap items-center gap-3">
                  {[
                    { url: contact.facebookUrl, icon: <FacebookIcon size={18} />, hover: 'hover:bg-[#1877F2]' },
                    { url: contact.instagramUrl, icon: <InstagramIcon size={18} />, hover: 'hover:bg-[#E4405F]' },
                    { url: contact.twitterUrl, icon: <TwitterIconSVG size={18} />, hover: 'hover:bg-[#1DA1F2]' },
                    { url: contact.tiktokUrl, icon: <TikTokIcon size={18} />, hover: 'hover:bg-black dark:hover:bg-white dark:hover:text-black' },
                    { url: contact.snapchatUrl, icon: <SnapchatIcon size={18} />, hover: 'hover:bg-[#FFFC00] hover:text-black' },
                    { url: contact.linkedinUrl, icon: <LinkedInIcon size={18} />, hover: 'hover:bg-[#0A66C2]' },
                    { url: contact.youtubeUrl, icon: <YouTubeIcon size={18} />, hover: 'hover:bg-[#FF0000]' }
                  ].filter(s => s.url).map((s, idx) => (
                    <a 
                      key={idx}
                      href={s.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={`relative p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white transition-all active:scale-95 group ${s.hover} shadow-sm`}
                    >
                      <div className="transition-transform group-hover:scale-110">
                        {s.icon}
                      </div>
                    </a>
                  ))}
                </div>
          </div>

          {/* Quick Explorer (Dynamic Pages) */}
          <div className="space-y-6 lg:col-span-3 md:col-span-1">
            <h3 className="text-lg font-black uppercase tracking-widest text-primary-500">
               {rtl ? 'استكشف المزيد' : 'Explorer'}
            </h3>
            <ul className="space-y-4">
              {activePages.map((page: FooterPage) => (
                <li key={page.id}>
                  <Link to={`/p/${page.slug}`} className="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors flex items-center gap-2 group font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500/30 group-hover:bg-primary-500 transition-colors" />
                    {rtl ? page.name_ar : page.name_en}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/contact" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors flex items-center gap-2 group font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500/30 group-hover:bg-primary-500 transition-colors" />
                  {rtl ? 'اتصل بنا' : 'Contact Us'}
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors flex items-center gap-2 group font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500/30 group-hover:bg-primary-500 transition-colors" />
                  {rtl ? 'المفضلة' : 'Wishlist'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-6 lg:col-span-4 md:col-span-2">
            <h3 className="text-lg font-black uppercase tracking-widest text-primary-500">
               {rtl ? 'تواصل معنا' : 'Contact Support'}
            </h3>
            <div className="space-y-5">
               <div className="flex gap-4 group/contact">
                  <div className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 group-hover/contact:text-primary-500 transition-all shrink-0">
                     <Phone size={18} />
                  </div>
                  <div>
                     <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">{rtl ? 'اتصل بنا' : 'Call us'}</p>
                     <p className="font-bold text-sm tracking-tighter text-slate-900 dark:text-white">{contact.phone}</p>
                  </div>
               </div>
               <div className="flex gap-4 group/contact">
                  <div className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 group-hover/contact:text-accent-500 transition-all shrink-0">
                     <Mail size={18} />
                  </div>
                  <div>
                     <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">{rtl ? 'البريد الإلكتروني' : 'Mail us'}</p>
                     <p className="font-bold text-sm break-all text-slate-900 dark:text-white">{contact.email}</p>
                  </div>
               </div>
               <div className="flex gap-4 group/contact">
                  <div className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 group-hover/contact:text-blue-500 transition-all shrink-0">
                     <MapPin size={18} />
                  </div>
                  <div>
                     <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">{rtl ? 'العنوان' : 'Address'}</p>
                     <p className="font-bold text-sm text-slate-900 dark:text-white">{rtl ? contact.addressAr : contact.addressEn}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-y border-slate-200 dark:border-white/5 mb-12 bg-white dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] px-10 shadow-xl shadow-slate-200/50 dark:shadow-none">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-500/10 rounded-full text-primary-500"><Truck size={24} /></div>
              <div>
                 <p className="font-black text-sm uppercase tracking-tighter text-slate-900 dark:text-white">{rtl ? 'شحن سريع' : 'Fast Shipping'}</p>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{rtl ? 'لجميع محافظات مصر' : 'To all governorates'}</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full text-green-500"><ShieldCheck size={24} /></div>
              <div>
                 <p className="font-black text-sm uppercase tracking-tighter text-slate-900 dark:text-white">{rtl ? 'دفع آمن' : 'Secure Payment'}</p>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{rtl ? 'الدفع عند الاستلام' : 'Cash on delivery'}</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-full text-blue-500"><RotateCcw size={24} /></div>
              <div>
                 <p className="font-black text-sm uppercase tracking-tighter text-slate-900 dark:text-white">{rtl ? 'ضمان الجودة' : 'Quality Guarantee'}</p>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{rtl ? 'استرجاع خلال 14 يوم' : '14 days return'}</p>
              </div>
           </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
           <p>© {new Date().getFullYear()} {branding.storeName}. All rights reserved.</p>
           <div className="flex items-center gap-6">
              <Link to="/terms" className="hover:text-primary-500 transition-colors uppercase">{rtl ? 'الشروط والأحكام' : 'Terms'}</Link>
              <Link to="/privacy" className="hover:text-primary-500 transition-colors uppercase">{rtl ? 'سياسة الخصوصية' : 'Privacy'}</Link>
           </div>
           <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-primary-500 animate-pulse" />
              <span>Designed with passion by Packet</span>
           </div>
        </div>
      </div>
    </footer>
  );
}
