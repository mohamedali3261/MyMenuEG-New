import { useStore } from '../../../store/store';
import { motion } from 'framer-motion';

interface Props {
  specs: { key: string; value: string }[];
}

export default function ProductSpecs({ specs }: Props) {
  const { rtl } = useStore();

  return (
    <div className="mt-12 w-full">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="w-8 h-1 bg-primary-500 rounded-full inline-block"></span>
        {rtl ? 'المواصفات التقنية' : 'Technical Specifications'}
      </h2>
      
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <tbody>
            {specs.map((spec, i) => (
              <motion.tr 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="border-b border-slate-200 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition"
              >
                <td className={`p-4 font-semibold w-1/3 bg-slate-50 dark:bg-black/20 ${rtl ? 'text-right border-l border-slate-200 dark:border-white/5' : 'border-r border-slate-200 dark:border-white/5'}`}>
                  {spec.key}
                </td>
                <td className={`p-4 text-slate-600 dark:text-slate-300 ${rtl ? 'text-right' : ''}`}>
                  {spec.value}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
