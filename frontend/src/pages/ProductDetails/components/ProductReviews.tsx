import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { api } from '../../../api';
import { Star, Send, MessageSquare, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment_ar?: string;
  comment_en?: string;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { rtl, customer, customerToken } = useStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews/product', { params: { product_id: productId } });
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.averageRating || 0);
      setTotal(res.data.total || 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(rtl ? 'اختر التقييم' : 'Select a rating');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/reviews', {
        product_id: productId,
        rating,
        comment_ar: rtl ? comment.trim() || undefined : undefined,
        comment_en: rtl ? undefined : comment.trim() || undefined,
      });
      toast.success(rtl ? 'تم إرسال التقييم وسيتم مراجعته' : 'Review submitted and pending approval');
      setRating(0);
      setComment('');
      setShowForm(false);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        toast.error(rtl ? 'يجب تسجيل الدخول أولاً' : 'Please login first to submit a review');
      } else {
        toast.error(err?.response?.data?.error || (rtl ? 'فشل إرسال التقييم' : 'Failed to submit review'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 w-full">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="w-8 h-1 bg-yellow-500 rounded-full inline-block"></span>
        {rtl ? 'تقييمات وآراء العملاء' : 'Customer Reviews'}
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Rating Overview */}
        <div className="md:col-span-1 glass-card p-6 flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-extrabold text-slate-800 dark:text-white mb-2">
            {total > 0 ? avgRating.toFixed(1) : '-'}
          </span>
          <div className="flex items-center gap-1 text-yellow-500 mb-2">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={24} className={s <= Math.round(avgRating) ? 'fill-yellow-500' : ''} />
            ))}
          </div>
          <span className="text-slate-500 text-sm">
            {total > 0
              ? (rtl ? `بناءً على ${total} تقييم` : `Based on ${total} reviews`)
              : (rtl ? 'لا توجد تقييمات بعد' : 'No reviews yet')}
          </span>
        </div>

        {/* Reviews List */}
        <div className="md:col-span-2 space-y-4">
          {/* Write Review Button/Form */}
          {customerToken ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full glass-card flex items-center justify-center gap-2 p-3 text-sm font-bold text-primary-500 hover:bg-primary-500/5 transition-colors rounded-xl"
            >
              <MessageSquare size={16} />
              {rtl ? 'اكتب تقييمك' : 'Write a Review'}
            </button>
          ) : (
            <button
              onClick={() => toast.error(rtl ? 'يجب تسجيل الدخول أولاً لكتابة تقييم' : 'Please login to write a review')}
              className="w-full glass-card flex items-center justify-center gap-2 p-3 text-sm font-bold text-slate-400 hover:text-primary-500 transition-colors rounded-xl"
            >
              <LogIn size={16} />
              {rtl ? 'سجل دخولك لكتابة تقييم' : 'Login to write a review'}
            </button>
          )}

          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
                onSubmit={handleSubmit}
              >
                <div className="p-5 glass-card space-y-4">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-400 mr-2">{rtl ? 'التقييم:' : 'Rating:'}</span>
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-125"
                      >
                        <Star
                          size={28}
                          className={`transition-colors ${(hoverRating || rating) >= s ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`}
                        />
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder={rtl ? 'اكتب تعليقك (اختياري)' : 'Write your comment (optional)'}
                    rows={3}
                    maxLength={1000}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary-500 resize-none"
                  />

                  <div className="flex gap-2">
                    <button type="submit" disabled={submitting} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
                      <Send size={14} />
                      {submitting ? (rtl ? 'جاري الإرسال...' : 'Sending...') : (rtl ? 'إرسال' : 'Submit')}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
                      {rtl ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Reviews */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Star size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">{rtl ? 'لا توجد تقييمات بعد. كن أول من يقيّم!' : 'No reviews yet. Be the first to review!'}</p>
            </div>
          ) : (
            reviews.map((review, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={review.id}
                className="glass-card p-6 border-l-4 border-l-yellow-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg">{review.user_name}</h4>
                    <span className="text-sm text-slate-400">
                      {new Date(review.created_at).toLocaleDateString(rtl ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-1 text-yellow-500">
                    {Array.from({ length: review.rating }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  {rtl ? review.comment_ar : review.comment_en}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
