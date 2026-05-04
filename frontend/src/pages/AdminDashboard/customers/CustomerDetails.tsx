import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../../store/store';
import { api } from '../../../api';
import toast from 'react-hot-toast';
import {
  ArrowRight, ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingBag, Heart, ShoppingCart,
  Loader2, Package, Clock, Truck, CheckCircle2, XCircle, Image, Send, Bell
} from 'lucide-react';

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: string;
  status: string;
  total_price: number;
  discount_amount: number;
  created_at: string;
  order_items: OrderItem[];
}

interface WishlistItem {
  product_id: string;
  product_name: string;
  product_image: string;
  added_at: string;
}

interface CartItem {
  product_id: string;
  product_name: string;
  product_image: string;
  product_price: number;
  quantity: number;
  variant: string;
  is_bundle: boolean;
}

interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface CustomerDetailsData {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  governorate: string | null;
  city: string | null;
  address: string | null;
  avatar: string | null;
  google_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  orderCount: number;
  totalSpent: number;
  orders: Order[];
  wishlists: WishlistItem[];
  cart_items: CartItem[];
  notifications: NotificationRecord[];
}

const statusConfig: Record<string, { label: string; labelAr: string; icon: any; color: string }> = {
  pending: { label: 'Pending', labelAr: 'قيد الانتظار', icon: Clock, color: 'text-yellow-500 bg-yellow-500/10' },
  processing: { label: 'Processing', labelAr: 'جاري التجهيز', icon: Package, color: 'text-blue-500 bg-blue-500/10' },
  shipped: { label: 'Shipped', labelAr: 'تم الشحن', icon: Truck, color: 'text-purple-500 bg-purple-500/10' },
  delivered: { label: 'Delivered', labelAr: 'تم التسليم', icon: CheckCircle2, color: 'text-primary-500 bg-primary-500/10' },
  cancelled: { label: 'Cancelled', labelAr: 'ملغي', icon: XCircle, color: 'text-red-500 bg-red-500/10' },
};

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { rtl } = useStore();
  const [customer, setCustomer] = useState<CustomerDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingActive, setTogglingActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'cart' | 'notifications'>('orders');
  const [showNotify, setShowNotify] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/customers/${id}`)
      .then(res => setCustomer(res.data))
      .catch(() => toast.error(rtl ? 'فشل تحميل بيانات العميل' : 'Failed to load customer'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleActive = async () => {
    if (!customer) return;
    setTogglingActive(true);
    try {
      await api.patch(`/customers/${customer.id}`, { is_active: !customer.is_active });
      setCustomer({ ...customer, is_active: !customer.is_active });
      toast.success(customer.is_active ? (rtl ? 'تم تعطيل الحساب' : 'Account disabled') : (rtl ? 'تم تفعيل الحساب' : 'Account enabled'));
    } catch {
      toast.error(rtl ? 'فشل التحديث' : 'Update failed');
    } finally {
      setTogglingActive(false);
    }
  };

  const sendNotify = async () => {
    if (!customer || !notifyTitle.trim() || !notifyMessage.trim()) return;
    setSending(true);
    try {
      await api.post(`/customers/${customer.id}/notify`, { title: notifyTitle.trim(), message: notifyMessage.trim() });
      toast.success(rtl ? 'تم إرسال الإشعار' : 'Notification sent');
      setNotifyTitle('');
      setNotifyMessage('');
      setShowNotify(false);
    } catch {
      toast.error(rtl ? 'فشل إرسال الإشعار' : 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 size={32} className="text-primary-500 animate-spin" /></div>;
  }

  if (!customer) {
    return <div className="glass-card p-12 text-center text-slate-500">{rtl ? 'العميل غير موجود' : 'Customer not found'}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
          {rtl ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
        </button>
        <h1 className="text-2xl font-bold">{rtl ? 'تفاصيل العميل' : 'Customer Details'}</h1>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex items-center gap-4 flex-1">
            {customer.avatar ? (
              <img src={customer.avatar} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-white/10" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold text-3xl uppercase">
                {(customer.name || customer.email)[0]}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {customer.name || (rtl ? 'بدون اسم' : 'No name')}
                {!customer.is_active && (
                  <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">{rtl ? 'معطل' : 'Disabled'}</span>
                )}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-2">
                <span className="flex items-center gap-1"><Mail size={14} /> {customer.email}</span>
                {customer.phone && <span className="flex items-center gap-1"><Phone size={14} /> {customer.phone}</span>}
                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(customer.created_at).toLocaleDateString()}</span>
                {customer.google_id && <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full text-xs">Google</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="bg-slate-100 dark:bg-white/5 rounded-2xl p-3 text-center min-w-[90px]">
              <div className="text-xs opacity-50 mb-1">{rtl ? 'الطلبات' : 'Orders'}</div>
              <div className="font-bold text-lg">{customer.orderCount}</div>
            </div>
            <div className="bg-slate-100 dark:bg-white/5 rounded-2xl p-3 text-center min-w-[90px]">
              <div className="text-xs opacity-50 mb-1">{rtl ? 'إجمالي المشتريات' : 'Total Spent'}</div>
              <div className="font-bold text-lg">EGP {customer.totalSpent.toFixed(0)}</div>
            </div>

            <button
              onClick={toggleActive}
              disabled={togglingActive}
              className={`relative w-11 h-6 rounded-full transition-all duration-300 ease-out ${customer.is_active ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30' : 'bg-slate-300 dark:bg-slate-600'}`}
              title={customer.is_active ? (rtl ? 'تعطيل' : 'Disable') : (rtl ? 'تفعيل' : 'Enable')}
            >
              {togglingActive ? <Loader2 size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-slate-400" /> : (
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ease-out flex items-center justify-center ${customer.is_active ? 'translate-x-5 shadow-primary-500/20' : 'translate-x-0'}`}>
                  {customer.is_active && <span className="text-primary-500 text-[10px] font-bold">✓</span>}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowNotify(!showNotify)}
              className={`p-3 rounded-xl transition-all ${showNotify ? 'bg-primary-500 text-white' : 'bg-primary-500/10 text-primary-500 hover:bg-primary-500/20'}`}
              title={rtl ? 'إرسال إشعار' : 'Send Notification'}
            >
              <Bell size={18} />
            </button>
          </div>
        </div>

        {/* Delivery Info */}
        {(customer.governorate || customer.city || customer.address) && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
            <h3 className="text-sm font-semibold opacity-60 mb-2 flex items-center gap-1"><MapPin size={14} /> {rtl ? 'بيانات التوصيل' : 'Delivery Info'}</h3>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {[customer.governorate, customer.city, customer.address].filter(Boolean).join(', ')}
            </div>
          </div>
        )}

        {/* Send Notification Form */}
        {showNotify && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
            <h3 className="text-sm font-semibold opacity-60 mb-3 flex items-center gap-1"><Send size={14} /> {rtl ? 'إرسال إشعار' : 'Send Notification'}</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={notifyTitle}
                onChange={e => setNotifyTitle(e.target.value)}
                placeholder={rtl ? 'عنوان الإشعار' : 'Notification title'}
                className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-primary-500"
              />
              <textarea
                value={notifyMessage}
                onChange={e => setNotifyMessage(e.target.value)}
                placeholder={rtl ? 'نص الرسالة' : 'Message body'}
                rows={3}
                className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-primary-500 resize-none"
              />
              <button
                onClick={sendNotify}
                disabled={sending || !notifyTitle.trim() || !notifyMessage.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {rtl ? 'إرسال' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-white/10 pb-0">
        {[
          { key: 'orders' as const, label: rtl ? 'الطلبات' : 'Orders', icon: ShoppingBag, count: customer.orders.length },
          { key: 'wishlist' as const, label: rtl ? 'المفضلة' : 'Wishlist', icon: Heart, count: customer.wishlists.length },
          { key: 'cart' as const, label: rtl ? 'السلة' : 'Cart', icon: ShoppingCart, count: customer.cart_items.length },
          { key: 'notifications' as const, label: rtl ? 'الإشعارات' : 'Notifications', icon: Bell, count: customer.notifications.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.key
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full text-xs">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {customer.orders.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-500">
              <ShoppingBag size={40} className="mx-auto mb-3 opacity-40" />
              {rtl ? 'لا توجد طلبات' : 'No orders yet'}
            </div>
          ) : customer.orders.map(order => {
            const sc = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = sc.icon;
            return (
              <div key={order.id} className="glass-card p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
                  <div>
                    <span className="font-mono font-bold text-lg">#{order.id}</span>
                    <span className="text-xs text-slate-500 mx-2">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${sc.color}`}>
                      <StatusIcon size={12} />
                      {rtl ? sc.labelAr : sc.label}
                    </span>
                    <span className="font-bold">EGP {(order.total_price || 0).toFixed(2)}</span>
                    {order.discount_amount > 0 && (
                      <span className="text-xs text-primary-500">-{order.discount_amount.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  {order.order_items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span>EGP {item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {customer.wishlists.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-500 col-span-full">
              <Heart size={40} className="mx-auto mb-3 opacity-40" />
              {rtl ? 'لا توجد منتجات مفضلة' : 'No wishlist items'}
            </div>
          ) : customer.wishlists.map(item => (
            <div key={item.product_id} className="glass-card p-4 flex items-center gap-3">
              {item.product_image ? (
                <img src={item.product_image} alt="" className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-white/5 flex items-center justify-center"><Image size={16} className="opacity-30" /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.product_name}</div>
                <div className="text-xs text-slate-500">{new Date(item.added_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'cart' && (
        <div className="space-y-3">
          {customer.cart_items.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-500">
              <ShoppingCart size={40} className="mx-auto mb-3 opacity-40" />
              {rtl ? 'السلة فاضية' : 'Cart is empty'}
            </div>
          ) : customer.cart_items.map((item, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-4">
              {item.product_image ? (
                <img src={item.product_image} alt="" className="w-14 h-14 rounded-lg object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-slate-200 dark:bg-white/5 flex items-center justify-center"><Image size={18} className="opacity-30" /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.product_name}</div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>× {item.quantity}</span>
                  {item.variant && <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-xs">{item.variant}</span>}
                  {item.is_bundle && <span className="bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded text-xs">Bundle</span>}
                </div>
              </div>
              <div className="font-bold">EGP {(item.product_price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {customer.notifications.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-500">
              <Bell size={40} className="mx-auto mb-3 opacity-40" />
              {rtl ? 'لا توجد إشعارات' : 'No notifications'}
            </div>
          ) : customer.notifications.map(n => (
            <div key={n.id} className={`glass-card p-4 ${!n.is_read ? 'border-primary-500/20 bg-primary-500/5' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{n.title}</h4>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary-500" />}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{n.message}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(n.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
