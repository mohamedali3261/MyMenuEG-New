import { LayoutDashboard, ShoppingBag, ListOrdered, Users, Settings, Tag, Layout, X } from 'lucide-react';
import { useStore } from '../../../store/store';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { rtl } = useStore();
  const location = useLocation();

  const tabs = [
    { id: 'overview', icon: LayoutDashboard, label: rtl ? 'نظرة عامة' : 'Overview', path: '/admin' },
    { id: 'products', icon: ShoppingBag, label: rtl ? 'المنتجات' : 'Products', path: '/admin/products' },
    { id: 'slider', icon: Layout, label: rtl ? 'السلايدر الرئيسي' : 'Home Slider', path: '/admin/slider' },
    { id: 'categories', icon: Tag, label: rtl ? 'التصنيفات' : 'Categories', path: '/admin/categories' },
    { id: 'coupons', icon: Tag, label: rtl ? 'كوبونات الخصم' : 'Coupons', path: '/admin/coupons' },
    { id: 'orders', icon: ListOrdered, label: rtl ? 'الطلبات' : 'Orders', path: '/admin/orders' },
    { id: 'customers', icon: Users, label: rtl ? 'العملاء' : 'Customers', path: '/admin/customers' },
    { id: 'settings', icon: Settings, label: rtl ? 'الإعدادات' : 'Settings', path: '/admin/settings' }
  ];

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className={`hidden lg:flex w-64 glass-card rounded-none border-y-0 h-screen sticky top-0 p-4 flex-col gap-2 ${rtl ? 'border-l border-r-0' : 'border-r border-l-0'}`}>
        <div className="mb-8 px-4">
           <h2 className="text-xl font-black tracking-tighter text-primary-500 uppercase">Packet <span className="text-[10px] bg-primary-500/10 px-2 rounded-full lowercase">admin</span></h2>
        </div>
        {tabs.map((tab) => (
          <SidebarLink key={tab.id} tab={tab} rtl={rtl} currentPath={location.pathname} />
        ))}
      </aside>

      {/* Mobile Drawer (Absolute) */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside 
            initial={{ [rtl ? 'right' : 'left']: '-100%' }}
            animate={{ [rtl ? 'right' : 'left']: 0 }}
            exit={{ [rtl ? 'right' : 'left']: '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`lg:hidden fixed top-0 bottom-0 w-64 z-[110] glass-card rounded-none border-y-0 p-4 flex flex-col gap-2 shadow-2xl h-screen ${rtl ? 'right-0 border-l border-r-0' : 'left-0 border-r border-l-0'}`}
          >
            <div className="flex justify-between items-center mb-8 px-4">
             <h2 className="text-xl font-black tracking-tighter text-primary-500 uppercase">Packet</h2>
             <button onClick={onClose} className={`p-2 text-slate-400 ${rtl ? '-ml-2' : '-mr-2'}`}><X size={20} /></button>
          </div>
            
            {tabs.map((tab) => (
              <SidebarLink key={tab.id} tab={tab} rtl={rtl} currentPath={location.pathname} />
            ))}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarLink({ tab, currentPath }: { tab: any, rtl: boolean, currentPath: string }) {
  const Icon = tab.icon;
  const isActive = currentPath === tab.path || (tab.path !== '/admin' && currentPath.startsWith(tab.path));
  
  return (
    <Link
      to={tab.path}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive 
          ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' 
          : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-primary-500'
      }`}
    >
      <Icon size={18} className="shrink-0" />
      <span className="font-bold text-sm tracking-tight">{tab.label}</span>
    </Link>
  );
}
