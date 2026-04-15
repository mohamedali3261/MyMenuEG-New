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
      {/* Desktop Sidebar (Permanent) */}
      <aside className={`hidden lg:flex glass-card rounded-none border-y-0 h-[calc(100vh-6rem)] sticky top-24 p-3.5 flex-col gap-2 ${rtl ? 'border-l border-r-0' : 'border-r border-l-0'} relative overflow-hidden group/sidebar transition-all duration-300 ${isCollapsed ? 'w-24' : 'w-80'} bg-gradient-to-b from-white/70 to-white/40 dark:from-slate-900/80 dark:to-slate-950/70 backdrop-blur-xl`}>
        {/* Animated Glow Backdrop */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 blur-[80px] rounded-full pointer-events-none group-hover/sidebar:bg-primary-500/20 transition-all duration-700" />
        
        <div className={`mb-5 py-2 border-b border-slate-200/80 dark:border-white/10 relative z-10 ${isCollapsed ? 'px-1.5' : 'px-3'}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
            {!isCollapsed && (
              <div>
                <h2 className="text-xl font-black tracking-tight text-primary-500 uppercase flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  {rtl ? 'لوحة التحكم الرئيسية' : 'Main Control Panel'}
                </h2>
              </div>
            )}
            <button
              onClick={onToggleCollapse}
              className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-primary-500 hover:bg-primary-500/10 transition-colors flex items-center justify-center"
              aria-label={isCollapsed ? (rtl ? 'توسيع القائمة الجانبية' : 'Expand sidebar') : (rtl ? 'طي القائمة الجانبية' : 'Collapse sidebar')}
              title={isCollapsed ? (rtl ? 'توسيع' : 'Expand') : (rtl ? 'طي' : 'Collapse')}
            >
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>
        </div>
        
        <div className={`flex-grow flex flex-col gap-3 overflow-y-auto custom-scrollbar ${isCollapsed ? '' : 'pr-2'}`}>
          {!isCollapsed && (
            <div className="px-1">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                placeholder={rtl ? 'ابحث عن قسم...' : 'Jump to section...'}
                className="w-full h-10 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 text-sm font-semibold outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          )}

          {groupedTabs.map((group) => (
            <div key={group.id} className="space-y-1.5">
              {!isCollapsed && (
                <p className="px-2 text-[10px] uppercase tracking-[0.16em] font-black text-slate-500 dark:text-slate-400">
                  {group.title}
                </p>
              )}
              {group.tabs.map((tab) => (
                <SidebarLink key={tab.id} tab={tab} rtl={rtl} currentPath={location.pathname} isCollapsed={isCollapsed} />
              ))}
            </div>
          ))}

          {groupedTabs.length === 0 && !isCollapsed && (
            <p className="px-2 py-3 text-xs font-bold text-slate-500 dark:text-slate-400">
              {rtl ? 'لا توجد نتائج مطابقة' : 'No matching sections'}
            </p>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="mt-auto pt-3 border-t border-slate-200/80 dark:border-white/10 space-y-1.5">
          <div className={`flex items-center py-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 ${isCollapsed ? 'justify-center px-1.5' : 'gap-3 px-3.5'}`}>
            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 font-bold text-xs ring-1 ring-primary-500/30">
              {user?.username.substring(0, 1).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-grow min-w-0">
                <p className="text-slate-800 dark:text-white text-[15px] font-black truncate">{user?.username}</p>
                <p className="text-slate-500 dark:text-slate-400 text-[13px] font-semibold">{user?.is_super_admin ? 'مدير عام' : 'مسؤول'}</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center py-2.5 rounded-2xl text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-all font-bold group ${isCollapsed ? 'justify-center px-1.5' : 'gap-3 px-3.5'}`}
            aria-label={rtl ? 'تسجيل الخروج' : 'Logout'}
            title={rtl ? 'تسجيل الخروج' : 'Logout'}
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            {!isCollapsed && <span className="text-[16px]">{rtl ? 'تسجيل الخروج' : 'Logout'}</span>}
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
    <Link
      to={tab.path}
      className={`flex items-center px-3.5 py-2.5 rounded-2xl transition-all relative overflow-hidden group/link border ${
        isCollapsed ? 'justify-center' : 'gap-2.5'
      } ${
        isActive 
          ? 'bg-primary-500 text-white border-primary-400/80' 
          : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-primary-500'
      }`}
      title={tab.label}
    >
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/5 group-hover/link:bg-primary-500/10'}`}>
        <Icon size={18} className={`transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover/link:scale-105'}`} />
      </div>
      {!isCollapsed && (
        <span className="font-bold text-[13px] leading-5 tracking-tight relative z-10 whitespace-normal break-words">
          {tab.label}
        </span>
      )}
      {isActive && (
        <motion.div 
          layoutId="activeTab"
          className={`absolute ${isCollapsed ? 'bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5' : `${rtl ? 'right-0' : 'left-0'} w-0.5 h-4`} bg-white rounded-full`}
        />
      )}
    </Link>
  );
}
