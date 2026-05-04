import { useState, useEffect } from 'react';
import { useStore } from '../../../../store/store';
import { Shield, Key } from 'lucide-react';
import { api } from '../../../../api';
import SaveButton from '../../../../components/SaveButton';

export default function AuthSettingsPanel() {
  const { rtl, showToast } = useStore();
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    api.get('/settings').then(res => {
      setGoogleEnabled(res.data.google_login_enabled === 'true');
      setClientId(res.data.google_client_id || '');
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/settings', {
        google_login_enabled: String(googleEnabled),
        google_client_id: clientId
      });
      showToast(rtl ? 'تم حفظ إعدادات التسجيل بنجاح ✓' : 'Auth settings saved ✓');
    } catch {
      showToast(rtl ? 'خطأ في حفظ الإعدادات' : 'Error saving settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
        <Shield className="text-primary-500" size={32} />
        {rtl ? 'إعدادات المصادقة' : 'Authentication Settings'}
      </h1>
      <p className="text-slate-400 text-sm mb-8">
        {rtl ? 'تحكم في طرق تسجيل الدخول المتاحة' : 'Control the available login methods'}
      </p>

      {/* Google OAuth Toggle */}
      <div className={`glass-card p-6 mb-8 border-2 transition-all ${googleEnabled ? 'border-primary-500/30' : 'border-slate-200 dark:border-white/10'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${googleEnabled ? 'bg-primary-500/5 border-primary-500/20' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
              <svg viewBox="0 0 24 24" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black">{rtl ? 'تسجيل الدخول بـ Google' : 'Google Sign-In'}</h2>
              <p className="text-sm text-slate-400">
                {googleEnabled 
                  ? (rtl ? '✅ مفعّل - يمكن للمسؤولين تسجيل الدخول بحساب Google' : '✅ Enabled - Admins can sign in with Google')
                  : (rtl ? '⏸️ معطّل - تسجيل الدخول باسم المستخدم فقط' : '⏸️ Disabled - Username login only')}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setGoogleEnabled(!googleEnabled)}
            className={`relative w-16 h-9 rounded-full transition-all duration-300 ease-out ${googleEnabled ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <span className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-lg transition-all duration-300 ease-out flex items-center justify-center ${googleEnabled ? 'translate-x-7 shadow-primary-500/20' : 'translate-x-0'}`}>
              {googleEnabled && <span className="text-primary-500 text-xs font-bold">✓</span>}
            </span>
          </button>
        </div>

        {googleEnabled && (
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                {rtl ? 'Google Client ID' : 'Google Client ID'}
              </label>
              <div className="relative">
                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  placeholder="123456789-abc123.apps.googleusercontent.com"
                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 pl-10 text-sm focus:border-primary-500 outline-none font-mono"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {rtl 
                  ? 'احصل عليه من Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID'
                  : 'Get it from Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Save */}
      <SaveButton
        onClick={handleSave}
        isSaving={loading}
        rtl={rtl}
        color="glass"
        checkHasChanges={false}
      />
    </div>
  );
}
