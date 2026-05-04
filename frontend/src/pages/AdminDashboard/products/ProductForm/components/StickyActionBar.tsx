import { Save as SaveIcon } from 'lucide-react';

interface StickyActionBarProps {
  rtl: boolean;
  activeTab: string;
  loading: boolean;
  saveProduct: () => void;
  productType: string;
}

export function StickyActionBar({ rtl, loading, saveProduct, productType }: StickyActionBarProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={saveProduct}
        disabled={loading}
        className="group relative flex items-center gap-3 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-primary-500/20 active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            <span>{rtl ? 'جاري الحفظ...' : 'Saving...'}</span>
          </div>
        ) : (
          <>
            <SaveIcon size={18} />
            <span className="tracking-wide uppercase text-xs">
              {rtl ? 'حفظ' : 'Save'}
            </span>
          </>
        )}
      </button>
    </div>
  );
}
