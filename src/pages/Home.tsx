import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Roulette } from '../components/Roulette';
import { A2HSTooltip } from '../components/A2HSTooltip';
import { MapPin, Navigation, Globe, Filter, X, Check, Share2, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_CATEGORIES, Category } from '../constants';

const STORAGE_KEY_CUSTOM = 'food-spinner-custom-categories';
const STORAGE_KEY_ACTIVE = 'food-spinner-active-categories';

export const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  
  // Initialize state from localStorage if available
  const [customCategories, setCustomCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [activeCategories, setActiveCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure we have at least one valid category
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [newCategoryName, setNewCategoryName] = useState('');

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customCategories));
  }, [customCategories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(activeCategories));
  }, [activeCategories]);

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

  const handleShare = async () => {
    const shareData = {
      title: '晚餐吃什麼轉盤｜選擇困難症救星',
      text: '不知道下一餐吃什麼？點擊吃什麼轉盤隨機決定！',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('網址已複製到剪貼簿！');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
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

  const selectAll = () => setActiveCategories(allCategories);
  const deselectAll = () => {
    // Keep at least one random category to prevent empty state
    const random = allCategories[Math.floor(Math.random() * allCategories.length)];
    setActiveCategories([random]);
  };

  const handleAddCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#6C5CE7', '#FF7675', '#E17055', '#00B894', '#FF9F43', '#54A0FF', '#5F27CD', '#FF4757', '#2ED573', '#FFA502', '#3742FA', '#FF7F50', '#2F3542', '#7BED9F', '#ECCC68', '#FF6348'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newCategory: Category = {
      id: `custom-${Date.now()}`,
      color: randomColor,
      isCustom: true,
      customName: newCategoryName.trim()
    };
    
    setCustomCategories(prev => [...prev, newCategory]);
    setActiveCategories(prev => [...prev, newCategory]);
    setNewCategoryName('');
  };

  const handleDeleteCustomCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomCategories(prev => prev.filter(c => c.id !== id));
    setActiveCategories(prev => {
      const newActive = prev.filter(c => c.id !== id);
      if (newActive.length === 0) {
        return [DEFAULT_CATEGORIES[0]];
      }
      return newActive;
    });
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
            onClick={handleShare}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600 active:scale-95 transition-transform"
            aria-label="Share"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={() => setShowFilter(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600 active:scale-95 transition-transform"
            aria-label="Filter"
          >
            <Filter size={18} />
          </button>
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600 text-sm font-medium active:scale-95 transition-transform"
          >
            <Globe size={16} />
            <span className="hidden sm:inline">{getLanguageName()}</span>
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
              className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md h-[85vh] sm:h-[80vh] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
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
              
              <div className="p-4 flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                {/* Add Custom Option Form */}
                <form onSubmit={handleAddCustomCategory} className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={t('filter.addCustom', '新增自訂選項...')}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    maxLength={15}
                  />
                  <button
                    type="submit"
                    disabled={!newCategoryName.trim()}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform flex items-center gap-1"
                  >
                    <Plus size={16} />
                    {t('filter.add', '新增')}
                  </button>
                </form>

                <div className="flex gap-3">
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
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-3">
                  {allCategories.map(category => {
                    const isActive = isCategoryActive(category.id);
                    return (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(category)}
                        className={`
                          relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all group
                          ${isActive 
                            ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm' 
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}
                        `}
                      >
                        <div 
                          className="w-3 h-3 rounded-full shrink-0" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-sm truncate pr-10">
                          {category.isCustom && category.customName 
                            ? category.customName 
                            : t(`categories.${category.id}`)}
                        </span>
                        
                        <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1">
                          {isActive && (
                            <div className="text-blue-500 p-1">
                              <Check size={14} />
                            </div>
                          )}
                          
                          {category.isCustom && (
                            <div 
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              onClick={(e) => handleDeleteCustomCategory(category.id, e)}
                            >
                              <Trash2 size={14} />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 shrink-0">
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
