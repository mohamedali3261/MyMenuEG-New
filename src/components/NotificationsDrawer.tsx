import { useStore } from '../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Package, Clock, Truck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NotificationItem {
  id: string;
  is_read: boolean;
  type: string;
  title_ar: string;
  title_en: string;
  message_ar: string;
  message_en: string;
  created_at: string;
}

export default function NotificationsDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { rtl, notifications } = useStore();

  const getIcon = (type: string, message: string) => {
    if (message.includes('Processing') || message.includes('تجهيز')) return <Package className="text-blue-500" size={18} />;
    if (message.includes('Shipped') || message.includes('شحن')) return <Truck className="text-accent-500" size={18} />;
    if (message.includes('Delivered') || message.includes('تسليم')) return <CheckCircle2 className="text-primary-500" size={18} />;
    if (message.includes('Cancelled') || message.includes('إلغاء')) return <ShieldAlert className="text-red-500" size={18} />;
    return <Clock className="text-slate-500" size={18} />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
          />
          
          <motion.div 
            initial={{ x: rtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: rtl ? '-100%' : '100%' }}
            transition={{ type: "spring", damping: 35, stiffness: 400, mass: 0.8 }}
            className={`fixed top-0 bottom-0 w-[85%] max-w-[360px] bg-white/95 dark:bg-[#080808]/95 backdrop-blur-xl z-[100] shadow-2xl p-6 flex flex-col ${rtl ? 'left-0 border-r' : 'right-0 border-l'} border-slate-200 dark:border-white/10 custom-scrollbar`}
          >
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <Bell className="text-primary-500" size={20} />
                </div>
                <h2 className="text-lg font-bold">{rtl ? 'الإشعارات' : 'Notifications'}</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-red-500 hover:text-white rounded-full transition-colors text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="text-center p-10 flex flex-col items-center gap-4 text-slate-400">
                  <Bell size={48} className="opacity-20" />
                  <p className="font-bold">{rtl ? 'لا توجد إشعارات جديدة' : 'No new notifications'}</p>
                </div>
              ) : (
                notifications.map((notif: NotificationItem) => (
                  <Link 
                    to="/track"
                    onClick={onClose}
                    key={notif.id} 
                    className={`block p-4 rounded-2xl border transition-all ${
                      notif.is_read 
                        ? 'bg-slate-50 dark:bg-white/5 border-transparent' 
                        : 'bg-primary-500/5 border-primary-500/20'
                    } hover:border-primary-500/50`}
                  >
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-black/50 shadow-sm flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/5">
                        {getIcon(notif.type, notif.message_en)}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${notif.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-primary-600 dark:text-primary-400'}`}>
                          {rtl ? notif.title_ar : notif.title_en}
                        </h4>
                        <p className="text-xs text-slate-500 font-bold mt-1 line-clamp-2 leading-relaxed">
                          {rtl ? notif.message_ar : notif.message_en}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                          {new Date(notif.created_at).toLocaleString(rtl ? 'ar-EG' : 'en-US')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
