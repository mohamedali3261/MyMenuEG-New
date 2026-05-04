import { ArrowRight, Save as SaveIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductFormState } from './hooks/useProductFormState';
import { Sidebar } from './components/Sidebar';
import { StickyActionBar } from './components/StickyActionBar';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { PricingSection } from './sections/PricingSection';
import { MediaSection } from './sections/MediaSection';
import { SpecsSection } from './sections/SpecsSection';
import { ShippingSection } from './sections/ShippingSection';
import { RelationsSection } from './sections/RelationsSection';
import { BundleSection } from './sections/BundleSection';

export default function ProductForm() {
  const {
    rtl, id, loading,
    activeTab, setActiveTab,
    templateKey,
    categories, pages,
    formData, updateForm,
    specs, addSpec, removeSpec, updateSpec,
    images, setImages, removeImage, handleGalleryImageUpload,
    quantityPrices, addQuantityPrice, removeQuantityPrice, updateQuantityPrice,
    faqs, addFaq, removeFaq, updateFaq,
    fbtSearch, setFbtSearch, fbtResults, searchingFbt, fbtProductDetails, handleFbtSearch, addFbt, removeFbt,
    variants, addVariant, removeVariant, updateVariant, handleVariantImageUpload, removeVariantImage,
    dimensionsPreset, handleDimensionsPresetChange,
    productType, setProductType,
    bundleItems, setBundleItems, bundleSearch, setBundleSearch, bundleResults, setBundleResults, searchingBundle, setSearchingBundle,
    applyTemplate, saveProduct
  } = useProductFormState();

  return (
    <div className={`min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-white ${rtl ? 'font-arabic' : ''}`} dir={rtl ? 'rtl' : 'ltr'}>
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-[100] bg-[#f8fafc]/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 py-4 md:py-6 px-4 md:px-8 mb-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary-500 mb-2 font-black uppercase tracking-widest text-[10px]">
              <span className="w-6 h-[2px] bg-primary-500" />
              {rtl ? 'لوحة التحكم' : 'Inventory Management'}
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter">
              {id ? (rtl ? 'تعديل المنتج' : 'Refine Product') : (rtl ? 'إضافة منتج' : 'New Product')}
            </h1>
          </div>
          
          <StickyActionBar 
            rtl={rtl} 
            activeTab={activeTab} 
            loading={loading} 
            saveProduct={saveProduct} 
            productType={productType}
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-12 pb-32">
        {/* Navigation Sidebar */}
        <Sidebar rtl={rtl} activeTab={activeTab} setActiveTab={setActiveTab} productType={productType} />

        {/* Dynamic Canvas */}
        <main className="flex-grow min-w-0">
          
          {/* Product Type Mode Toggle */}
          <div className="flex bg-white dark:bg-[#111] p-1.5 rounded-[1.5rem] mb-8 shadow-xs border border-slate-200 dark:border-white/5 mx-auto max-w-4xl overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => { setProductType('simple'); }}
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-[1.1rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${productType === 'simple' ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              {rtl ? 'منتج عادي ثابت' : 'Simple Product'}
            </button>
            <button 
              onClick={() => {
                setProductType('variants');
                if (activeTab === 'pricing' || activeTab === 'media') setActiveTab('basic');
              }}
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-[1.1rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${productType === 'variants' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              {rtl ? 'متعدد النسخ' : 'Has Variations'}
            </button>
            <button 
              onClick={() => { setProductType('custom'); }}
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-[1.1rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${productType === 'custom' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              {rtl ? 'قابل للتخصيص' : 'Customizable'}
            </button>
            <button 
              onClick={() => { 
                setProductType('bundle'); 
                if (activeTab === 'pricing' || activeTab === 'media' || activeTab === 'specs') setActiveTab('basic');
              }}
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-[1.1rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${productType === 'bundle' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              {rtl ? 'باقة مجمعة' : 'Bundle'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeTab === 'basic' && (
                <BasicInfoSection 
                  rtl={rtl} categories={categories} pages={pages} 
                  formData={formData} updateForm={updateForm} 
                  applyTemplate={applyTemplate}
                  templateKey={templateKey}
                />
              )}
              {activeTab === 'pricing' && (
                <PricingSection 
                  rtl={rtl} formData={formData} updateForm={updateForm}
                  quantityPrices={quantityPrices} addQuantityPrice={addQuantityPrice}
                  updateQuantityPrice={updateQuantityPrice} removeQuantityPrice={removeQuantityPrice}
                />
              )}
              {activeTab === 'media' && (
                <MediaSection 
                  rtl={rtl} images={images} setImages={setImages}
                  handleGalleryImageUpload={handleGalleryImageUpload}
                  removeImage={removeImage} formData={formData} updateForm={updateForm}
                />
              )}
              {activeTab === 'specs' && (
                <SpecsSection 
                  rtl={rtl} variants={variants} addVariant={addVariant}
                  updateVariant={updateVariant} removeVariant={removeVariant}
                  handleVariantImageUpload={handleVariantImageUpload}
                  removeVariantImage={removeVariantImage}
                  specs={specs} addSpec={addSpec} updateSpec={updateSpec} removeSpec={removeSpec}
                  formData={formData} updateForm={updateForm}
                  dimensionsPreset={dimensionsPreset} handleDimensionsPresetChange={handleDimensionsPresetChange}
                  productType={productType}
                />
              )}
              {activeTab === 'shipping' && (
                <ShippingSection rtl={rtl} formData={formData} updateForm={updateForm} />
              )}
              {activeTab === 'relations' && (
                <RelationsSection 
                  rtl={rtl} faqs={faqs} addFaq={addFaq} updateFaq={updateFaq} removeFaq={removeFaq}
                  fbtSearch={fbtSearch} setFbtSearch={setFbtSearch} fbtResults={fbtResults}
                  searchingFbt={searchingFbt} handleFbtSearch={handleFbtSearch}
                  fbtProductDetails={fbtProductDetails} addFbt={addFbt} removeFbt={removeFbt}
                />
              )}
              {activeTab === 'bundle' && productType === 'bundle' && (
                <BundleSection
                  rtl={rtl}
                  bundleItems={bundleItems}
                  setBundleItems={setBundleItems}
                  bundleSearch={bundleSearch}
                  setBundleSearch={setBundleSearch}
                  bundleResults={bundleResults}
                  setBundleResults={setBundleResults}
                  searchingBundle={searchingBundle}
                  setSearchingBundle={setSearchingBundle}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Unified Global Save Button at Bottom */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 pt-12 border-t border-slate-200 dark:border-white/5 flex justify-end"
          >
            <button
              onClick={saveProduct}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all duration-300 bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <SaveIcon size={20} />}
              {productType === 'simple'
                ? (rtl ? 'حفظ المنتج العادي' : 'Save Simple Product')
                : productType === 'custom'
                  ? (rtl ? 'حفظ منتج التخصيص' : 'Save Custom Product')
                  : productType === 'bundle'
                    ? (rtl ? 'حفظ الباقة' : 'Save Bundle')
                    : (rtl ? 'حفظ النسخ المتعددة' : 'Save Product with Variations')}
            </button>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
