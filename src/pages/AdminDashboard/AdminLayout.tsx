import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { Menu, X } from 'lucide-react';
import { useStore } from '../../store/store';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { branding } = useStore();
  const location = useLocation();

  useEffect(() => {
    document.title = `Admin | ${branding.storeName}`;
  }, [branding]);

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="w-full min-h-screen pt-24 md:pt-28 lg:pt-32 bg-slate-200 dark:bg-[#080808] transition-colors duration-500 overflow-x-hidden">
      <div className="w-full min-h-[calc(100vh-8rem)] flex flex-col lg:flex-row">
      
      {/* Mobile Header */}
      <header className="lg:hidden h-16 glass-card rounded-none border-t-0 border-x-0 px-4 flex items-center justify-between z-[90]">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 active:scale-90 transition-transform"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-500 font-black text-xs">
             ME
           </div>
        </div>
      </header>

      {/* Sidebar - Handles both Desktop and Mobile Drawer */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[95] lg:hidden"
          />
        )}
      </AnimatePresence>

      <main className="flex-grow p-4 lg:p-10 min-h-[calc(100vh-10rem)] lg:min-h-[calc(100vh-8rem)]">
        <Outlet />
      </main>
      </div>
    </div>
  );
}
