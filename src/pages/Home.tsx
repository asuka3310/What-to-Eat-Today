import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Roulette } from '../components/Roulette';
import { A2HSTooltip } from '../components/A2HSTooltip';
import { MapPin, Navigation, Globe, Filter, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_CATEGORIES, Category } from '../constants';

export const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeCategories, setActiveCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  const handleResult = (category: Category) => {
    setSelectedCategory(category);
    setTimeout(() => {
      setShowLocationPrompt(true);
    }, 1000);
  };

  const toggleLanguage = () => {
    const current = i18n.language;
    if (current.startsWith('zh')) {
      i18n.changeLanguage('en');
    } else if (current.startsWith('en')) {
      i18n.changeLanguage('ja');
    } else {
      i18n.changeLanguage('zh-TW');
    }
  };

  const getLanguageName = () => {
    if (i18n.language.startsWith('zh')) return '繁體中文';
    if (i18n.language.startsWith('en')) return 'English';
    if (i18n.language.startsWith('ja')) return '日本語';
    return 'Language';
  };

  const handleOpenMaps = () => {
    if (!selectedCategory) return;
    setShowLocationPrompt(false);
    
    // Construct Google Maps URL
    const foodName = selectedCategory.isCustom && selectedCategory.customName 
      ? selectedCategory.customName 
      : t(`categories.${selectedCategory.id}`);
      
    const query = encodeURIComponent(foodName);
    
    // Try to get location for better results, but don't block on it
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Open Google Maps with query and location context
          window.open(`https://www.google.com/maps/search/?api=1&query=${query}&center=${latitude},${longitude}`, '_blank');
        },
        (error) => {
          console.warn('Location access denied or error:', error);
          // Fallback to simple query
          window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
        },
        { timeout: 3000 }
      );
    } else {
      // Fallback for no geolocation support
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  const toggleCategory = (category: Category) => {
    setActiveCategories(prev => {
      const exists = prev.find(c => c.id === category.id);
      if (exists) {
        // Don't allow removing the last category
        if (prev.length <= 1) return prev;
        return prev.filter(c => c.id !== category.id);
      } else {
        return [...prev, category];
      }
    });
  };

  const isCategoryActive = (id: string) => activeCategories.some(c => c.id === id);

  const selectAll = () => setActiveCategories(DEFAULT_CATEGORIES);
  const deselectAll = () => {
    // Keep at least one random category to prevent empty state
    const random = DEFAULT_CATEGORIES[Math.floor(Math.random() * DEFAULT_CATEGORIES.length)];
    setActiveCategories([random]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-between pb-10 pt-safe">
      {/* Header */}
      <header className="w-full px-6 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          {t('title')}
        </h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFilter(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600 active:scale-95 transition-transform"
          >
            <Filter size={18} />
          </button>
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600 text-sm font-medium active:scale-95 transition-transform"
          >
            <Globe size={16} />
            <span>{getLanguageName()}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-4">
        <Roulette categories={activeCategories} onResult={handleResult} />
        
        {/* Result Display */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 text-center"
            >
              <p className="text-slate-500 font-medium mb-1">今天吃</p>
              <h2 className="text-4xl font-black text-slate-800">
                {selectedCategory.isCustom && selectedCategory.customName 
                  ? selectedCategory.customName 
                  : t(`categories.${selectedCategory.id}`)}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <A2HSTooltip />

      {/* Footer */}
      <footer className="w-full py-4 text-center">
        <p className="text-slate-400 text-xs font-medium tracking-wide">
          Created by Autumn Snow
        </p>
      </footer>

      {/* Location Prompt Modal */}
      <AnimatePresence>
        {showLocationPrompt && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowLocationPrompt(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Navigation size={32} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-center text-slate-800 mb-2">
                {t('locationPrompt.title', { 
                  food: selectedCategory.isCustom && selectedCategory.customName 
                    ? selectedCategory.customName 
                    : t(`categories.${selectedCategory.id}`) 
                })}
              </h3>
              <p className="text-center text-slate-600 mb-8 leading-relaxed">
                {t('locationPrompt.desc')}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleOpenMaps}
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <MapPin size={20} />
                  {t('locationPrompt.allow')}
                </button>
                <button
                  onClick={() => setShowLocationPrompt(false)}
                  className="w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-xl active:scale-95 transition-transform"
                >
                  {t('locationPrompt.deny')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilter && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowFilter(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md h-[80vh] sm:h-[70vh] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">
                  {t('filter.title', '篩選食物')}
                </h3>
                <button 
                  onClick={() => setShowFilter(false)}
                  className="p-2 -mr-2 text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-4 flex gap-3 border-b border-slate-100 bg-slate-50/50">
                <button 
                  onClick={selectAll}
                  className="flex-1 py-2 px-4 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 shadow-sm active:scale-95 transition-transform"
                >
                  {t('filter.selectAll', '全選')}
                </button>
                <button 
                  onClick={deselectAll}
                  className="flex-1 py-2 px-4 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 shadow-sm active:scale-95 transition-transform"
                >
                  {t('filter.deselectAll', '取消全選')}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-3">
                  {DEFAULT_CATEGORIES.map(category => {
                    const isActive = isCategoryActive(category.id);
                    return (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(category)}
                        className={`
                          relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all
                          ${isActive 
                            ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm' 
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}
                        `}
                      >
                        <div 
                          className="w-3 h-3 rounded-full shrink-0" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-sm truncate">
                          {t(`categories.${category.id}`)}
                        </span>
                        {isActive && (
                          <div className="absolute top-2 right-2 text-blue-500">
                            <Check size={14} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100">
                <button
                  onClick={() => setShowFilter(false)}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl active:scale-95 transition-transform"
                >
                  {t('filter.confirm', '確認')} ({activeCategories.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
