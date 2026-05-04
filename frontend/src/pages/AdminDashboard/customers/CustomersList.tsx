import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../store/store';
import { Users, Search, Phone, ShoppingBag, Loader2, Mail, Trash2, Calendar, Eye, UserPlus, TrendingUp, Send, X } from 'lucide-react';
import { api } from '../../../api';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  google_id: string | null;
  is_active: boolean;
  created_at: string;
  orderCount: number;
}

export default function CustomersList() {
  const { rtl } = useStore();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [newThisMonth, setNewThisMonth] = useState(0);
  const [topCustomer, setTopCustomer] = useState<Customer | null>(null);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  const fetchCustomers = (q = '') => {
    setLoading(true);
    api.get('/customers', { params: { search: q || undefined, limit: 100 } })
      .then(res => {
        const list = res.data.customers || [];
        setCustomers(list);
        setTotalCustomers(res.data.total || list.length);
        // New this month
        const monthStart = new Date();
        monthStart.setDate(1); monthStart.setHours(0,0,0,0);
        setNewThisMonth(list.filter((c: Customer) => new Date(c.created_at) >= monthStart).length);
        // Top customer by orders
        const top = [...list].sort((a, b) => b.orderCount - a.orderCount)[0];
        setTopCustomer(top && top.orderCount > 0 ? top : null);
      })
      .catch(() => toast.error(rtl ? 'فشل تحميل العملاء' : 'Failed to load customers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleActive = async (c: Customer) => {
    setUpdating(c.id);
    try {
      await api.patch(`/customers/${c.id}`, { is_active: !c.is_active });
      setCustomers(prev => prev.map(x => x.id === c.id ? { ...x, is_active: !x.is_active } : x));
      toast.success(c.is_active ? (rtl ? 'تم تعطيل الحساب' : 'Account disabled') : (rtl ? 'تم تفعيل الحساب' : 'Account enabled'));
    } catch {
      toast.error(rtl ? 'فشل التحديث' : 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const deleteCustomer = async (c: Customer) => {
    if (!confirm(rtl ? `هل أنت متأكد من حذف ${c.name || c.email}؟` : `Delete ${c.name || c.email}?`)) return;
    setUpdating(c.id);
    try {
      await api.delete(`/customers/${c.id}`);
      setCustomers(prev => prev.filter(x => x.id !== c.id));
      toast.success(rtl ? 'تم حذف العميل' : 'Customer deleted');
    } catch {
      toast.error(rtl ? 'فشل الحذف' : 'Delete failed');
    } finally {
      setUpdating(null);
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setBroadcasting(true);
    try {
      const res = await api.post('/customers/broadcast', { title: broadcastTitle.trim(), message: broadcastMessage.trim() });
      toast.success(rtl ? `تم إرسال الإشعار لـ ${res.data.sent} عميل` : `Notification sent to ${res.data.sent} customers`);
      setBroadcastTitle('');
      setBroadcastMessage('');
      setShowBroadcast(false);
    } catch {
      toast.error(rtl ? 'فشل إرسال الإشعار' : 'Failed to broadcast');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users size={32} className="text-primary-500" />
          {rtl ? 'إدارة العملاء' : 'Customers Management'}
        </h1>

        <div className="relative w-full md:w-64">
          <Search size={18} className="absolute top-3 right-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={rtl ? "بحث بالاسم أو الإيميل..." : "Search by name or email..."}
            className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-2 px-10 focus:outline-none focus:border-primary-500 shadow-sm"
          />
        </div>

        <button
          onClick={() => setShowBroadcast(!showBroadcast)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${showBroadcast ? 'bg-primary-500 text-white' : 'bg-primary-500/10 text-primary-500 hover:bg-primary-500/20'}`}
        >
          <Send size={16} />
          {rtl ? 'إرسال للكل' : 'Broadcast'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-500"><Users size={24} /></div>
          <div>
            <div className="text-sm opacity-60">{rtl ? 'إجمالي العملاء' : 'Total Customers'}</div>
            <div className="text-2xl font-bold">{totalCustomers}</div>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-500"><UserPlus size={24} /></div>
          <div>
            <div className="text-sm opacity-60">{rtl ? 'جدد هذا الشهر' : 'New This Month'}</div>
            <div className="text-2xl font-bold">{newThisMonth}</div>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4 cursor-pointer" onClick={() => topCustomer && navigate(`/admin/customers/${topCustomer.id}`)}>
          <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-500"><TrendingUp size={24} /></div>
          <div>
            <div className="text-sm opacity-60">{rtl ? 'أكتر عميل طلبات' : 'Top Customer'}</div>
            <div className="text-lg font-bold">{topCustomer ? (topCustomer.name || topCustomer.email) : (rtl ? '—' : 'None')}</div>
            {topCustomer && <div className="text-xs text-slate-500">{topCustomer.orderCount} {rtl ? 'طلب' : 'orders'}</div>}
          </div>
        </div>
      </div>

      {/* Broadcast Form */}
      {showBroadcast && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><Send size={18} className="text-primary-500" /> {rtl ? 'إرسال إشعار لكل العملاء' : 'Broadcast to All Customers'}</h3>
            <button onClick={() => setShowBroadcast(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400"><X size={18} /></button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={broadcastTitle}
              onChange={e => setBroadcastTitle(e.target.value)}
              placeholder={rtl ? 'عنوان الإشعار' : 'Notification title'}
              className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-primary-500"
            />
            <textarea
              value={broadcastMessage}
              onChange={e => setBroadcastMessage(e.target.value)}
              placeholder={rtl ? 'نص الرسالة' : 'Message body'}
              rows={3}
              className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-primary-500 resize-none"
            />
            <button
              onClick={sendBroadcast}
              disabled={broadcasting || !broadcastTitle.trim() || !broadcastMessage.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50"
            >
              {broadcasting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {rtl ? 'إرسال للكل' : 'Send to All'}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 size={32} className="text-primary-500 animate-spin" /></div>
        ) : customers.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-500">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            {rtl ? 'لا يوجد عملاء.' : 'No customers found.'}
          </div>
        ) : (
          customers.map(c => (
            <div key={c.id} className={`glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group ${!c.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-4">
                {c.avatar ? (
                  <img src={c.avatar} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white/10" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold text-xl uppercase">
                    {(c.name || c.email)[0]}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary-500 transition-colors">
                    {c.name || '—'}
                    {!c.is_active && (
                      <span className="mr-2 text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
                        {rtl ? 'معطل' : 'Disabled'}
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Mail size={14} /> {c.email}</span>
                    {c.phone && <span className="flex items-center gap-1"><Phone size={14} /> {c.phone}</span>}
                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => navigate(`/admin/customers/${c.id}`)}
                  className="p-3 rounded-xl bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-all"
                  title={rtl ? 'عرض التفاصيل' : 'View Details'}
                >
                  <Eye size={18} />
                </button>

                <div className="bg-slate-100 dark:bg-white/5 rounded-2xl p-3 text-center min-w-[80px]">
                  <div className="text-xs opacity-50 mb-1">{rtl ? 'الطلبات' : 'Orders'}</div>
                  <div className="font-bold text-lg flex items-center justify-center gap-1">
                    <ShoppingBag size={14} />
                    {c.orderCount}
                  </div>
                </div>

                <button
                  onClick={() => toggleActive(c)}
                  disabled={updating === c.id}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 ease-out ${c.is_active ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30' : 'bg-slate-300 dark:bg-slate-600'}`}
                  title={c.is_active ? (rtl ? 'تعطيل الحساب' : 'Disable Account') : (rtl ? 'تفعيل الحساب' : 'Enable Account')}
                >
                  {updating === c.id ? <Loader2 size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-slate-400" /> : (
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ease-out flex items-center justify-center ${c.is_active ? 'translate-x-5 shadow-primary-500/20' : 'translate-x-0'}`}>
                      {c.is_active && <span className="text-primary-500 text-[10px] font-bold">✓</span>}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => deleteCustomer(c)}
                  disabled={updating === c.id}
                  className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                  title={rtl ? 'حذف العميل' : 'Delete Customer'}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
