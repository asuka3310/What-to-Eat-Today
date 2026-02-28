import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Roulette } from '../components/Roulette';
import { A2HSTooltip } from '../components/A2HSTooltip';
import { MapPin, Navigation, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const handleResult = (category: string) => {
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
    setShowLocationPrompt(false);
    
    // Construct Google Maps URL
    const foodName = t(`categories.${selectedCategory}`);
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-between pb-10 pt-safe">
      {/* Header */}
      <header className="w-full px-6 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          {t('title')}
        </h1>
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600 text-sm font-medium active:scale-95 transition-transform"
        >
          <Globe size={16} />
          <span>{getLanguageName()}</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-4">
        <Roulette onResult={handleResult} />
        
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
                {t(`categories.${selectedCategory}`)}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <A2HSTooltip />

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
                {t('locationPrompt.title', { food: t(`categories.${selectedCategory}`) })}
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
    </div>
  );
};
