import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { api } from '../../../api';
import { Package, User, Phone, MapPin, Clock, Download, Ticket, Truck, CheckCircle, Ban, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import PremiumDropdown from '../../../components/ui/PremiumDropdown';

export default function OrdersList() {
  const { rtl } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus });
      fetchOrders(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  const generatePDF = (order: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text('INVOICE / فاتورة شراء', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.id}`, 20, 40);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, 50);

    // Customer
    doc.setFontSize(14);
    doc.text('Customer Details:', 20, 70);
    doc.setFontSize(10);
    doc.text(`Name: ${order.customer_name}`, 20, 80);
    doc.text(`Phone: ${order.phone}`, 20, 85);
    doc.text(`Address: ${order.address}`, 20, 90);

    // Table Header
    doc.line(20, 105, 190, 105);
    doc.text('Product', 20, 112);
    doc.text('Qty', 130, 112);
    doc.text('Price', 150, 112);
    doc.text('Total', 170, 112);
    doc.line(20, 115, 190, 115);

    // Items
    let y = 122;
    order.items.forEach((item: any) => {
      doc.text(item.product_name.substring(0, 40), 20, y);
      doc.text(item.quantity.toString(), 135, y);
      doc.text(item.price.toFixed(2), 150, y);
      doc.text(item.subtotal.toFixed(2), 170, y);
      y += 8;
    });

    // Totals
    doc.line(20, y, 190, y);
    y += 10;
    doc.text('Subtotal:', 140, y);
    doc.text((order.total_price + (order.discount_amount || 0)).toFixed(2) + ' EGP', 170, y);
    
    if (order.discount_amount) {
        y += 8;
        doc.text('Discount:', 140, y);
        doc.text('-' + order.discount_amount.toFixed(2) + ' EGP', 170, y);
    }
    
    y += 10;
    doc.setFontSize(16);
    doc.text('Final Total:', 120, y);
    doc.text(order.total_price.toFixed(2) + ' EGP', 170, y);

    doc.save(`Invoice-${order.id}.pdf`);
  };


  const statusOptions = [
    { value: 'pending', labelAr: 'قيد المراجعة', labelEn: 'Pending', icon: <Clock size={14} />, color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
    { value: 'processing', labelAr: 'قيد التجهيز', labelEn: 'Processing', icon: <Loader2 size={14} className="animate-spin" />, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { value: 'shipped', labelAr: 'تم الشحن', labelEn: 'Shipped', icon: <Truck size={14} />, color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { value: 'delivered', labelAr: 'تم التسليم', labelEn: 'Delivered', icon: <CheckCircle size={14} />, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { value: 'cancelled', labelAr: 'ملغي', labelEn: 'Cancelled', icon: <Ban size={14} />, color: 'text-rose-600', bg: 'bg-rose-500/10' },
  ];

  if (loading) return <div className="p-8 text-center"><span className="text-slate-400 animate-pulse">{rtl ? 'جاري التحميل...' : 'Loading...'}</span></div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Package className="text-primary-500" size={32} />
          {rtl ? 'إدارة الطلبات' : 'Order Management'}
        </h1>
        <span className="text-slate-500 font-medium">
          {rtl ? `إجمالي الطلبات: ${orders.length}` : `Total Orders: ${orders.length}`}
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {orders.map((order, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={order.id} 
            className="glass-card p-6 flex flex-col md:flex-row gap-6 relative"
          >
            {/* Header / ID */}
            <div className="md:w-1/4 border-b md:border-b-0 md:border-e border-slate-200 dark:border-white/10 pb-4 md:pb-0 md:pe-6 flex flex-col justify-center">
              <span className="text-xs text-slate-400 mb-1">{rtl ? 'رقم الطلب' : 'Order ID'}</span>
              <span className="font-mono font-bold text-lg mb-2">{order.id}</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={12} /> {new Date(order.created_at).toLocaleString()}
              </span>
            </div>

            {/* Customer Details */}
            <div className="md:w-1/3 flex flex-col justify-center gap-2">
              <div className="flex items-center gap-2 text-sm font-medium"><User size={16} className="text-primary-500" /> {order.customer_name}</div>
              <div className="flex items-center gap-2 text-sm text-slate-500"><Phone size={16} className="text-accent-500" /> {order.phone}</div>
              <div className="flex items-center gap-2 text-sm text-slate-500"><MapPin size={16} className="text-blue-500" /> {order.address}</div>
              {order.notes && <div className="text-xs text-slate-400 mt-2 p-2 bg-slate-100 dark:bg-[#111] rounded"><span className="font-bold">ملاحظة:</span> {order.notes}</div>}
            </div>

            {/* Items */}
            <div className="md:w-1/4 flex flex-col justify-center gap-2">
              <span className="text-xs text-slate-400 font-bold mb-1">{rtl ? 'المنتجات المطلوبة' : 'Requested Items'}</span>
              <div className="max-h-24 overflow-y-auto space-y-1 pr-2">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="text-sm font-medium flex justify-between bg-slate-50 dark:bg-white/5 p-1 px-2 rounded">
                    <span className="truncate w-3/4">{item.product_name}</span>
                    <span className="text-primary-500">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price & Actions */}
            <div className="md:flex-1 flex flex-col items-end gap-4 justify-center md:ps-6 md:border-s border-slate-200 dark:border-white/10">
              <div className="text-center md:text-end w-full">
                <span className="text-xs text-slate-400 block mb-1">{rtl ? 'الإجمالي النهائي' : 'Final Total'}</span>
                <span className="text-2xl font-extrabold text-primary-500">EGP {order.total_price?.toFixed(2)}</span>
                {order.discount_amount > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold justify-end mt-1">
                    <Ticket size={10} />
                    <span>{rtl ? `خصم: ${order.discount_amount} جنيه` : `Saved: ${order.discount_amount} EGP`}</span>
                  </div>
                )}
              </div>
              
              <div className="w-full flex gap-3">
                <PremiumDropdown 
                  value={order.status}
                  options={statusOptions}
                  rtl={rtl}
                  onChange={(v) => updateStatus(order.id, v)}
                  className="flex-grow"
                />
                
                <button 
                  onClick={() => generatePDF(order)}
                  className="p-2 bg-slate-100 dark:bg-white/10 rounded-xl hover:bg-primary-500 hover:text-white transition-all text-slate-400"
                  title={rtl ? 'تحميل الفاتورة' : 'Download Invoice'}
                >
                   <Download size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {orders.length === 0 && (
          <div className="text-center p-16 text-slate-400">
             <Package className="mx-auto mb-4 opacity-50" size={64} />
             <p className="text-xl">{rtl ? 'لا توجد طلبات حتى الآن.' : 'No orders received yet.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
