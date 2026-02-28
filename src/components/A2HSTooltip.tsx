import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Share, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const A2HSTooltip: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null);

  useEffect(() => {
    // Check if already installed or dismissed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const hasDismissed = localStorage.getItem('a2hs-dismissed');

    if (isStandalone || hasDismissed) {
      return;
    }

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIOS) {
      setPlatform('ios');
      // Show tooltip after a short delay
      setTimeout(() => setIsVisible(true), 2000);
    } else if (isAndroid) {
      setPlatform('android');
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem('a2hs-dismissed', 'true');
  };

  if (!platform) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 ${
            platform === 'ios' ? 'bottom-8' : 'top-4'
          }`}
        >
          <button
            onClick={dismiss}
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-start gap-4 pr-6">
            <div className="bg-slate-100 p-3 rounded-xl flex-shrink-0">
              {platform === 'ios' ? <Share size={24} className="text-blue-500" /> : <MoreVertical size={24} className="text-slate-600" />}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800 leading-relaxed">
                {t(`a2hs.${platform}`)}
              </p>
              <button
                onClick={dismiss}
                className="mt-3 text-sm font-bold text-blue-600"
              >
                {t('a2hs.dismiss')}
              </button>
            </div>
          </div>
          
          {/* Pointer arrow for iOS */}
          {platform === 'ios' && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-slate-100 transform rotate-45" />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
