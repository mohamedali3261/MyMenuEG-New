import { Search, Filter, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../../../api';
import PremiumDropdown from '../../../../components/ui/PremiumDropdown';

interface ProductsFilterProps {
  rtl: boolean;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
}

export default function ProductsFilter({ 
  rtl, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory 
}: ProductsFilterProps) {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
  }, []);

  const categoryOptions = [
    { value: 'all', labelAr: 'كل الأقسام', labelEn: 'All Categories', icon: <Filter size={14} />, color: 'text-primary-500', bg: 'bg-primary-500/10' },
    ...categories.map(c => ({
      value: c.id,
      labelAr: c.name_ar,
      labelEn: c.name_en,
      icon: <Tag size={14} />,
      color: 'text-slate-500',
      bg: 'bg-slate-100 dark:bg-white/5'
    }))
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-8">
      {/* Search Input */}
      <div className="glass-card p-3 flex items-center gap-4 flex-grow shadow-sm border-slate-200 dark:border-white/5">
        <Search className="text-slate-400 shrink-0" size={20} />
        <input 
          type="text" 
          placeholder={rtl ? 'ابحث باسم المنتج...' : 'Search by name...'}
          className="bg-transparent border-none outline-none flex-grow text-sm font-semibold text-slate-700 dark:text-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Dropdown */}
      <div className="flex items-center gap-4 w-full lg:w-[240px] shrink-0">
        <PremiumDropdown 
          value={selectedCategory}
          options={categoryOptions}
          rtl={rtl}
          onChange={setSelectedCategory}
          className="w-full"
        />
      </div>
    </div>
  );
}
