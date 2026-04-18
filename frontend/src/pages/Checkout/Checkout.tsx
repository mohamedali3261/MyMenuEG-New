import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/store';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, CheckCircle2, MessageCircle, CreditCard, Banknote, Smartphone, Landmark, LayoutList } from 'lucide-react';
import { api } from '../../api';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
  custom_file_url?: string;
  custom_notes?: string;
};

type Coupon = { id: string; type: 'percent' | 'fixed'; value: number };
type OrderSuccess = { orderId: string; total: number; discount: number; items: CartItem[] };
type ApiError = { response?: { data?: { message?: string } } };

export default function Checkout() {
  const { cart, rtl, clearCart, showToast, addTrackedOrder, paymentSettings, branding } = useStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    governorate: '', 
    city: '', 
    address: '', 
    notes: '' 
  });
  
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccess | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'paymob' | 'fawry' | 'wallet'>('cod');
  
  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  useEffect(() => {
    document.title = `${rtl ? 'إتمام الطلب' : 'Checkout'} | ${branding.storeName}`;
    // Redirect if cart is empty
    if (cart.length === 0 && !orderSuccess) {
      navigate('/cart');
    }
  }, [cart.length, orderSuccess, rtl, branding, navigate]);

  // Persistence: Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mymenueg_shipping');
    if (saved) {
      try {
        setForm(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) { console.error("Error loading shipping history", e); }
    }
  }, []);

  const saveToHistory = () => {
    localStorage.setItem('mymenueg_shipping', JSON.stringify({
      name: form.name,
      phone: form.phone,
      governorate: form.governorate,
      city: form.city,
      address: form.address
    }));
  };

  const subTotal = (cart as CartItem[]).reduce((acc, current) => acc + (current.price * current.quantity), 0);
  const tax = 0; 
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
    } catch (err: unknown) {
      const apiError = err as ApiError;
      showToast(apiError.response?.data?.message || (rtl ? 'كود غير صالح' : 'Invalid code'), 'error');
      setCoupon(null);
    } finally {
      setValidatingPromo(false);
    }
  };

  const submitOrder = async () => {
    if (!form.name || !form.phone || !form.address || !form.governorate) {
      showToast(rtl ? 'برجاء ملء البيانات الأساسية (الاسم، الهاتف، المحافظة، العنوان)' : 'Please fill basic details (Name, Phone, Governorate, Address)', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post('/orders', {
        customer: form,
        items: cart,
        total_price: total,
        coupon_id: coupon?.id,
        discount_amount: discount,
        payment_method: paymentMethod
      });
      
      const successData = {
        orderId: res.data.orderId,
        total: total,
        discount: discount,
        items: [...cart]
      };

      if (paymentMethod !== 'cod') {
        saveToHistory();
        addTrackedOrder(res.data.orderId, form.phone);
        clearCart();
        navigate(`/payment/callback?status=success&order_id=${res.data.orderId}&amount=${total}&method=${paymentMethod}`);
        return;
      }
      
      saveToHistory();
      addTrackedOrder(res.data.orderId, form.phone);
      setOrderSuccess(successData);
      clearCart();
      showToast(rtl ? 'تم إرسال طلبك بنجاح!' : 'Order sent successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast(rtl ? 'حدث خطأ أثناء الإرسال' : 'Error sending order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppConfirm = () => {
    if (!orderSuccess) return;
    const phone = "201090480802"; 
    const itemsText = orderSuccess.items.map((it) => `- ${it.name} (x${it.quantity})`).join('%0A');
    const deliveryInfo = `الاسم: ${form.name}%0Aالهاتف: ${form.phone}%0Aالعنوان: ${form.governorate}, ${form.city}, ${form.address}%0Aالملاحظات: ${form.notes || '---'}`;
    const text = `السلام عليكم،%0Aلقد قمت بعمل طلب جديد من الموقع [mymenueg]%0Aرقم الطلب: #${orderSuccess.orderId}%0Aإجمالي المبلغ: EGP ${orderSuccess.total.toFixed(2)}%0Aالأصناف:%0A${itemsText}%0A%0Aبيانات التوصيل:%0A${deliveryInfo}%0Aالرجاء تأكيد الطلب.`;
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  if (cart.length === 0 && !orderSuccess) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 min-h-[80vh]">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/cart" className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors hidden md:block">
          <ArrowRight size={24} className={rtl ? '' : 'rotate-180'} />
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          {rtl ? 'إتمام الطلب' : 'Checkout'}
        </h1>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Main Checkout Form Left */}
        <div className="lg:col-span-3 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 md:p-8"
          >
            <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm">1</span>
              {rtl ? 'بيانات التوصيل' : 'Delivery Details'}
            </h3>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">
                    {rtl ? 'الاسم بالكامل' : 'Full Name'}
                  </label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} type="text" placeholder={rtl ? "مثال: محمد احمد" : "e.g. John Doe"} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-sm focus:border-primary-500 focus:bg-white dark:focus:bg-[#111] transition-all outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">
                    {rtl ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} type="tel" placeholder="01xxxxxxxxx" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-sm focus:border-primary-500 focus:bg-white dark:focus:bg-[#111] transition-all outline-none" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">
                    {rtl ? 'المحافظة' : 'Governorate'}
                  </label>
                  <input value={form.governorate} onChange={e => setForm({...form, governorate: e.target.value})} type="text" placeholder={rtl ? "القاهرة" : "Cairo"} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-sm focus:border-primary-500 focus:bg-white dark:focus:bg-[#111] transition-all outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">
                    {rtl ? 'المدينة / المنطقة' : 'City / Area'}
                  </label>
                  <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} type="text" placeholder={rtl ? "المعادي" : "Maadi"} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-sm focus:border-primary-500 focus:bg-white dark:focus:bg-[#111] transition-all outline-none" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">
                    {rtl ? 'العنوان التفصيلي (شارع/مبنى/شقة)' : 'Detailed Address (Street/Bldg/Apt)'}
                  </label>
                  <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} type="text" placeholder={rtl ? "شارع 9، مبنى 5، شقة 1" : "Street 9, Bldg 5, Apt 1"} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-sm focus:border-primary-500 focus:bg-white dark:focus:bg-[#111] transition-all outline-none" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">
                    {rtl ? 'ملاحظات إضافية' : 'Additional Notes'}
                  </label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} placeholder={rtl ? "مواعيد التواجد أو ملاحظات للمندوب" : "Preferred timing or notes for rider"} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-sm focus:border-primary-500 focus:bg-white dark:focus:bg-[#111] transition-all outline-none"></textarea>
                </div>
              </div>
            </div>
          </motion.div>

          {paymentSettings.onlinePaymentEnabled && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-card p-6 md:p-8"
            >
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm">2</span>
                {rtl ? 'طريقة الدفع' : 'Payment Method'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentSettings.cod && (
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-start ${
                      paymentMethod === 'cod' 
                        ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10 ring-2 ring-primary-500/20' 
                        : 'border-slate-200 dark:border-white/10 hover:border-primary-500/30 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'cod' ? 'border-primary-500' : 'border-slate-300 dark:border-slate-600'}`}>
                      {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm mb-1 flex items-center gap-2">
                        <Banknote size={16} className="text-primary-500" />
                        {rtl ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{rtl ? 'ادفع نقداً عند استلام طلبك بمكانك' : 'Pay in cash when you receive your order'}</p>
                    </div>
                  </button>
                )}
                
                {paymentSettings.paymob && (
                  <button
                    onClick={() => setPaymentMethod('paymob')}
                    className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-start ${
                      paymentMethod === 'paymob' 
                        ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10 ring-2 ring-primary-500/20' 
                        : 'border-slate-200 dark:border-white/10 hover:border-primary-500/30 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'paymob' ? 'border-primary-500' : 'border-slate-300 dark:border-slate-600'}`}>
                      {paymentMethod === 'paymob' && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm mb-1 flex items-center gap-2">
                        <CreditCard size={16} className="text-primary-500" />
                        {rtl ? 'فيزا / ماستركارد' : 'Visa / Mastercard'}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{rtl ? 'دفع آمن ومريح بالبطاقات البنكية' : 'Secure and easy payment using bank cards'}</p>
                    </div>
                  </button>
                )}
                
                {paymentSettings.fawry && (
                  <button
                    onClick={() => setPaymentMethod('fawry')}
                    className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-start ${
                      paymentMethod === 'fawry' 
                        ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10 ring-2 ring-primary-500/20' 
                        : 'border-slate-200 dark:border-white/10 hover:border-primary-500/30 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'fawry' ? 'border-primary-500' : 'border-slate-300 dark:border-slate-600'}`}>
                      {paymentMethod === 'fawry' && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm mb-1 flex items-center gap-2">
                        <Landmark size={16} className="text-primary-500" />
                        {rtl ? 'فوري' : 'Fawry'}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{rtl ? 'الدفع كاش من أقرب ماكينة فوري أمان' : 'Pay cash at your nearest Fawry kiosk'}</p>
                    </div>
                  </button>
                )}

                {paymentSettings.wallet && (
                  <button
                     onClick={() => setPaymentMethod('wallet')}
                     className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-start ${
                       paymentMethod === 'wallet' 
                         ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10 ring-2 ring-primary-500/20' 
                         : 'border-slate-200 dark:border-white/10 hover:border-primary-500/30 hover:bg-slate-50 dark:hover:bg-white/5'
                     }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'wallet' ? 'border-primary-500' : 'border-slate-300 dark:border-slate-600'}`}>
                      {paymentMethod === 'wallet' && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm mb-1 flex items-center gap-2">
                        <Smartphone size={16} className="text-primary-500" />
                        {rtl ? 'المحافظ الإلكترونية' : 'Mobile Wallets'}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{rtl ? 'فودافون كاش، اتصالات، أورانج، وي' : 'Vodafone Cash, Etisalat, Orange, We'}</p>
                    </div>
                  </button>
                )}
              </div>
            </motion.div>
          )}

        </div>

        {/* Order Summary Right (Sidebar) */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 md:p-8 lg:sticky lg:top-28 border-[1.5px] border-primary-500/20 shadow-2xl flex flex-col h-auto lg:h-[calc(100vh-100px)] min-h-[600px]"
          >
            <h3 className="font-bold text-xl mb-6 pb-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-2 shrink-0">
               <LayoutList size={22} className="text-primary-500" />
               {rtl ? 'ملخص الطلبية' : 'Order Summary'}
            </h3>

            {/* Scrollable Cart Items */}
            <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-3 custom-scrollbar min-h-[150px]">
              {(cart as CartItem[]).map((item) => (
                <div key={`${item.id}-${item.variant}`} className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-white/5 overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
                     {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-grow py-1">
                     <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                     {item.variant && <p className="text-xs text-slate-500 mb-1">{item.variant}</p>}
                     <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-400">x{item.quantity}</span>
                        <span className="text-primary-500">{(item.price * item.quantity).toFixed(2)} EGP</span>
                     </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky Totals Bottom */}
            <div className="shrink-0 space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
              {/* Promo Code */}
              <div className="flex gap-2">
                 <input 
                   value={promoInput} 
                   onChange={e => setPromoInput(e.target.value.toUpperCase())}
                   disabled={!!coupon}
                   type="text" 
                   placeholder={rtl ? "هل تملك كود خصم؟" : "Have a promo code?"} 
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
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>{rtl ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">EGP {subTotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-primary-500 font-bold bg-primary-500/10 p-2 rounded-lg border border-primary-500/20">
                    <span>{rtl ? 'الخصم' : 'Discount'}</span>
                    <span>- EGP {discount.toFixed(2)}</span>
                  </div>
                )}
                {/* Free shipping text representation */}
                <div className="flex justify-between text-slate-500">
                  <span>{rtl ? 'التوصيل' : 'Delivery'}</span>
                  <span className="font-bold text-green-500">{rtl ? 'مجاني' : 'Free'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-t border-slate-200 dark:border-white/10">
                <span className="text-lg font-bold">{rtl ? 'الإجمالي النهائي' : 'Final Total'}</span>
                <span className="text-2xl font-extrabold text-gradient">EGP {total.toFixed(2)}</span>
              </div>

              <button 
                onClick={submitOrder}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 h-14 text-lg shadow-xl shadow-primary-500/20"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    {rtl ? 'تأكيد ودفع' : 'Confirm & Pay'}
                    <CheckCircle2 size={24} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
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
                
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 mb-8 border border-slate-200 dark:border-white/10">
                   <div className="flex justify-between text-sm mb-2 opacity-60">
                     <span>{rtl ? 'إجمالي المبلغ' : 'Total Amount'}</span>
                     <span>EGP {orderSuccess.total.toFixed(2)}</span>
                   </div>
                   <div className="font-bold text-lg text-primary-500">{rtl ? 'قيد المراجعة' : 'Processing'}</div>
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
