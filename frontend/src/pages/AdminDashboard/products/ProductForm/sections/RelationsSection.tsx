import { Plus, Trash2, Tag, Loader2 } from 'lucide-react';
import { resolveAssetUrl } from '../../../../../utils/assetUrl';
import type { ProductFaq } from '../types';

interface Props {
  rtl: boolean;
  faqs: ProductFaq[];
  addFaq: () => void;
  updateFaq: (index: number, key: keyof ProductFaq, val: any) => void;
  removeFaq: (index: number) => void;
  fbtSearch: string;
  setFbtSearch: (val: string) => void;
  fbtResults: any[];
  searchingFbt: boolean;
  handleFbtSearch: () => void;
  fbtProductDetails: any[];
  addFbt: (prod: any) => void;
  removeFbt: (prodId: string) => void;
}

export function RelationsSection({ 
  rtl, faqs, addFaq, updateFaq, removeFaq,
  fbtSearch, setFbtSearch, fbtResults, searchingFbt, handleFbtSearch, fbtProductDetails, addFbt, removeFbt
}: Props) {
  return (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <div>
            <h2 className="text-xl font-black">{rtl ? 'الأسئلة الشائعة (FAQ)' : 'Customer FAQ'}</h2>
            <p className="text-xs text-slate-500">{rtl ? 'أجب على استفسارات العملاء مسبقاً' : 'Pre-emptively answer common queries'}</p>
          </div>
          <button onClick={addFaq} className="btn-primary py-3 px-6 text-xs flex items-center gap-2 rounded-2xl">
            <Plus size={16} /> {rtl ? 'إضافة سؤال' : 'Add FAQ'}
          </button>
        </div>
        
        <div className="space-y-6">
          {faqs.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl opacity-50 font-black uppercase text-xs tracking-widest">{rtl ? 'لا توجد أسئلة مضافة' : 'No FAQs yet'}</div>
          )}
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/5 relative group">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{rtl ? 'السؤال (عربي)' : 'Question (Ar)'}</label>
                  <input value={faq.question_ar} onChange={e => updateFaq(i, 'question_ar', e.target.value)} className="w-full bg-black/20 p-3 rounded-xl outline-none focus:border-primary-500/50 text-xs font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{rtl ? 'Question (En)' : 'Question (En)'}</label>
                  <input value={faq.question_en} onChange={e => updateFaq(i, 'question_en', e.target.value)} dir="ltr" className="w-full bg-black/20 p-3 rounded-xl outline-none focus:border-primary-500/50 text-xs font-bold font-mono" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{rtl ? 'الإجابة (عربي)' : 'Answer (Ar)'}</label>
                  <textarea value={faq.answer_ar} onChange={e => updateFaq(i, 'answer_ar', e.target.value)} rows={2} className="w-full bg-black/20 p-3 rounded-xl outline-none focus:border-primary-500/50 text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{rtl ? 'Answer (En)' : 'Answer (En)'}</label>
                  <textarea value={faq.answer_en} onChange={e => updateFaq(i, 'answer_en', e.target.value)} dir="ltr" rows={2} className="w-full bg-black/20 p-3 rounded-xl outline-none focus:border-primary-500/50 text-xs font-mono" />
                </div>
              </div>
              <button onClick={() => removeFaq(i)} className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xl"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-8">
        <h2 className="text-xl font-black mb-8 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
          {rtl ? 'يُشترى معاً عادةً (FBT)' : 'Frequently Bought Together'}
        </h2>
        
        <div className="relative mb-8">
          <div className="flex gap-4">
            <div className="relative flex-grow">
              <input 
                value={fbtSearch}
                onChange={e => setFbtSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleFbtSearch())}
                placeholder={rtl ? 'ابحث عن منتجات لربطها...' : 'Search master inventory to link...'}
                className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-2xl outline-none border border-transparent focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold"
              />
              <div className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400"><Tag size={20} /></div>
            </div>
            <button 
              onClick={handleFbtSearch}
              disabled={searchingFbt}
              className="btn-primary px-8 flex items-center gap-2 rounded-2xl shadow-xl shadow-primary-500/20"
            >
              {searchingFbt ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
              {rtl ? 'بحث' : 'Query'}
            </button>
          </div>
          
          {fbtResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-top-4 duration-300">
              {fbtResults.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => addFbt(p)}
                  className="flex items-center gap-4 p-4 hover:bg-primary-500/10 cursor-pointer border-b border-white/5 last:border-0 group"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/20 border border-white/5 group-hover:scale-105 transition-transform">
                    {p.image_url && <img src={resolveAssetUrl(p.image_url)} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-black tracking-tight">{rtl ? p.name_ar : p.name_en}</p>
                    <p className="text-[10px] font-black uppercase text-primary-500">{p.price} EGP</p>
                  </div>
                  <Plus size={20} className="text-primary-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fbtProductDetails.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center border-2 border-dashed border-white/5 rounded-[2rem] opacity-30">
               <Tag size={40} className="mb-4" />
               <p className="text-xs font-black uppercase tracking-widest">{rtl ? 'لا توجد منتجات مرتبطة' : 'No cross-sell links yet'}</p>
            </div>
          )}
          {fbtProductDetails.map(p => (
            <div key={p.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 relative group animate-in zoom-in duration-300">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black/40 shrink-0 border border-white/5">
                {p.image_url && <img src={resolveAssetUrl(p.image_url)} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-xs font-black truncate">{rtl ? p.name_ar : p.name_en}</p>
                <p className="text-[10px] font-black text-slate-500">{p.price} EGP</p>
              </div>
              <button 
                onClick={() => removeFbt(p.id)}
                className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform hover:rotate-12"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
