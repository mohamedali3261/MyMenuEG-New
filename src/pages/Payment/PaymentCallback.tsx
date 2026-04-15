import { motion } from 'framer-motion';
import { useStore } from '../../store/store';
import { CheckCircle2, XCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export default function PaymentCallback() {
  const { rtl, branding } = useStore();
  const [searchParams] = useSearchParams();
  
  const status = searchParams.get('status') || 'success'; // success | failed
  const orderId = searchParams.get('order_id') || '';
  const amount = searchParams.get('amount') || '0';
  const method = searchParams.get('method') || 'card';

  const isSuccess = status === 'success';

  useEffect(() => {
    document.title = `${isSuccess ? (rtl ? 'تم الدفع بنجاح' : 'Payment Successful') : (rtl ? 'فشل الدفع' : 'Payment Failed')} | ${branding.storeName}`;
  }, [isSuccess, rtl, branding]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 relative overflow-hidden">
      {/* Background */}
      <div className={`absolute top-[-10%] right-[-5%] w-[600px] h-[600px] ${isSuccess ? 'bg-green-500/10' : 'bg-red-500/10'} blur-[150px] rounded-full pointer-events-none`} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full mx-6 text-center"
      >
        <div className={`glass-card p-10 border-2 ${isSuccess ? 'border-green-500/30' : 'border-red-500/30'}`}>
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className={`w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
          >
            {isSuccess ? <CheckCircle2 size={56} /> : <XCircle size={56} />}
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl font-black mb-3">
            {isSuccess 
              ? (rtl ? 'تم الدفع بنجاح! 🎉' : 'Payment Successful! 🎉')
              : (rtl ? 'فشل عملية الدفع' : 'Payment Failed')}
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            {isSuccess 
              ? (rtl ? 'شكراً لك! تم استلام الدفع وسيتم تجهيز طلبك فوراً.' : 'Thank you! Payment received and your order is being prepared.')
              : (rtl ? 'لم يتم إتمام عملية الدفع. يمكنك المحاولة مرة أخرى أو اختيار طريقة دفع أخرى.' : 'Payment was not completed. You can try again or choose a different payment method.')}
          </p>

          {/* Details */}
          {isSuccess && orderId && (
            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 mb-8 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{rtl ? 'رقم الطلب' : 'Order ID'}</span>
                <span className="font-bold">#{orderId}</span>
              </div>
              {amount !== '0' && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{rtl ? 'المبلغ المدفوع' : 'Amount Paid'}</span>
                  <span className="font-bold text-green-500">EGP {parseFloat(amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{rtl ? 'طريقة الدفع' : 'Payment Method'}</span>
                <span className="font-bold capitalize">{method}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {isSuccess ? (
              <>
                <Link 
                  to="/track"
                  className="w-full py-4 bg-primary-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-600 transition-all active:scale-95 shadow-xl shadow-primary-500/20"
                >
                  {rtl ? 'تتبع طلبك' : 'Track Your Order'}
                  <ArrowRight size={18} className={rtl ? 'rotate-180' : ''} />
                </Link>
                <Link 
                  to="/products"
                  className="w-full py-4 bg-slate-100 dark:bg-white/5 rounded-xl font-bold flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                >
                  <ShoppingBag size={18} />
                  {rtl ? 'تسوق المزيد' : 'Continue Shopping'}
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/cart"
                  className="w-full py-4 bg-primary-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-600 transition-all active:scale-95 shadow-xl shadow-primary-500/20"
                >
                  {rtl ? 'العودة للسلة' : 'Back to Cart'}
                  <ArrowRight size={18} className={rtl ? 'rotate-180' : ''} />
                </Link>
                <Link 
                  to="/"
                  className="w-full py-3 rounded-xl font-bold text-slate-500 hover:text-primary-500 transition text-sm"
                >
                  {rtl ? 'الصفحة الرئيسية' : 'Go Home'}
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
