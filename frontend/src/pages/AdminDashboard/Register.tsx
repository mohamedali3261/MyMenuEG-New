import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LucideLock, LucideUser, LucideEye, LucideEyeOff, LucideArrowRight, LucideMail, LucideUserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../../api';
import { useStore } from '../../store/store';

export default function Register() {
  const location = useLocation();
  const isAdminRegister = location.pathname.startsWith('/admin');
  const { rtl, setCustomer, loadCustomerData } = useStore();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(rtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError(rtl ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      if (isAdminRegister) {
        const res = await api.post('/auth/register', {
          username: username.trim(),
          password,
          email: email.trim() || undefined
        });
        if (res.data.success) {
          toast.success(res.data.message || (rtl ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!'));
          navigate('/login');
          return;
        }
      } else {
        const res = await api.post('/auth/customer/register', {
          name: name.trim(),
          email: email.trim(),
          password
        });
        if (res.data.success) {
          setCustomer(res.data.customer, res.data.token);
          loadCustomerData();
          toast.success(res.data.message || (rtl ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!'));
          navigate('/my-orders');
          return;
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || (rtl ? 'فشل في إنشاء الحساب' : 'Failed to create account');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-500/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm p-6 glass-card border border-white/10 relative z-10"
      >
        <div className="text-center mb-4">
          <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-2 border border-primary-500/30">
            <LucideUserPlus className="text-primary-500" size={20} />
          </div>
          <h1 className="text-lg font-black text-white">
            {isAdminRegister ? (rtl ? 'إنشاء حساب مسؤول' : 'Create Admin Account') : (rtl ? 'إنشاء حساب جديد' : 'Create Account')}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isAdminRegister && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mr-1">
                {rtl ? 'اسم المستخدم' : 'Username'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <LucideUser size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-9 bg-white/5 border border-white/10 rounded-lg pr-9 pl-2.5 text-white placeholder-slate-600 focus:border-primary-500/50 focus:bg-white/10 transition-all outline-none text-xs"
                  placeholder=""
                  required
                  minLength={3}
                />
              </div>
            </div>
          )}

          {!isAdminRegister && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mr-1">
                {rtl ? 'الاسم' : 'Name'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <LucideUser size={16} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 bg-white/5 border border-white/10 rounded-lg pr-9 pl-2.5 text-white placeholder-slate-600 focus:border-primary-500/50 focus:bg-white/10 transition-all outline-none text-xs"
                  placeholder=""
                  required
                  minLength={2}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mr-1">
              {rtl ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                <LucideMail size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 bg-white/5 border border-white/10 rounded-lg pr-9 pl-2.5 text-white placeholder-slate-600 focus:border-primary-500/50 focus:bg-white/10 transition-all outline-none text-xs"
                placeholder=""
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mr-1">
              {rtl ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                <LucideLock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-9 bg-white/5 border border-white/10 rounded-lg pr-9 pl-10 text-white placeholder-slate-600 focus:border-primary-500/50 focus:bg-white/10 transition-all outline-none text-right text-xs"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <LucideEyeOff size={16} /> : <LucideEye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mr-1">
              {rtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                <LucideLock size={16} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-9 bg-white/5 border border-white/10 rounded-lg pr-9 pl-10 text-white placeholder-slate-600 focus:border-primary-500/50 focus:bg-white/10 transition-all outline-none text-right text-xs"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <LucideEyeOff size={16} /> : <LucideEye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-9 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all disabled:opacity-50 text-xs"
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{rtl ? 'إنشاء الحساب' : 'Create Account'}</span>
                <LucideArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-slate-400 text-[10px]">
            {rtl ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
            <Link
              to={isAdminRegister ? '/admin/login' : '/login'}
              className="text-primary-500 hover:text-primary-400 font-bold transition-colors"
            >
              {rtl ? 'تسجيل الدخول' : 'Sign In'}
            </Link>
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-center text-slate-500 text-[9px]">
          &copy; {new Date().getFullYear()} MyMenuEG v1.0
        </div>
      </motion.div>
    </div>
  );
}
