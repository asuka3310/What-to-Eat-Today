import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Share, MoreVertical, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Add type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

export const A2HSTooltip: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const hasDismissed = localStorage.getItem('a2hs-dismissed');
      if (!hasDismissed) {
        setPlatform('desktop');
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed or dismissed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const hasDismissed = localStorage.getItem('a2hs-dismissed');

    if (isStandalone || hasDismissed) {
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    // Detect platform for manual instructions if beforeinstallprompt is not supported (like iOS Safari)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    // If it's iOS Safari, beforeinstallprompt is not supported, so we show manual instructions
    if (isIOS && !isStandalone) {
      setPlatform('ios');
      setTimeout(() => setIsVisible(true), 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsVisible(false);
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem('a2hs-dismissed', 'true');
  };

  if (!isVisible || !platform) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 ${
            platform === 'ios' ? 'bottom-8' : 'bottom-8 max-w-sm mx-auto'
          }`}
        >
          <button
            onClick={dismiss}
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-start gap-4 pr-6">
            <div className="bg-blue-50 p-3 rounded-xl flex-shrink-0">
              {deferredPrompt ? (
                <Download size={24} className="text-blue-500" />
              ) : platform === 'ios' ? (
                <Share size={24} className="text-blue-500" />
              ) : (
                <MoreVertical size={24} className="text-slate-600" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 mb-1">
                {deferredPrompt ? t('a2hs.installTitle') : t('a2hs.addTitle')}
              </h4>
              <p className="text-sm font-medium text-slate-600 leading-relaxed mb-3">
                {deferredPrompt 
                  ? t('a2hs.installDesc')
                  : t(`a2hs.${platform}`)}
              </p>
              
              <div className="flex gap-2">
                {deferredPrompt ? (
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-lg active:scale-95 transition-transform"
                  >
                    {t('a2hs.installBtn')}
                  </button>
                ) : null}
                <button
                  onClick={dismiss}
                  className={`text-sm font-bold py-2 px-4 rounded-lg active:scale-95 transition-transform ${
                    deferredPrompt ? 'bg-slate-100 text-slate-600' : 'text-blue-600 p-0'
                  }`}
                >
                  {t('a2hs.dismiss')}
                </button>
              </div>
            </div>
          </div>
          
          {/* Pointer arrow for iOS */}
          {platform === 'ios' && !deferredPrompt && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-slate-100 transform rotate-45" />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
