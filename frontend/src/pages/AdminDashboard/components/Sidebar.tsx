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
  Shield,
  Database,
  Megaphone,
  MessageSquare,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useStore } from '../../../store/store';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ADMIN_TABS } from './adminTabs';
import { useMemo, useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface SidebarTab {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  path: string;
  superAdminOnly?: boolean;
}

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { rtl, user, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    overview: LayoutDashboard,
    products: ShoppingBag,
    slides: Layout,
    categories: Tag,
    coupons: Tag,
    orders: ListOrdered,
    customers: Users,
    users: Shield,
    database: Database,
    pages: Layout,
    offers: Megaphone,
    contact: MessageSquare,
    payment: CreditCard,
    settings: Settings
  };

  const tabs: SidebarTab[] = ADMIN_TABS.map((tab) => ({
    id: tab.id,
    path: tab.path,
    superAdminOnly: tab.superAdminOnly,
    label: rtl ? tab.labelAr : tab.labelEn,
    icon: iconMap[tab.id] || Layout
  }));

  const filteredTabs = tabs.filter(tab => {
    if (!user) return false;
    if (user.is_super_admin) return true;
    if (tab.superAdminOnly) return false;
    // Overview is usually allowed for all admins
    if (tab.id === 'overview') return true;
    if (tab.id === 'contact' && user.permissions.includes('settings')) return true;
    if (tab.id === 'payment' && user.permissions.includes('settings')) return true;
    return user.permissions.includes(tab.id) || user.permissions.includes('all');
  });

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchedTabs = useMemo(() => {
    if (!normalizedSearch) return filteredTabs;
    return filteredTabs.filter((tab) => tab.label.toLowerCase().includes(normalizedSearch));
  }, [filteredTabs, normalizedSearch]);

  const groupedTabs = useMemo(() => {
    const groups = [
      {
        id: 'store',
        titleAr: 'المتجر',
        titleEn: 'Store',
        tabIds: ['overview', 'products', 'categories', 'slides', 'pages'],
      },
      {
        id: 'sales',
        titleAr: 'المبيعات',
        titleEn: 'Sales',
        tabIds: ['orders', 'customers', 'coupons'],
      },
      {
        id: 'marketing',
        titleAr: 'التسويق',
        titleEn: 'Marketing',
        tabIds: ['offers', 'contact'],
      },
      {
        id: 'system',
        titleAr: 'النظام',
        titleEn: 'System',
        tabIds: ['payment', 'settings', 'users', 'database'],
      },
    ];

    return groups
      .map((group) => ({
        ...group,
        title: rtl ? group.titleAr : group.titleEn,
        tabs: searchedTabs.filter((tab) => group.tabIds.includes(tab.id)),
      }))
      .filter((group) => group.tabs.length > 0);
  }, [rtl, searchedTabs]);

  return (
    <>
      {/* Desktop Sidebar (Floating & Animated) */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isCollapsed ? 100 : 320,
          transition: { type: 'spring', damping: 24, stiffness: 200 }
        }}
        className={`hidden lg:flex flex-col gap-2 rounded-[2.5rem] my-4 ml-4 h-[calc(100vh-8rem)] sticky top-28 p-4 relative overflow-hidden group/sidebar bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50`}
      >
        {/* Animated Gloss Effect */}
        <div className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] bg-gradient-to-br from-primary-500/5 via-transparent to-primary-500/5 rotate-12 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-[60px] rounded-full pointer-events-none group-hover/sidebar:bg-primary-500/10 transition-all duration-700" />
        
        <div className={`mb-6 py-2 border-b border-slate-200/50 dark:border-white/5 relative z-10 ${isCollapsed ? 'px-0' : 'px-2'}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                <h2 className="text-lg font-black tracking-tighter text-slate-800 dark:text-white uppercase">
                  {rtl ? 'لوحة التحكم' : 'Control'}
                </h2>
              </motion.div>
            )}
            <button
              onClick={onToggleCollapse}
              className="h-10 w-10 rounded-2xl bg-slate-100/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-white hover:bg-primary-500 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-primary-500/20"
            >
              <div className="transition-transform duration-500 group-hover:rotate-180">
                {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </div>
            </button>
          </div>
        </div>
        
        <div className={`flex-grow flex flex-col gap-4 overflow-y-auto no-scrollbar relative z-10 ${isCollapsed ? '' : 'px-1'}`}>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mb-2"
            >
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                placeholder={rtl ? 'البحث...' : 'Jump to...'}
                className="w-full h-11 rounded-2xl bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 px-4 text-[13px] font-bold outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
              />
            </motion.div>
          )}

          {groupedTabs.map((group, idx) => (
            <div key={group.id} className="space-y-2">
              {!isCollapsed && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 0.1 * idx }}
                  className="px-3 text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 dark:text-slate-400 mb-1"
                >
                  {group.title}
                </motion.p>
              )}
              <div className="flex flex-col gap-1">
                {group.tabs.map((tab) => (
                  <SidebarLink key={tab.id} tab={tab} rtl={rtl} currentPath={location.pathname} isCollapsed={isCollapsed} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Improved Footer Section */}
        <div className="mt-auto pt-4 border-t border-slate-200/50 dark:border-white/5 relative z-10">
          <motion.div 
            whileHover={{ y: -2 }}
            className={`flex items-center p-3 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 ${isCollapsed ? 'justify-center' : 'gap-3 shadow-sm'}`}
          >
            <div className="w-10 h-10 rounded-2xl bg-primary-500 shadow-lg shadow-primary-500/20 flex items-center justify-center text-white font-black text-sm ring-2 ring-white/10 shrink-0">
              {user?.username.substring(0, 1).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-grow min-w-0">
                <p className="text-slate-900 dark:text-white text-sm font-black truncate leading-tight">{user?.username}</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider">{user?.is_super_admin ? (rtl ? 'مدير' : 'S-Admin') : (rtl ? 'مسؤول' : 'Staff')}</p>
                </div>
              </div>
            )}
          </motion.div>
          
          <button 
            onClick={handleLogout}
            className={`w-full mt-2 flex items-center py-3 rounded-2xl text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/5 transition-all font-black group ${isCollapsed ? 'justify-center' : 'gap-3 px-4'}`}
          >
            <LogOut size={18} className="group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300" />
            {!isCollapsed && <span className="text-xs uppercase tracking-widest">{rtl ? 'الخروج' : 'Logout'}</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Drawer (Absolute) */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside 
            initial={{ [rtl ? 'right' : 'left']: '-100%' }}
            animate={{ [rtl ? 'right' : 'left']: 0 }}
            exit={{ [rtl ? 'right' : 'left']: '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`lg:hidden fixed top-24 bottom-0 w-80 z-[110] glass-card rounded-none border-y-0 p-4 flex flex-col gap-2 shadow-2xl h-[calc(100vh-6rem)] bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 ${rtl ? 'right-0 border-l border-r-0' : 'left-0 border-r border-l-0'}`}
          >
            <div className="flex justify-between items-center mb-8 px-4">
               <div>
                 <h2 className="text-2xl font-black tracking-tight text-primary-500 uppercase">Packet</h2>
                 <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                   {rtl ? 'لوحة التحكم' : 'Admin Panel'}
                 </p>
               </div>
               <button onClick={onClose} className={`p-2 text-slate-400 ${rtl ? '-ml-2' : '-mr-2'}`}><X size={20} /></button>
            </div>
            
            <div className="flex-grow flex flex-col gap-3 overflow-y-auto">
              <div className="px-1">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  type="text"
                  placeholder={rtl ? 'ابحث عن قسم...' : 'Jump to section...'}
                  className="w-full h-10 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 text-sm font-semibold outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              {groupedTabs.map((group) => (
                <div key={group.id} className="space-y-1">
                  <p className="px-2 text-[10px] uppercase tracking-[0.16em] font-black text-slate-500 dark:text-slate-400">
                    {group.title}
                  </p>
                  {group.tabs.map((tab) => (
                    <SidebarLink key={tab.id} tab={tab} rtl={rtl} currentPath={location.pathname} />
                  ))}
                </div>
              ))}
              {groupedTabs.length === 0 && (
                <p className="px-2 py-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                  {rtl ? 'لا توجد نتائج مطابقة' : 'No matching sections'}
                </p>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-white/5 space-y-2">
              <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 font-bold text-xs ring-1 ring-primary-500/30">
                    {user?.username.substring(0, 1).toUpperCase()}
                </div>
                <div className="flex-grow min-w-0">
                    <p className="text-slate-800 dark:text-white text-[15px] font-bold truncate">{user?.username}</p>
                    <p className="text-slate-500 text-[13px]">{user?.is_super_admin ? 'مدير عام' : 'مسؤول'}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold"
              >
                <LogOut size={18} />
                <span className="text-[18px]">{rtl ? 'تسجيل الخروج' : 'Logout'}</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarLink({ tab, currentPath, rtl, isCollapsed }: { tab: SidebarTab, rtl: boolean, currentPath: string, isCollapsed?: boolean }) {
  const Icon = tab.icon;
  const isActive = currentPath === tab.path || (tab.path !== '/admin' && currentPath.startsWith(tab.path));
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={tab.path}
        className={`flex items-center px-4 py-3 rounded-2xl transition-all relative overflow-hidden group/link ${
          isCollapsed ? 'justify-center' : 'gap-3'
        } ${
          isActive 
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
            : 'hover:bg-primary-500/5 text-slate-500 dark:text-slate-400 hover:text-primary-500'
        }`}
        title={tab.label}
      >
        <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/5 group-hover/link:bg-primary-500/10 group-hover/link:rotate-12'}`}>
          <Icon size={18} className="transition-transform duration-300" />
        </div>
        {!isCollapsed && (
          <span className="font-black text-[12px] uppercase tracking-wider relative z-10 whitespace-nowrap">
            {tab.label}
          </span>
        )}
        {isActive && (
          <motion.div 
            layoutId="activeTabGlow"
            className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
        {isActive && (
          <motion.div 
            layoutId="activeTabIndicator"
            className={`absolute ${isCollapsed ? 'bottom-1 left-1/2 -translate-x-1/2 h-1 w-4' : `${rtl ? 'left-3' : 'right-3'} w-1 h-3`} bg-white/60 rounded-full`}
          />
        )}
      </Link>
    </motion.div>
  );
}
