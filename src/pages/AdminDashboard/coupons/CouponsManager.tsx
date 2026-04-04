import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { Plus, Trash2, Ticket, Percent, Banknote, Calendar, Loader2, Save, X } from 'lucide-react';
import { api } from '../../../api';
import ConfirmModal from '../components/ConfirmModal';
import PremiumDropdown from '../../../components/ui/PremiumDropdown';

export default function CouponsManager() {
  const { rtl, showToast } = useStore();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal State
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string | null}>({
    isOpen: false,
    id: null
  });

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    code: '',
    type: 'percent',
    value: 0,
    min_order: 0,
    usage_limit: 100,
    status: 'active'
  });

  const typeOptions = [
    { value: 'percent', labelAr: 'نسبة مئوية (%)', labelEn: 'Percentage (%)', icon: <Percent size={14} />, color: 'text-primary-500', bg: 'bg-primary-500/10' },
    { value: 'fixed', labelAr: 'قيمة ثابتة (EGP)', labelEn: 'Fixed Amount (EGP)', icon: <Banknote size={14} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  const fetchCoupons = () => {
    setLoading(true);
    api.get('/coupons')
      .then(res => setCoupons(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/coupons', formData);
      setShowForm(false);
      fetchCoupons();
      showToast(rtl ? 'تم حفظ الكوبون بنجاح' : 'Coupon saved successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast(rtl ? 'قشل حفظ الكوبون' : 'Failed to save coupon', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteCoupon = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/coupons/${deleteModal.id}`);
      fetchCoupons();
      setDeleteModal({ isOpen: false, id: null });
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (coupon: any) => {
    setFormData(coupon);
    setShowForm(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Ticket size={32} className="text-primary-500" />
          {rtl ? 'إدارة كوبونات الخصم' : 'Coupons Management'}
        </h1>
        
        {!showForm && (
          <button 
            onClick={() => {
              setFormData({ id: '', code: '', type: 'percent', value: 0, min_order: 0, usage_limit: 100, status: 'active' });
              setShowForm(true);
            }} 
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            {rtl ? 'إضافة كوبون جديد' : 'Add New Coupon'}
          </button>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSave} className="glass-card p-6 md:p-8 animate-in fade-in slide-in-from-top-4 duration-300">
           <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold">{rtl ? 'بيانات الكوبون' : 'Coupon Details'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
           </div>

           <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block mb-2 font-medium">{rtl ? 'كود الكوبون (مثال: SAVE10)' : 'Coupon Code (e.g. SAVE10)'}</label>
                <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} type="text" className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none" />
              </div>
               <div>
                 <label className="block mb-2 font-medium">{rtl ? 'نوع الخصم' : 'Discount Type'}</label>
                 <PremiumDropdown 
                   value={formData.type}
                   options={typeOptions}
                   rtl={rtl}
                   onChange={(v) => setFormData({...formData, type: v})}
                 />
               </div>
           </div>

           <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block mb-2 font-medium">{rtl ? 'قيمة الخصم' : 'Discount Value'}</label>
                <div className="relative">
                  <input required value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} type="number" className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl p-3 pl-12" />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {formData.type === 'percent' ? <Percent size={18} /> : <Banknote size={18} />}
                  </div>
                </div>
              </div>
              <div>
                <label className="block mb-2 font-medium">{rtl ? 'الحد الأدنى للطلب (EGP)' : 'Min Order (EGP)'}</label>
                <input required value={formData.min_order} onChange={e => setFormData({...formData, min_order: Number(e.target.value)})} type="number" className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl p-3" />
              </div>
              <div>
                <label className="block mb-2 font-medium">{rtl ? 'أقصى عدد استخدام' : 'Usage Limit'}</label>
                <input required value={formData.usage_limit} onChange={e => setFormData({...formData, usage_limit: Number(e.target.value)})} type="number" className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl p-3" />
              </div>
           </div>

           <div className="flex flex-col md:flex-row gap-4 justify-end border-t border-white/10 pt-6">
              <button type="button" onClick={() => setShowForm(false)} className="px-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition font-bold">{rtl ? 'إلغاء' : 'Cancel'}</button>
              <button type="submit" disabled={saving} className="btn-primary px-12 py-3 flex items-center gap-2">
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {rtl ? 'حفظ الكوبون' : 'Save Coupon'}
              </button>
           </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-48 glass-card animate-pulse"></div>)
          ) : coupons.length === 0 ? (
            <div className="col-span-full py-20 text-center glass-card">
              <Ticket size={48} className="mx-auto mb-4 text-slate-500 opacity-20" />
              <p className="text-slate-400 font-bold">{rtl ? 'لا توجد كوبونات حالياً.' : 'No coupons found.'}</p>
            </div>
          ) : (
            coupons.map(coupon => (
              <div key={coupon.id} className="glass-card p-6 flex flex-col justify-between group overflow-hidden relative">
                <div className={`absolute top-0 right-0 w-1 h-full ${coupon.status === 'active' ? 'bg-primary-500' : 'bg-red-500'}`}></div>
                <div>
                   <div className="flex justify-between items-start mb-4">
                      <div className="bg-primary-500/10 px-3 py-1 rounded-full border border-primary-500/20">
                         <span className="text-primary-500 font-black tracking-widest">{coupon.code}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(coupon)} className="p-2 text-slate-400 hover:text-primary-500 transition-colors"><Calendar size={18} /></button>
                        <button onClick={() => setDeleteModal({ isOpen: true, id: coupon.id })} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      </div>
                   </div>
                   
                   <div className="space-y-2 mt-4 text-slate-300">
                      <div className="flex justify-between text-sm">
                         <span>{rtl ? 'قيمة الخصم:' : 'Discount:'}</span>
                         <span className="font-bold text-white">{coupon.value}{coupon.type === 'percent' ? '%' : ' EGP'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                         <span>{rtl ? 'الحد الأدنى:' : 'Min Order:'}</span>
                         <span className="font-bold text-white">{coupon.min_order} EGP</span>
                      </div>
                      <div className="flex justify-between text-sm">
                         <span>{rtl ? 'الاستخدام:' : 'Usage:'}</span>
                         <span className="font-bold text-white">{coupon.used_count} / {coupon.usage_limit}</span>
                      </div>
                   </div>
                </div>

                <div className="mt-6 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                    <span>{coupon.status}</span>
                    <span>ID: {coupon.id.substr(0,8)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={deleteCoupon}
        title={rtl ? 'تأكيد حذف الكوبون' : 'Confirm Coupon Deletion'}
        message={rtl 
          ? 'هل أنت متأكد؟ لن يتمكن العملاء من استخدام هذا الكود مرة أخرى بعد حذفه.' 
          : 'Are you sure? Customers will no longer be able to use this code after deletion.'}
        rtl={rtl}
      />
    </div>
  )
}
