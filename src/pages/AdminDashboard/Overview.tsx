import { useState, useEffect } from 'react';
import { useStore } from '../../store/store';
import { motion } from 'framer-motion';
import { CircleDollarSign, Package, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { api } from '../../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function Overview() {
  const { rtl } = useStore();
  const [data, setData] = useState<any>({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    salesChart: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats')
      .then(res => {
        setData(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: rtl ? 'إجمالي المبيعات' : 'Total Sales', val: loading ? '...' : `EGP ${data.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <CircleDollarSign size={100} />, color: 'text-primary-500' },
    { label: rtl ? 'الطلبات' : 'Orders', val: loading ? '...' : data.totalOrders, icon: <Package size={100} />, color: 'text-accent-500' },
    { label: rtl ? 'المنتجات' : 'Products', val: loading ? '...' : data.totalProducts, icon: <ShoppingBag size={100} />, color: 'text-blue-500' },
    { label: rtl ? 'العملاء' : 'Customers', val: loading ? '...' : data.totalCustomers, icon: <Users size={100} />, color: 'text-purple-500' }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        {rtl ? 'نظرة عامة على لوحة التحكم' : 'Dashboard Overview'}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="glass-card p-6 flex flex-col gap-2 relative overflow-hidden"
          >
            <div className={`absolute -right-4 -bottom-4 opacity-10 ${stat.color}`}>
              {stat.icon}
            </div>
            <span className="text-slate-500 dark:text-slate-400 font-medium z-10">{stat.label}</span>
            <span className="text-3xl font-extrabold z-10">{stat.val}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Sales Area Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 h-96 flex flex-col"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold flex items-center gap-2">
                   <TrendingUp className="text-primary-500" size={20} />
                   {rtl ? 'نمو المبيعات (آخر 7 أيام)' : 'Sales Growth (Last 7 Days)'}
                </h3>
            </div>
            <div className="flex-grow w-full h-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.salesChart}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="sales" stroke="var(--primary-500)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
        </motion.div>

        {/* Orders Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 h-96 flex flex-col"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold flex items-center gap-2">
                   <Package className="text-accent-500" size={20} />
                   {rtl ? 'عدد الطلبات اليومية' : 'Daily Orders Count'}
                </h3>
            </div>
            <div className="flex-grow w-full h-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.salesChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                    />
                    <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                       {data.salesChart.map((_: any, index: number) => (
                         <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary-500)' : '#f59e0b'} />
                       ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
        </motion.div>
      </div>
    </div>
  )
}
