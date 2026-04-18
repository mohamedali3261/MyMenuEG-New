import { useStore } from '../../../store/store';
import { ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function CartSummary() {
  const { cart, rtl } = useStore();
  const navigate = useNavigate();

  const subTotal = cart.reduce((acc, current) => acc + (current.price * current.quantity), 0);
  const tax = 0; 
  const total = subTotal + tax;

  return (
    <div className="glass-card p-6 sticky top-28 border-[1.5px] border-primary-500/20 shadow-xl">
      <h2 className="text-xl font-bold mb-6 border-b border-slate-200 dark:border-white/10 pb-4 flex items-center gap-2">
        <ShoppingBag className="text-primary-500" size={24} />
        {rtl ? 'ملخص السلة' : 'Cart Summary'}
      </h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
          <span>{rtl ? 'المجموع الفرعي' : 'Subtotal'}</span>
          <span className="font-semibold text-slate-900 dark:text-white">EGP {subTotal.toFixed(2)}</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex justify-between items-center py-4 border-t border-slate-200 dark:border-white/10 mb-6">
          <span className="text-lg font-bold">{rtl ? 'الإجمالي التقديري' : 'Estimated Total'}</span>
          <span className="text-2xl font-extrabold text-gradient">EGP {total.toFixed(2)}</span>
        </div>
        
        <p className="text-xs text-slate-400 text-center mb-6">
          {rtl ? 'الضرائب التوصيل والخصومات تحسب في الخطوة القادمة' : 'Taxes, delivery, and discounts are calculated at checkout'}
        </p>

        <button 
          onClick={() => navigate('/checkout')}
          className="btn-accent w-full flex items-center justify-center gap-2 mb-4 h-14 text-lg shadow-xl shadow-primary-500/20 hover:-translate-y-1 transition-transform"
        >
          {rtl ? 'إتمام الطلب' : 'Proceed to Checkout'}
          <ArrowRight size={20} className={rtl ? 'rotate-180' : ''} />
        </button>

        <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-6 bg-slate-100 dark:bg-[#111] py-3 rounded-xl border border-slate-200 dark:border-white/5">
          <ShieldCheck size={18} className="text-primary-500" />
          <span>{rtl ? 'الدفع الآمن متوفر' : 'Secure Checkout Available'}</span>
        </div>
      </motion.div>
    </div>
  );
}
