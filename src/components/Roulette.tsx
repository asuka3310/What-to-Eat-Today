import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import { Category } from '../constants';

interface RouletteProps {
  categories: Category[];
  onResult: (category: Category) => void;
}

export const Roulette: React.FC<RouletteProps> = ({ categories, onResult }) => {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const controls = useAnimation();
  const currentRotation = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastSoundRotation = useRef(0);
  const sliceAngle = 360 / categories.length;

  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
    
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);
    
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  const playTickSound = () => {
    try {
      if (!audioCtxRef.current) return;
      
      const oscillator = audioCtxRef.current.createOscillator();
      const gainNode = audioCtxRef.current.createGain();
      
      // Use sine wave for a soft, pure tone
      oscillator.type = 'sine';
      
      // Lower pitch (300Hz -> 150Hz) for a "woodblock" or "bubble" like sound
      // Much more relaxing than the previous high-pitched tick
      const now = audioCtxRef.current.currentTime;
      oscillator.frequency.setValueAtTime(300, now);
      oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      
      // Lower volume and soft envelope
      gainNode.gain.setValueAtTime(0.03, now); // Very quiet (3% volume)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtxRef.current.destination);
      
      oscillator.start();
      oscillator.stop(now + 0.08);
    } catch (e) {
      // Ignore audio errors
    }
  };

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(8); // Shorter, lighter vibration
    }
  };

  const handleAnimationUpdate = (latest: any) => {
    if (typeof latest.rotate === 'number') {
      const currentStep = Math.floor(latest.rotate / sliceAngle);
      const lastStep = Math.floor(lastSoundRotation.current / sliceAngle);
      
      if (currentStep > lastStep) {
        playTickSound();
        triggerHaptic();
      }
      lastSoundRotation.current = latest.rotate;
    }
  };

  const spin = async () => {
    if (isSpinning || categories.length === 0) return;
    setIsSpinning(true);

    const randomIndex = Math.floor(Math.random() * categories.length);
    const selectedCategory = categories[randomIndex];
    
    // Reset sound tracking
    lastSoundRotation.current = currentRotation.current;
    
    const spins = 5;
    const baseRotation = spins * 360;
    const targetAngle = 360 - (randomIndex * sliceAngle + sliceAngle / 2);
    const randomOffset = (Math.random() - 0.5) * (sliceAngle * 0.8);
    
    const finalRotation = currentRotation.current + baseRotation + targetAngle + randomOffset - (currentRotation.current % 360);
    
    // We no longer use setInterval for sound. 
    // Instead, we use the onUpdate callback in the motion component to sync sound with rotation.

    await controls.start({
      rotate: finalRotation,
      transition: {
        duration: 5,
        ease: [0.2, 0.8, 0.2, 1], // Cubic-bezier for smooth easing
      },
    });

    currentRotation.current = finalRotation;
    setIsSpinning(false);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [selectedCategory.color, '#ffffff', '#f1c40f']
    });
    
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }

    setTimeout(() => {
      onResult(selectedCategory);
    }, 800);
  };

  const renderWheel = () => {
    const numSlices = categories.length;
    if (numSlices === 0) return null;
    
    const sliceAngle = 360 / numSlices;
    const radius = 50;
    const center = 50;

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full rounded-full drop-shadow-xl">
        <g transform={`rotate(-90 ${center} ${center})`}>
          {categories.map((cat, index) => {
            const startAngle = index * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            
            const startX = center + radius * Math.cos((startAngle * Math.PI) / 180);
            const startY = center + radius * Math.sin((startAngle * Math.PI) / 180);
            const endX = center + radius * Math.cos((endAngle * Math.PI) / 180);
            const endY = center + radius * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = sliceAngle > 180 ? 1 : 0;
            const pathData = [
              `M ${center} ${center}`,
              `L ${startX} ${startY}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              'Z'
            ].join(' ');

            const textAngle = startAngle + sliceAngle / 2;
            // Push text further out for better visibility with many slices
            const textRadius = radius * 0.88; 
            const textX = center + textRadius * Math.cos((textAngle * Math.PI) / 180);
            const textY = center + textRadius * Math.sin((textAngle * Math.PI) / 180);
            const isLeft = textAngle > 90 && textAngle < 270;

            const label = cat.isCustom ? (cat.customName || cat.id) : t(`categories.${cat.id}`);

            return (
              <g key={cat.id + index}>
                <path d={pathData} fill={cat.color} stroke="#ffffff" strokeWidth="0.2" />
                <text
                  x={textX}
                  y={textY}
                  fill="white"
                  fontSize={numSlices > 20 ? "2" : "3"} // Adjust font size based on slice count
                  fontWeight="bold"
                  textAnchor={isLeft ? "start" : "end"}
                  dominantBaseline="middle"
                  transform={`rotate(${isLeft ? textAngle + 180 : textAngle} ${textX} ${textY})`}
                  style={{ textShadow: '0px 0.5px 1px rgba(0,0,0,0.8)' }}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </g>
        <circle cx={center} cy={center} r="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
        <circle cx={center} cy={center} r="3" fill="#cbd5e1" />
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-[340px] aspect-square mx-auto mt-8">
        <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 z-10 drop-shadow-md">
          <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 40L0 0H30L15 40Z" fill="#1e293b"/>
            <path d="M15 35L3 2H27L15 35Z" fill="#334155"/>
          </svg>
        </div>
        
        <motion.div
          className="w-full h-full rounded-full border-4 border-white shadow-2xl bg-white"
          animate={controls}
          initial={{ rotate: 0 }}
          style={{ transformOrigin: 'center center' }}
          onUpdate={handleAnimationUpdate}
        >
          {renderWheel()}
        </motion.div>
      </div>

      <div className="mt-12">
        <button
          onClick={spin}
          disabled={isSpinning}
          className="bg-slate-900 text-white px-12 py-4 rounded-full font-bold text-xl shadow-[0_8px_0_0_#0f172a] active:shadow-[0_0px_0_0_#0f172a] active:translate-y-[8px] transition-all disabled:opacity-50 disabled:active:shadow-[0_8px_0_0_#0f172a] disabled:active:translate-y-0"
        >
          {isSpinning ? t('spinning') : t('spin')}
        </button>
      </div>
    </div>
  );
};
