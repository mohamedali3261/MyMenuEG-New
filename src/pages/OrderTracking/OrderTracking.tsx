import { useState } from 'react';
import { useStore } from '../../store/store';
import { api } from '../../api';
import { Search, Package, CheckCircle2, Clock, Truck, ShieldAlert, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrderTracking() {
  const { rtl } = useStore();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await api.get(`/orders/track/${orderId.trim()}`);
      setOrder(res.data);
    } catch (err: any) {
      setError(rtl ? 'عذراً، لم نجد طلباً بهذا الرقم.' : 'Sorry, we couldn\'t find an order with this ID.');
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { id: 'pending', label: rtl ? 'تم استلام الطلب' : 'Order Received', icon: Clock },
    { id: 'processing', label: rtl ? 'جاري التجهيز' : 'Processing', icon: Package },
    { id: 'shipped', label: rtl ? 'تم الشحن' : 'Shipped', icon: Truck },
    { id: 'delivered', label: rtl ? 'تم التسليم' : 'Delivered', icon: CheckCircle2 },
  ];

  const getActiveStep = (status: string) => {
    if (status === 'cancelled') return -1;
    const index = statusSteps.findIndex(s => s.id === status);
    return index === -1 ? 0 : index;
  };

  const activeStep = order ? getActiveStep(order.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 min-h-[70vh]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4">{rtl ? 'تتبع طلبك' : 'Track Your Order'}</h1>
        <p className="text-slate-500 font-medium">
          {rtl ? 'أدخل رقم الطلب الذي استلمته في رسالة التأكيد لمتابعة حالته.' : 'Enter the Order ID you received in your confirmation to follow its status.'}
        </p>
      </div>

      <form onSubmit={handleTrack} className="glass-card p-4 md:p-6 mb-12 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            type="text" 
            placeholder={rtl ? 'أدخل رقم الطلب (مثال: ORD-XXXX)' : 'Enter Order ID (e.g. ORD-XXXX)'}
            className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-mono"
            dir="ltr"
          />
        </div>
        <button disabled={loading} className="btn-primary px-10 py-4 flex items-center justify-center gap-2 text-lg">
          {loading ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={22} />}
          {rtl ? 'تتبع الآن' : 'Track Now'}
        </button>
      </form>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 flex items-center gap-3">
            <ShieldAlert size={20} />
            <span className="font-bold">{error}</span>
          </motion.div>
        )}

        {order && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card overflow-hidden">
             <div className="bg-primary-500 p-6 text-white flex justify-between items-center">
                <div>
                   <span className="text-sm opacity-80 block mb-1">{rtl ? 'حالة الطلب الحالي' : 'Current Order Status'}</span>
                   <h2 className="text-2xl font-bold">{order.id}</h2>
                </div>
                <div className="text-right">
                   <span className="text-sm opacity-80 block mb-1">{rtl ? 'إجمالي الطلب' : 'Order Total'}</span>
                   <h2 className="text-2xl font-black">EGP {order.total_price.toFixed(2)}</h2>
                </div>
             </div>

             <div className="p-8">
                {order.status === 'cancelled' ? (
                  <div className="text-center py-10 bg-red-500/5 rounded-3xl border border-red-500/10">
                     <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
                     <h3 className="text-2xl font-bold text-red-500 mb-2">{rtl ? 'تم إلغاء الطلب' : 'Order Cancelled'}</h3>
                     <p className="text-slate-500">{rtl ? 'عذراً، هذا الطلب ملغي. يرجى التواصل مع الدعم للمزيد من التفاصيل.' : 'Sorry, this order is cancelled. Please contact support for more details.'}</p>
                  </div>
                ) : (
                  <div className="relative flex flex-col gap-10">
                    {/* Line Background */}
                    <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-white/10 md:left-auto md:right-auto md:top-[23px] md:bottom-auto md:left-6 md:right-6 md:h-0.5"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      {statusSteps.map((step, index) => {
                         const isPassed = index <= activeStep;
                         const isCurrent = index === activeStep;
                         const Icon = step.icon;
                         
                         return (
                           <div key={step.id} className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:text-center">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${isPassed ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
                                 <Icon size={24} />
                              </div>
                              <div className="flex flex-col">
                                <span className={`font-bold transition-colors ${isPassed ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`}>
                                  {step.label}
                                </span>
                                {isCurrent && (
                                  <span className="text-[10px] uppercase tracking-widest text-primary-500 font-black animate-pulse">
                                    {rtl ? 'الآن' : 'Current'}
                                  </span>
                                )}
                              </div>
                           </div>
                         )
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center text-sm text-slate-500">
                  <span>{rtl ? 'تاريخ الطلب:' : 'Order Date:'} {new Date(order.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1 text-primary-500 font-bold">
                    {rtl ? 'تحتاج مساعدة؟ تواصل معنا' : 'Need help? Contact us'}
                    <ChevronRight size={16} className={rtl ? 'rotate-180' : ''} />
                  </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
