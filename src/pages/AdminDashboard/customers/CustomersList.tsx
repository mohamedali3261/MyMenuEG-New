import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { Users, Search, Phone, MapPin, ShoppingBag, Loader2 } from 'lucide-react';
import { api } from '../../../api';

interface OrderRow {
  customer_name: string;
  phone: string;
  address: string;
  total_price: number;
  created_at: string;
}

interface CustomerSummary {
  name: string;
  phone: string;
  address: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;
}

export default function CustomersList() {
  const { rtl } = useStore();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // We can use the same orders data but group by phone to get "Customers"
    api.get('/orders')
      .then(res => {
        const orders = res.data as OrderRow[];
        const customerMap: Record<string, CustomerSummary> = {};
        
        orders.forEach((o) => {
          if (!customerMap[o.phone]) {
            customerMap[o.phone] = {
              name: o.customer_name,
              phone: o.phone,
              address: o.address,
              orderCount: 0,
              totalSpent: 0,
              lastOrder: o.created_at
            };
          }
          customerMap[o.phone].orderCount += 1;
          customerMap[o.phone].totalSpent += o.total_price;
        });

        setCustomers(Object.values(customerMap));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c => 
    c.name.includes(search) || c.phone.includes(search)
  );

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
             placeholder={rtl ? "بحث بالاسم أو الهاتف..." : "Search by name or phone..."}
             className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-2 px-10 focus:outline-none focus:border-primary-500 shadow-sm"
           />
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 size={32} className="text-primary-500 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-500">
             <Users size={48} className="mx-auto mb-4 opacity-50" />
             {rtl ? 'لا يوجد عملاء يطابقون البحث.' : 'No customers found matching search.'}
          </div>
        ) : (
          filtered.map((c, i) => (
            <div key={i} className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold text-xl uppercase">
                  {c.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1 group-hover:text-primary-500 transition-colors">{c.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Phone size={14} /> {c.phone}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {c.address}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                <div className="flex-1 bg-slate-100 dark:bg-white/5 rounded-2xl p-4 text-center min-w-[100px]">
                   <div className="text-xs opacity-50 mb-1">{rtl ? 'الطلبات' : 'Orders'}</div>
                   <div className="font-bold text-lg flex items-center justify-center gap-2">
                     <ShoppingBag size={16} />
                     {c.orderCount}
                   </div>
                </div>
                <div className="flex-1 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-2xl p-4 text-center min-w-[120px]">
                   <div className="text-xs opacity-50 mb-1">{rtl ? 'إجمالي المشتريات' : 'Total Spent'}</div>
                   <div className="font-bold text-lg">EGP {c.totalSpent.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
