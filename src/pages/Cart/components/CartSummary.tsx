import { useStore } from '../../../store/store';
import { ArrowRight, ShieldCheck, Loader2, CheckCircle2, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../../../api';

export default function CartSummary() {
  const { cart, rtl, clearCart, showToast } = useStore();
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' });
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  
  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [coupon, setCoupon] = useState<any>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  const subTotal = cart.reduce((acc: number, current: any) => acc + (current.price * current.quantity), 0);
  const tax = subTotal * 0.14; 
  
  let discount = 0;
  if (coupon) {
    if (coupon.type === 'percent') {
      discount = subTotal * (coupon.value / 100);
    } else {
      discount = coupon.value;
    }
  }

  const total = Math.max(0, subTotal + tax - discount);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setValidatingPromo(true);
    try {
      const res = await api.post('/coupons/validate', { code: promoInput.toUpperCase(), total: subTotal });
      setCoupon(res.data);
      showToast(rtl ? 'تم تطبيق الخصم بنجاح!' : 'Coupon applied successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || (rtl ? 'كود غير صالح' : 'Invalid code'), 'error');
      setCoupon(null);
    } finally {
      setValidatingPromo(false);
    }
  };


  const submitOrder = async () => {
    if (!form.name || !form.phone || !form.address) {
      showToast(rtl ? 'برجاء ملء البيانات الأساسية (الاسم، الهاتف، العنوان)' : 'Please fill basic details', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post('/orders', {
        customer: form,
        items: cart,
        total_price: total,
        coupon_id: coupon?.id,
        discount_amount: discount
      });
      
      const successData = {
        orderId: res.data.orderId,
        total: total,
        discount: discount,
        items: [...cart]
      };

      
      setOrderSuccess(successData);
      clearCart();
      showToast(rtl ? 'تم إرسال طلبك بنجاح!' : 'Order sent successfully!', 'success');
      setForm({ name: '', phone: '', address: '', notes: '' });
    } catch (err) {
      console.error(err);
      showToast(rtl ? 'حدث خطأ أثناء الإرسال' : 'Error sending order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppConfirm = () => {
    if (!orderSuccess) return;
    const phone = "201090480802"; // User's WhatsApp number (example)
    const itemsText = orderSuccess.items.map((it: any) => `- ${it.name} (x${it.quantity})`).join('%0A');
    const text = `السلام عليكم،%0Aلقد قمت بعمل طلب جديد من الموقع [mymenueg]%0Aرقم الطلب: #${orderSuccess.orderId}%0Aإجمالي المبلغ: EGP ${orderSuccess.total.toFixed(2)}%0Aالأصناف:%0A${itemsText}%0Aالرجاء تأكيد الطلب.`;
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="glass-card p-6 sticky top-28 border-[1.5px] border-primary-500/20">
      <h2 className="text-xl font-bold mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
        {rtl ? 'ملخص الطلب' : 'Order Summary'}
      </h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
          <span>{rtl ? 'المجموع الفرعي' : 'Subtotal'}</span>
          <span className="font-semibold">EGP {subTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
          <span>{rtl ? 'الضريبة (14%)' : 'Tax (14%)'}</span>
          <span className="font-semibold">EGP {tax.toFixed(2)}</span>
        </div>

        <div className="pt-2">
           <div className="flex gap-2">
              <input 
                value={promoInput} 
                onChange={e => setPromoInput(e.target.value.toUpperCase())}
                disabled={!!coupon}
                type="text" 
                placeholder={rtl ? "كود الخصم" : "Promo Code"} 
                className="flex-grow bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-primary-500 outline-none uppercase font-bold tracking-widest disabled:opacity-50" 
              />
              {coupon ? (
                <button onClick={() => { setCoupon(null); setPromoInput(''); }} className="bg-red-500/10 text-red-500 px-4 py-3 rounded-xl border border-red-500/20 active:scale-95 transition text-sm font-bold">
                   {rtl ? 'إزالة' : 'Remove'}
                </button>
              ) : (
                <button onClick={handleApplyPromo} disabled={validatingPromo} className="bg-primary-500 text-white px-4 py-3 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-md shadow-primary-500/20 disabled:opacity-50">
                   {validatingPromo ? <Loader2 className="animate-spin" size={18} /> : (rtl ? 'تطبيق' : 'Apply')}
                </button>
              )}
           </div>
           {coupon && (
             <p className="text-[10px] text-primary-500 font-bold mt-2 animate-bounce">
                ✨ {rtl ? `تم تطبيق خصم ${coupon.type === 'percent' ? coupon.value + '%' : coupon.value + ' EGP'}` : `Discount of ${coupon.type === 'percent' ? coupon.value + '%' : coupon.value + ' EGP'} applied`}
             </p>
           )}
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center text-primary-500 font-bold bg-primary-500/10 p-3 rounded-xl border border-primary-500/20">
            <span>{rtl ? 'الخصم المطبق' : 'Applied Discount'}</span>
            <span>- EGP {discount.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center py-4 border-t border-slate-200 dark:border-white/10 mb-6">
        <span className="text-lg font-bold">{rtl ? 'الإجمالي النهائي' : 'Final Total'}</span>
        <span className="text-2xl font-extrabold text-gradient">EGP {total.toFixed(2)}</span>
      </div>

      <div className="border-t border-slate-200 dark:border-white/10 pt-6 mb-6">
        <h3 className="font-bold mb-4">{rtl ? 'بيانات التوصيل' : 'Delivery Details'}</h3>
        <div className="space-y-3">
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} type="text" placeholder={rtl ? "الاسم كامل" : "Full Name"} className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary-500" />
          <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} type="tel" placeholder={rtl ? "رقم الهاتف" : "Phone Number"} className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary-500" />
          <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} type="text" placeholder={rtl ? "العنوان التفصيلي" : "Detailed Address"} className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary-500" />
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} placeholder={rtl ? "ملاحظات إضافية (اختياري)" : "Notes (Optional)"} className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary-500"></textarea>
        </div>
      </div>

      <button 
        onClick={submitOrder}
        disabled={loading}
        className="btn-accent w-full flex items-center justify-center gap-2 mb-4 h-12"
      >
        {loading ? <Loader2 className="animate-spin" /> : (
          <>
            {rtl ? 'إرسال الطلب' : 'Submit Order'}
            <ArrowRight size={20} className={rtl ? 'rotate-180' : ''} />
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-6 bg-slate-100 dark:bg-[#111] py-3 rounded-lg">
        <ShieldCheck size={18} className="text-primary-500" />
        <span>{rtl ? 'الدفع عند التوصيل متاح' : 'Cash on Delivery Available'}</span>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {orderSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
               onClick={() => setOrderSuccess(null)}
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="glass-card relative max-w-md w-full p-8 text-center shadow-2xl border-2 border-primary-500/30"
             >
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-bold mb-2">{rtl ? 'شكراً لطلبك!' : 'Thank You!'}</h2>
                <p className="text-slate-500 mb-6">{rtl ? `لقد استلمنا طلبك رقم #${orderSuccess.orderId}` : `We've received your order #${orderSuccess.orderId}`}</p>
                
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 mb-8">
                   <div className="flex justify-between text-sm mb-2 opacity-60">
                     <span>{rtl ? 'إجمالي المبلغ' : 'Total Amount'}</span>
                     <span>EGP {orderSuccess.total.toFixed(2)}</span>
                   </div>
                   <div className="font-bold text-lg">{rtl ? 'قيد المراجعة' : 'Processing'}</div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleWhatsAppConfirm}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20"
                  >
                    <MessageCircle size={20} />
                    {rtl ? 'تأكيد عبر واتساب' : 'Confirm via WhatsApp'}
                  </button>
                  <Link 
                    to={`/track`}
                    className="w-full py-4 rounded-xl font-bold bg-slate-100 dark:bg-white/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    {rtl ? 'تتبع طلبك الآن' : 'Track Your Order Now'}
                    <ArrowRight size={18} className={rtl ? 'rotate-180' : ''} />
                  </Link>
                  <button 
                    onClick={() => setOrderSuccess(null)}
                    className="w-full py-2 rounded-xl font-bold text-slate-500 hover:text-red-500 transition text-sm"
                  >
                    {rtl ? 'إغلاق' : 'Close'}
                  </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
