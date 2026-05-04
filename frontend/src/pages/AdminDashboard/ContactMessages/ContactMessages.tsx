import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { Mail, Clock, Check, X, Archive, RefreshCw, Paperclip, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../api';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  custom_file_url?: string;
  custom_notes?: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
}

const statusColors = {
  new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  read: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  replied: 'bg-primary-500/10 text-primary-500 border-primary-500/20',
  archived: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
};

const statusLabels = {
  new: { ar: 'جديد', en: 'New' },
  read: { ar: 'مقروء', en: 'Read' },
  replied: { ar: 'تم الرد', en: 'Replied' },
  archived: { ar: 'مؤرشف', en: 'Archived' }
};

export default function ContactMessages() {
  const { rtl, refreshSidebarBadges } = useStore();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchMessages = async () => {
    try {
      const res = await api.get('/contact');
      setMessages(res.data);
    } catch (err) {
      toast.error(rtl ? 'فشل في تحميل الرسائل' : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/contact/${id}/status`, { status });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: status as any } : m));
      refreshSidebarBadges();
      toast.success(rtl ? 'تم تحديث الحالة' : 'Status updated');
    } catch (err) {
      toast.error(rtl ? 'فشل في تحديث الحالة' : 'Failed to update status');
    }
  };

  const filteredMessages = filter === 'all' 
    ? messages 
    : messages.filter(m => m.status === filter);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
            <Mail className="text-primary-500" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {rtl ? 'رسائل التواصل' : 'Contact Messages'}
            </h1>
            <p className="text-sm text-slate-500">
              {rtl ? `${messages.length} رسالة` : `${messages.length} messages`}
            </p>
          </div>
        </div>
        <button
          onClick={fetchMessages}
          className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            filter === 'all' ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-white/5'
          }`}
        >
          {rtl ? 'الكل' : 'All'}
        </button>
        {Object.entries(statusLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              filter === key ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-white/5'
            }`}
          >
            {rtl ? label.ar : label.en}
          </button>
        ))}
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Mail size={48} className="mx-auto mb-4 opacity-30" />
          <p>{rtl ? 'لا توجد رسائل' : 'No messages found'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">{msg.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>{msg.email}</span>
                    <span>{msg.phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[msg.status]}`}>
                    {rtl ? statusLabels[msg.status].ar : statusLabels[msg.status].en}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-primary-500 mb-2">{msg.subject}</h4>
                <p className="text-slate-600 dark:text-slate-400">{msg.message}</p>
              </div>

              {/* Custom Design Attachment */}
              {(msg.custom_file_url || msg.custom_notes) && (
                <div className="bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/10 p-3 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <Paperclip size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">{rtl ? 'تصميم مخصص' : 'Custom Design'}</span>
                  </div>
                  {msg.custom_file_url && (
                    <a href={msg.custom_file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
                      <FileText size={14} />
                      {rtl ? 'عرض الملف المرفق' : 'View Attached File'}
                    </a>
                  )}
                  {msg.custom_notes && (
                    <p className="text-xs text-indigo-700/70 dark:text-indigo-300/70 font-medium">{msg.custom_notes}</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock size={14} />
                  {new Date(msg.created_at).toLocaleDateString(rtl ? 'ar-EG' : 'en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="flex gap-2">
                  {msg.status === 'new' && (
                    <button
                      onClick={() => updateStatus(msg.id, 'read')}
                      className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-colors"
                      title={rtl ? 'تحديد كمقروء' : 'Mark as Read'}
                    >
                      <Check size={16} />
                    </button>
                  )}
                  {(msg.status === 'new' || msg.status === 'read') && (
                    <button
                      onClick={() => updateStatus(msg.id, 'replied')}
                      className="p-2 rounded-lg bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-colors"
                      title={rtl ? 'تم الرد' : 'Mark as Replied'}
                    >
                      <Mail size={16} />
                    </button>
                  )}
                  {msg.status !== 'archived' && (
                    <button
                      onClick={() => updateStatus(msg.id, 'archived')}
                      className="p-2 rounded-lg bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 transition-colors"
                      title={rtl ? 'أرشفة' : 'Archive'}
                    >
                      <Archive size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
