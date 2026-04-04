import { useState } from 'react';
import { useStore } from '../../../store/store';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_REVIEWS = [
  { id: 1, user: 'Ahmed K.', date: '21 Oct, 2025', rating: 5, comment_ar: 'الخامة ممتازة وتتحمل، وتصميمها رائع جداً.', comment_en: 'Excellent material and very durable, beautiful design.' },
  { id: 2, user: 'Sarah M.', date: '15 Sep, 2025', rating: 4, comment_ar: 'التوصيل كان سريع والمنتج مطابق للوصف.', comment_en: 'Fast delivery and product matches the description exactly.' },
];

export default function ProductReviews() {
  const { rtl } = useStore();
  const [newComment, setNewComment] = useState('');

  return (
    <div className="mt-16 w-full">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="w-8 h-1 bg-yellow-500 rounded-full inline-block"></span>
        {rtl ? 'تقييمات وآراء العملاء' : 'Customer Reviews'}
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Rating Overview */}
        <div className="md:col-span-1 glass-card p-6 flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-extrabold text-slate-800 dark:text-white mb-2">4.5</span>
          <div className="flex items-center gap-1 text-yellow-500 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={24} fill={s === 5 ? 'transparent' : 'currentColor'} strokeWidth={s===5?2:1} />
            ))}
          </div>
          <span className="text-slate-500">{rtl ? 'بناءً على 124 تقييم' : 'Based on 124 reviews'}</span>
        </div>

        {/* Reviews List */}
        <div className="md:col-span-2 space-y-4">
          
          <div className="glass-card flex p-2 mb-6">
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={rtl ? 'أضف تقييمك...' : 'Add your review...'} 
              className="flex-grow bg-transparent outline-none px-4" 
            />
            <button className="btn-primary py-2 px-6 shrink-0">{rtl ? 'نشر' : 'Post'}</button>
          </div>

          {MOCK_REVIEWS.map((review, i) => (
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
                  <h4 className="font-bold text-lg">{review.user}</h4>
                  <span className="text-sm text-slate-400">{review.date}</span>
                </div>
                <div className="flex gap-1 text-yellow-500">
                  {Array.from({ length: review.rating }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">{rtl ? review.comment_ar : review.comment_en}</p>
              
              <div className="flex gap-4 border-t border-slate-200 dark:border-white/5 pt-3">
                <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary-500 transition">
                  <ThumbsUp size={16} /> {rtl ? 'مفيد' : 'Helpful'}
                </button>
                <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary-500 transition">
                  <MessageSquare size={16} /> {rtl ? 'رد' : 'Reply'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </div>
  )
}
