import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/store';
import { LucideLock, LucideUser, LucideEye, LucideEyeOff, LucideArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login({ username, password });
    if (success) {
      navigate('/admin');
    } else {
      setError('خطأ في اسم المستخدم أو كلمة المرور');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-500/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 glass-card border border-white/10 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-500/30">
            <LucideLock className="text-primary-500" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">تسجيل دخول المسؤول</h1>
          <p className="text-slate-400 text-sm">أهلاً بك مجدداً، يرجى إدخال بياناتك</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mr-1">
              اسم المستخدم
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                <LucideUser size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pr-11 pl-4 text-white placeholder-slate-600 focus:border-primary-500/50 focus:bg-white/10 transition-all outline-none"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mr-1">
              كلمة المرور
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                <LucideLock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pr-11 pl-12 text-white placeholder-slate-600 focus:border-primary-500/50 focus:bg-white/10 transition-all outline-none text-right"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <LucideEyeOff size={18} /> : <LucideEye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>تسجيل الدخول</span>
                <LucideArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-slate-500 text-xs">
          &copy; {new Date().getFullYear()} MyMenuEG Dashboard v1.0
        </div>
      </motion.div>
    </div>
  );
}
