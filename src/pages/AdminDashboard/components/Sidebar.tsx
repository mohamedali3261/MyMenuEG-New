import { 
  LayoutDashboard, 
  ShoppingBag, 
  ListOrdered, 
  Users, 
  Settings, 
  Tag, 
  Layout, 
  X,
  LogOut,
  Shield
} from 'lucide-react';
import { useStore } from '../../../store/store';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { rtl, user, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const tabs = [
    { id: 'overview', icon: LayoutDashboard, label: rtl ? 'نظرة عامة' : 'Overview', path: '/admin' },
    { id: 'products', icon: ShoppingBag, label: rtl ? 'المنتجات' : 'Products', path: '/admin/products' },
    { id: 'slides', icon: Layout, label: rtl ? 'السلايدر الرئيسي' : 'Home Slider', path: '/admin/slider' },
    { id: 'categories', icon: Tag, label: rtl ? 'التصنيفات' : 'Categories', path: '/admin/categories' },
    { id: 'coupons', icon: Tag, label: rtl ? 'كوبونات الخصم' : 'Coupons', path: '/admin/coupons' },
    { id: 'orders', icon: ListOrdered, label: rtl ? 'الطلبات' : 'Orders', path: '/admin/orders' },
    { id: 'customers', icon: Users, label: rtl ? 'العملاء' : 'Customers', path: '/admin/customers' },
    { id: 'users', icon: Shield, label: rtl ? 'إدارة المستخدمين' : 'User Management', path: '/admin/users', superAdminOnly: true },
    { id: 'settings', icon: Settings, label: rtl ? 'الإعدادات' : 'Settings', path: '/admin/settings' }
  ];

  const filteredTabs = tabs.filter(tab => {
    if (!user) return false;
    if (user.is_super_admin) return true;
    if (tab.superAdminOnly) return false;
    // Overview is usually allowed for all admins
    if (tab.id === 'overview') return true;
    return user.permissions.includes(tab.id) || user.permissions.includes('all');
  });

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className={`hidden lg:flex w-56 glass-card rounded-none border-y-0 h-screen sticky top-0 p-3 flex-col gap-1.5 ${rtl ? 'border-l border-r-0' : 'border-r border-l-0'} relative overflow-hidden group/sidebar`}>
        {/* Animated Glow Backdrop */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 blur-[80px] rounded-full pointer-events-none group-hover/sidebar:bg-primary-500/20 transition-all duration-700" />
        
        <div className="mb-6 px-3 py-1.5 border-b border-white/5 relative z-10">
           <h2 className="text-lg font-black tracking-tighter text-primary-500 uppercase flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse shadow-[0_0_10px_#10b981]" />
             Packet <span className="text-[9px] bg-primary-500/10 px-1.5 rounded-full lowercase">admin</span>
           </h2>
        </div>
        
        <div className="flex-grow flex flex-col gap-1 overflow-y-auto pr-2 custom-scrollbar">
          {filteredTabs.map((tab) => (
            <SidebarLink key={tab.id} tab={tab} rtl={rtl} currentPath={location.pathname} />
          ))}
        </div>

        {/* User Info & Logout */}
        <div className="mt-auto pt-3 border-t border-white/5 space-y-1.5">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5">
            <div className="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 font-bold text-[10px] ring-1 ring-primary-500/30">
              {user?.username.substring(0, 1).toUpperCase()}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-white text-[11px] font-black truncate">{user?.username}</p>
              <p className="text-slate-500 text-[9px] font-bold">{user?.is_super_admin ? 'مدير عام' : 'مسؤول'}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold group"
          >
            <LogOut size={16} className="group-hover:scale-110 transition-transform" />
            <span className="text-[12px]">{rtl ? 'تسجيل الخروج' : 'Logout'}</span>
          </button>
        </div>
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
            
            <div className="flex-grow flex flex-col gap-1 overflow-y-auto">
              {filteredTabs.map((tab) => (
                <SidebarLink key={tab.id} tab={tab} rtl={rtl} currentPath={location.pathname} />
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-white/5 space-y-2">
              <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-white/5 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 font-bold text-xs ring-1 ring-primary-500/30">
                    {user?.username.substring(0, 1).toUpperCase()}
                </div>
                <div className="flex-grow min-w-0">
                    <p className="text-white text-xs font-bold truncate">{user?.username}</p>
                    <p className="text-slate-500 text-[10px]">{user?.is_super_admin ? 'مدير عام' : 'مسؤول'}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold"
              >
                <LogOut size={18} />
                <span className="text-sm">{rtl ? 'تسجيل الخروج' : 'Logout'}</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarLink({ tab, currentPath, rtl }: { tab: any, rtl: boolean, currentPath: string }) {
  const Icon = tab.icon;
  const isActive = currentPath === tab.path || (tab.path !== '/admin' && currentPath.startsWith(tab.path));
  
  return (
    <Link
      to={tab.path}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all relative overflow-hidden group/link ${
        isActive 
          ? 'bg-primary-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]' 
          : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-primary-500'
      }`}
    >
      {/* Shiny Light Sweep Effect */}
      {isActive && (
        <motion.div
           initial={{ x: '-100%' }}
           animate={{ x: '200%' }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
           className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
        />
      )}
      
      <Icon size={16} className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'group-hover/link:scale-110'}`} />
      <span className="font-bold text-[13px] tracking-tight relative z-10">{tab.label}</span>
      {isActive && (
        <motion.div 
          layoutId="activeTab"
          className={`absolute ${rtl ? 'right-0' : 'left-0'} w-0.5 h-4 bg-white rounded-full shadow-[0_0_10px_#fff]`}
        />
      )}
    </Link>
  );
}
