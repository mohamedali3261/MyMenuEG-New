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
  PanelLeftOpen,
  Truck,
  Star,
  HelpCircle,
  GalleryHorizontalEnd,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../../store/store';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ADMIN_TABS } from './adminTabs';
import { useMemo, useState, useEffect } from 'react';
import { api } from '../../../api';

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
  const { rtl, user, logout, sidebarBadgeVersion } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await api.get('/stats/sidebar-counts');
        setBadgeCounts({
          orders: res.data.pendingOrders,
          messages: res.data.newMessages,
          customers: res.data.totalCustomers,
        });
      } catch (error) {
        console.warn('Failed to fetch sidebar counts', error);
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, [sidebarBadgeVersion]);

  const handleLogout = () => {
    logout();
    navigate('/login');
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
    messages: MessageSquare,
    contact: MessageSquare,
    payment: CreditCard,
    shipping: Truck,
    reviews: Star,
    auth: Shield,
    faq: HelpCircle,
    marquee: GalleryHorizontalEnd,
    settings: Settings
  };

  const tabs: SidebarTab[] = ADMIN_TABS.map((tab) => ({
    id: tab.id,
    path: tab.path,
    superAdminOnly: tab.superAdminOnly,
    label: rtl ? tab.labelAr : tab.labelEn,
    icon: iconMap[tab.id] || Layout,
  }));

  const filteredTabs = tabs.filter(tab => {
    if (!user) return false;
    if (user.is_super_admin) return true;
    if (tab.superAdminOnly) return false;
    // Overview is usually allowed for all admins
    if (tab.id === 'overview') return true;
    if (tab.id === 'contact' && user.permissions.includes('settings')) return true;
    if (tab.id === 'payment' && user.permissions.includes('settings')) return true;
    if (tab.id === 'shipping' && user.permissions.includes('settings')) return true;
    if (tab.id === 'auth' && user.permissions.includes('settings')) return true;
    if (tab.id === 'faq' && user.permissions.includes('settings')) return true;
    if (tab.id === 'reviews' && (user.permissions.includes('reviews') || user.permissions.includes('settings'))) return true;
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
        tabIds: ['overview', 'products', 'categories', 'slides', 'marquee', 'pages'],
      },
      {
        id: 'sales',
        titleAr: 'المبيعات',
        titleEn: 'Sales',
        tabIds: ['orders', 'customers', 'coupons', 'messages', 'reviews'],
      },
      {
        id: 'marketing',
        titleAr: 'التسويق',
        titleEn: 'Marketing',
        tabIds: ['offers', 'contact', 'faq'],
      },
      {
        id: 'system',
        titleAr: 'النظام',
        titleEn: 'System',
        tabIds: ['payment', 'shipping', 'auth', 'settings', 'users', 'database'],
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
      {/* Desktop Sidebar - Simple & Fast */}
      <aside 
        className={`hidden lg:flex flex-col gap-2 rounded-2xl my-2 ml-4 h-[calc(100vh-4rem)] sticky top-0 p-4 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-lg z-50 transition-all duration-200 ${isCollapsed ? 'w-[100px]' : 'w-[280px]'}`}
      >
        
        <div className={`mb-4 py-2 border-b border-slate-200 dark:border-white/10 ${isCollapsed ? 'px-0' : 'px-2'}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                  {rtl ? 'لوحة التحكم' : 'Control'}
                </h2>
              </div>
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
        
        <div className={`flex-grow flex flex-col gap-3 overflow-y-auto no-scrollbar ${isCollapsed ? '' : 'px-1'}`}>
          {!isCollapsed && (
            <div className="relative mb-1">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                placeholder={rtl ? 'البحث...' : 'Search...'}
                className="w-full h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 text-xs font-bold outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          )}

          {groupedTabs.map((group) => (
            <div key={group.id} className="space-y-1">
              {!isCollapsed && (
                <p className="px-2 text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                  {group.title}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {group.tabs.map((tab) => (
                  <SidebarLink key={tab.id} tab={tab} rtl={rtl} currentPath={location.pathname} isCollapsed={isCollapsed} badgeCounts={badgeCounts} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <div className="mt-auto pt-3 border-t border-slate-200 dark:border-white/10">
          <div className={`flex items-center p-2 rounded-xl bg-slate-50 dark:bg-white/5 ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.username.substring(0, 1).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-grow min-w-0">
                <p className="text-slate-900 dark:text-white text-xs font-bold truncate">{user?.username}</p>
                <p className="text-slate-400 text-[10px]">{user?.is_super_admin ? (rtl ? 'مدير' : 'Admin') : (rtl ? 'مسؤول' : 'Staff')}</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            className={`w-full mt-2 flex items-center py-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-colors font-bold ${isCollapsed ? 'justify-center' : 'gap-2 px-3'}`}
          >
            <LogOut size={16} />
            {!isCollapsed && <span className="text-xs">{rtl ? 'خروج' : 'Logout'}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer - Simple */}
      {isOpen && (
        <aside 
          className={`lg:hidden fixed top-20 bottom-0 w-72 z-[110] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 p-4 flex flex-col gap-2 shadow-xl h-[calc(100vh-5rem)] ${rtl ? 'right-0 border-l' : 'left-0'}`}
        >
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold text-slate-800 dark:text-white">{rtl ? 'القائمة' : 'Menu'}</h2>
             <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          
          <div className="flex-grow flex flex-col gap-2 overflow-y-auto">
            <div className="mb-2">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                placeholder={rtl ? 'بحث...' : 'Search...'}
                className="w-full h-9 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 text-sm outline-none focus:border-primary-500"
              />
            </div>
            {groupedTabs.map((group) => (
              <div key={group.id} className="space-y-1">
                <p className="px-2 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  {group.title}
                </p>
                {group.tabs.map((tab) => (
                  <SidebarLink key={tab.id} tab={tab} rtl={rtl} currentPath={location.pathname} badgeCounts={badgeCounts} />
                ))}
              </div>
            ))}
          </div>

          <div className="mt-auto pt-3 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2 px-2 py-2 mb-2 rounded-lg bg-slate-50 dark:bg-white/5">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-xs">
                  {user?.username.substring(0, 1).toUpperCase()}
              </div>
              <div className="flex-grow min-w-0">
                  <p className="text-slate-800 dark:text-white text-sm font-bold truncate">{user?.username}</p>
                  <p className="text-slate-500 text-xs">{user?.is_super_admin ? (rtl ? 'مدير' : 'Admin') : (rtl ? 'مسؤول' : 'Staff')}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors font-bold"
            >
              <LogOut size={16} />
              <span>{rtl ? 'خروج' : 'Logout'}</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
}

function SidebarLink({ tab, currentPath, rtl, isCollapsed, badgeCounts = {} }: { tab: SidebarTab, rtl: boolean, currentPath: string, isCollapsed?: boolean, badgeCounts?: Record<string, number> }) {
  const Icon = tab.icon;
  const isActive = currentPath === tab.path || (tab.path !== '/admin' && currentPath.startsWith(tab.path));
  const count = badgeCounts[tab.id] || 0;

  return (
    <Link
      to={tab.path}
      className={`flex items-center px-3 py-2.5 rounded-xl transition-colors gap-2 ${
        isActive 
          ? 'bg-primary-500 text-white' 
          : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
      }`}
      title={tab.label}
    >
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 relative ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/5'}`}>
        <Icon size={18} />
        {count > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full text-[9px] font-bold ${isActive ? 'bg-white text-primary-500' : 'bg-primary-500 text-white'}`}>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>
      <span className={`font-bold whitespace-nowrap flex-grow ${isCollapsed ? 'text-[10px]' : 'text-xs'}`}>
        {tab.label}
      </span>
    </Link>
  );
}
