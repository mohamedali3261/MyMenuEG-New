import { useState, useEffect } from 'react';
import { useStore } from '../../store/store';
import { api } from '../../api';
import { Package, Clock, Truck, CheckCircle, Ban, ChevronDown, ChevronUp, MapPin, Phone, ShoppingBag, Pencil, X, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface OrderRecord {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  governorate?: string;
  city?: string;
  address?: string;
  total_price: number;
  discount_amount?: number;
  status: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending: { label: 'قيد المراجعة', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  processing: { label: 'جاري التجهيز', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  shipped: { label: 'تم الشحن', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  delivered: { label: 'تم التسليم', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  cancelled: { label: 'ملغي', icon: Ban, color: 'text-red-500', bg: 'bg-red-500/10' },
};

export default function MyOrders() {
  const { customer, customerToken, rtl, setCustomer } = useStore();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    governorate: customer?.governorate || '',
    city: customer?.city || '',
    address: customer?.address || '',
  });

  useEffect(() => {
    if (customer) {
      setDeliveryForm({
        name: customer.name || '',
        phone: customer.phone || '',
        governorate: customer.governorate || '',
        city: customer.city || '',
        address: customer.address || '',
      });
    }
  }, [customer]);

  useEffect(() => {
    if (!customer || !customerToken) {
      setLoading(false);
      return;
    }
    api.get('/orders/my-orders').then(res => {
      setOrders(res.data.orders || []);
    }).catch(err => {
      console.error('Failed to fetch orders', err);
    }).finally(() => setLoading(false));
  }, [customer, customerToken]);

  const saveDelivery = async () => {
    setSavingDelivery(true);
    try {
      const res = await api.patch('/customers/me/delivery', deliveryForm);
      if (res.data.success) {
        setCustomer(res.data.customer, customerToken);
        setShowDeliveryForm(false);
        toast.success(rtl ? 'تم حفظ بيانات التوصيل' : 'Delivery data saved');
      }
    } catch {
      toast.error(rtl ? 'فشل حفظ البيانات' : 'Failed to save');
    } finally {
      setSavingDelivery(false);
    }
  };

  if (!customer) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <ShoppingBag className="text-slate-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold mb-2">{rtl ? 'سجل دخولك أولاً' : 'Sign in first'}</h2>
        <p className="text-slate-400 mb-6 text-center">{rtl ? 'يجب تسجيل الدخول لعرض طلباتك' : 'You must sign in to view your orders'}</p>
        <Link to="/login" className="btn-primary px-8 py-3 rounded-xl font-bold">
          {rtl ? 'تسجيل الدخول' : 'Sign In'}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-[70vh]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Package className="text-primary-500" size={32} />
          {rtl ? 'طلباتي' : 'My Orders'}
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-medium">
            {rtl ? `${orders.length} طلب` : `${orders.length} orders`}
          </span>
          <button
            onClick={() => setShowDeliveryForm(!showDeliveryForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500/10 text-primary-500 font-bold text-sm hover:bg-primary-500/20 transition-all"
          >
            <MapPin size={16} />
            {rtl ? 'بيانات التوصيل' : 'Delivery Info'}
          </button>
        </div>
      </div>

      {/* Delivery Data Form */}
      <AnimatePresence>
        {showDeliveryForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <MapPin size={20} className="text-primary-500" />
                  {rtl ? 'بيانات التوصيل' : 'Delivery Details'}
                </h3>
                <button onClick={() => setShowDeliveryForm(false)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400">
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    {rtl ? 'الاسم بالكامل' : 'Full Name'}
                  </label>
                  <input value={deliveryForm.name} onChange={e => setDeliveryForm({...deliveryForm, name: e.target.value})} type="text" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary-500 outline-none transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    {rtl ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <input value={deliveryForm.phone} onChange={e => setDeliveryForm({...deliveryForm, phone: e.target.value})} type="tel" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    {rtl ? 'المحافظة' : 'Governorate'}
                  </label>
                  <input value={deliveryForm.governorate} onChange={e => setDeliveryForm({...deliveryForm, governorate: e.target.value})} type="text" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    {rtl ? 'المدينة / المنطقة' : 'City / Area'}
                  </label>
                  <input value={deliveryForm.city} onChange={e => setDeliveryForm({...deliveryForm, city: e.target.value})} type="text" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary-500 outline-none transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    {rtl ? 'العنوان التفصيلي' : 'Detailed Address'}
                  </label>
                  <input value={deliveryForm.address} onChange={e => setDeliveryForm({...deliveryForm, address: e.target.value})} type="text" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary-500 outline-none transition-all" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowDeliveryForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 transition-all">
                  {rtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={saveDelivery} disabled={savingDelivery} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary-500 text-white hover:bg-primary-600 transition-all flex items-center gap-2 disabled:opacity-50">
                  {savingDelivery ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {rtl ? 'حفظ' : 'Save'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="mx-auto mb-4 text-slate-600" size={64} />
          <p className="text-xl text-slate-400">{rtl ? 'لا توجد طلبات حتى الآن' : 'No orders yet'}</p>
          <Link to="/" className="inline-block mt-4 btn-primary px-6 py-2 rounded-xl text-sm font-bold">
            {rtl ? 'تسوق الآن' : 'Shop Now'}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <motion.div
                key={order.id}
                layout
                className="glass-card overflow-hidden"
              >
                <div
                  className="p-5 cursor-pointer flex items-center gap-4"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${status.bg}`}>
                    <StatusIcon size={22} className={status.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-sm truncate">{order.id}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      <span className="font-bold text-primary-500 text-sm">EGP {order.total_price?.toFixed(2)}</span>
                    </div>
                  </div>

                  {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                        <div className="flex flex-col gap-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Phone size={14} />
                            <span>{order.phone}</span>
                          </div>
                          <div className="flex items-start gap-2 text-slate-400">
                            <MapPin size={14} className="mt-0.5 shrink-0" />
                            <span>{[order.governorate, order.city, order.address].filter(Boolean).join(' - ')}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{rtl ? 'المنتجات' : 'Items'}</span>
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                              <div>
                                <span className="font-bold text-sm">{item.product_name}</span>
                                <span className="text-xs text-slate-500 block">EGP {item.price?.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="bg-primary-500/10 text-primary-500 font-bold px-2.5 py-0.5 rounded-lg text-xs">x{item.quantity}</span>
                                <span className="font-bold text-sm">EGP {item.subtotal?.toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {(order.discount_amount ?? 0) > 0 && (
                          <div className="text-xs text-emerald-500 font-bold text-left">
                            خصم: -EGP {order.discount_amount?.toFixed(2)}
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                          <span className="text-slate-400 text-sm">{rtl ? 'الإجمالي' : 'Total'}</span>
                          <span className="text-xl font-black text-primary-500">EGP {order.total_price?.toFixed(2)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
