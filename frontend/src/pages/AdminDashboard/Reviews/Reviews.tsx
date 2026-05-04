import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { Star, Check, X, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../../api';

interface Review {
  id: number;
  product_id: string;
  user_name: string;
  rating: number;
  comment_ar?: string;
  comment_en?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  products?: {
    name_ar?: string;
    name_en?: string;
  };
}

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  approved: 'bg-primary-500/10 text-primary-500 border-primary-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20'
};

const statusLabels = {
  pending: { ar: 'قيد المراجعة', en: 'Pending' },
  approved: { ar: 'معتمد', en: 'Approved' },
  rejected: { ar: 'مرفوض', en: 'Rejected' }
};

export default function Reviews() {
  const { rtl } = useStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews', {
        params: filter !== 'all' ? { status: filter } : {}
      });
      setReviews(res.data.reviews || res.data);
    } catch (err) {
      toast.error(rtl ? 'فشل في تحميل التقييمات' : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/reviews/${id}/status`, { status });
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: status as any } : r));
      toast.success(rtl ? 'تم تحديث الحالة' : 'Status updated');
    } catch (err) {
      toast.error(rtl ? 'فشل في تحديث الحالة' : 'Failed to update status');
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm(rtl ? 'هل أنت متأكد من حذف هذا التقييم؟' : 'Are you sure you want to delete this review?')) {
      return;
    }
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success(rtl ? 'تم حذف التقييم' : 'Review deleted');
    } catch (err) {
      toast.error(rtl ? 'فشل في حذف التقييم' : 'Failed to delete review');
    }
  };

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.status === filter);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
            <Star className="text-yellow-500" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {rtl ? 'تقييمات المنتجات' : 'Product Reviews'}
            </h1>
            <p className="text-sm text-slate-500">
              {rtl ? `${reviews.length} تقييم` : `${reviews.length} reviews`}
            </p>
          </div>
        </div>
        <button
          onClick={fetchReviews}
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

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Star size={48} className="mx-auto mb-4 opacity-30" />
          <p>{rtl ? 'لا توجد تقييمات' : 'No reviews found'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">{review.user_name}</h3>
                  <p className="text-sm text-slate-500">
                    {review.products?.name_ar || review.products?.name_en || review.product_id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}
                      />
                    ))}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[review.status]}`}>
                    {rtl ? statusLabels[review.status].ar : statusLabels[review.status].en}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {review.comment_ar && (
                  <p className="text-slate-600 dark:text-slate-400">{review.comment_ar}</p>
                )}
                {review.comment_en && (
                  <p className="text-slate-500 text-sm">{review.comment_en}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="text-sm text-slate-500">
                  {new Date(review.created_at).toLocaleDateString(rtl ? 'ar-EG' : 'en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex gap-2">
                  {review.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(review.id, 'approved')}
                        className="p-2 rounded-lg bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-colors"
                        title={rtl ? 'اعتماد' : 'Approve'}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => updateStatus(review.id, 'rejected')}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                        title={rtl ? 'رفض' : 'Reject'}
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="p-2 rounded-lg bg-slate-500/10 text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    title={rtl ? 'حذف' : 'Delete'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
