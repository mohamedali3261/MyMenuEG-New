import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/store';
import { LucideLock, LucideUser, LucideMail, LucideEye, LucideEyeOff, LucideArrowRight, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../api';

declare global {
  interface Window {
    google?: any;
  }
}

export default function Login() {
  const location = useLocation();
  const isAdminLogin = location.pathname === '/login' || location.pathname.startsWith('/admin');
  const { rtl } = useStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  
  const login = useStore(state => state.login);
  const setCustomer = useStore(state => state.setCustomer);
  const loadCustomerData = useStore(state => state.loadCustomerData);
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Fetch Google login settings (public endpoint)
  useEffect(() => {
    api.get('/auth/settings').then(res => {
      const enabled = res.data.google_login_enabled === 'true';
      const clientId = res.data.google_client_id || '';
      setGoogleEnabled(enabled);
      setGoogleClientId(clientId);
    }).catch(() => {}).finally(() => setSettingsLoading(false));
  }, []);

  // Load Google Identity Services script
  useEffect(() => {
    if (!googleEnabled || !googleClientId?.trim()) return;

    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          width: 320,
          text: 'signin_with',
          locale: 'ar',
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [googleEnabled, googleClientId]);

  const handleGoogleResponse = useCallback(async (response: any) => {
    setGoogleLoading(true);
    setError('');
    try {
      const endpoint = isAdminLogin ? '/auth/google' : '/auth/customer/google';
      const res = await api.post(endpoint, {
        credential: response.credential
      });
      if (res.data.success) {
        if (isAdminLogin) {
          useStore.setState({ user: res.data.user, token: res.data.token, authChecked: true });
          navigate('/admin');
        } else {
          setCustomer(res.data.customer, res.data.token);
          loadCustomerData();
          navigate('/');
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || (rtl ? 'فشل تسجيل الدخول بـ Google' : 'Google login failed');
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  }, [navigate, isAdminLogin, setCustomer]);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login({ username, password });
    if (success) {
      navigate('/admin');
    } else {
      setError(rtl ? 'خطأ في اسم المستخدم أو كلمة المرور' : 'Invalid username or password');
    }
    setIsLoading(false);
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/customer/login', { email, password });
      if (res.data.success) {
        setCustomer(res.data.customer, res.data.token);
        loadCustomerData();
        navigate('/my-orders');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || (rtl ? 'خطأ في البريد الإلكتروني أو كلمة المرور' : 'Invalid email or password');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-500/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm p-6 glass-card border border-white/10 relative z-10"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-primary-500/30">
            {isAdminLogin ? (
              <LucideLock className="text-primary-500" size={24} />
            ) : (
              <LogIn className="text-primary-500" size={24} />
            )}
          </div>
          <h1 className="text-xl font-black text-white mb-1">
            {isAdminLogin ? (rtl ? 'تسجيل دخول المسؤول' : 'Admin Login') : (rtl ? 'تسجيل الدخول' : 'Sign In')}
          </h1>
          <p className="text-slate-400 text-xs">
            {isAdminLogin ? (rtl ? 'أهلاً بك مجدداً، يرجى إدخال بياناتك' : 'Welcome back, please enter your credentials') : (rtl ? 'سجل الدخول للوصول إلى حسابك' : 'Sign in to access your account')}
          </p>
        </div>

        {isAdminLogin && (
        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mr-1">
              {rtl ? 'اسم المستخدم أو البريد الإلكتروني' : 'Username or Email'}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                <LucideUser size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-10 bg-white/5 border border-white/10 rounded-lg pr-10 pl-3 text-white placeholder-slate-600 focus:border-primary-500/50 focus:bg-white/10 transition-all outline-none text-sm"
                placeholder=""
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mr-1">
              {rtl ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                <LucideLock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 bg-white/5 border border-white/10 rounded-lg pr-10 pl-11 text-white placeholder-slate-600 focus:border-primary-500/50 focus:bg-white/10 transition-all outline-none text-right text-sm"
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
            className="w-full h-10 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{rtl ? 'تسجيل الدخول' : 'Sign In'}</span>
                <LucideArrowRight size={16} />
              </>
            )}
          </button>

          <div className="text-center">
            <p className="text-slate-400 text-xs">
              {rtl ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
              <Link
                to="/admin/register"
                className="text-primary-500 hover:text-primary-400 font-bold transition-colors"
              >
                {rtl ? 'إنشاء حساب جديد' : 'Create Account'}
              </Link>
            </p>
          </div>
        </form>
        )}

        {/* Customer Login Area */}
        {!isAdminLogin && (
          <form onSubmit={handleCustomerSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mr-1">
                {rtl ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                  <LucideMail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-lg pr-10 pl-3 text-white placeholder-slate-600 focus:border-primary-500/50 focus:bg-white/10 transition-all outline-none text-sm"
                  placeholder=""
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mr-1">
                {rtl ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                  <LucideLock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-lg pr-10 pl-11 text-white placeholder-slate-600 focus:border-primary-500/50 focus:bg-white/10 transition-all outline-none text-right text-sm"
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
              className="w-full h-10 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{rtl ? 'تسجيل الدخول' : 'Sign In'}</span>
                  <LucideArrowRight size={16} />
                </>
              )}
            </button>

            {/* Google Login */}
            {googleEnabled && googleClientId?.trim() && (
              <>
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-grow h-px bg-white/10" />
                  <span className="text-slate-500 text-xs">{rtl ? 'أو' : 'or'}</span>
                  <div className="flex-grow h-px bg-white/10" />
                </div>
                <div className="flex justify-center">
                  <div ref={googleBtnRef} className="w-full flex justify-center" />
                </div>
                {googleLoading && (
                  <div className="text-center mt-2">
                    <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
                  </div>
                )}
              </>
            )}

            <div className="text-center">
              <p className="text-slate-400 text-xs">
                {rtl ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                <Link
                  to="/register"
                  className="text-primary-500 hover:text-primary-400 font-bold transition-colors"
                >
                  {rtl ? 'إنشاء حساب جديد' : 'Create Account'}
                </Link>
              </p>
            </div>
          </form>
        )}

        {!isAdminLogin && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-slate-400 hover:text-primary-500 transition-colors"
            >
              {rtl ? '← العودة للرئيسية' : '← Back to Home'}
            </button>
          </div>
        )}
        <div className="mt-6 pt-4 border-t border-white/5 text-center text-slate-500 text-[10px]">
          &copy; {new Date().getFullYear()} MyMenuEG v1.0
        </div>
      </motion.div>
    </div>
  );
}
