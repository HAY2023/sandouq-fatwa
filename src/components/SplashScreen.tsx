import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export function SplashScreen({ onComplete, duration = 2000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // شريط التقدم
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, duration / 20);

    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 50%, hsl(var(--background)) 100%)'
          }}
        >
          {/* خلفية النمط الإسلامي */}
          <div className="absolute inset-0 islamic-pattern opacity-10" />
          
          {/* تأثير التوهج */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute w-64 h-64 rounded-full bg-primary/20 blur-[80px]"
          />
          
          {/* حاوية المحتوى الرئيسية */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: 'spring',
              stiffness: 200,
              damping: 20,
              delay: 0.1 
            }}
            className="relative z-10 flex flex-col items-center gap-8"
          >
            {/* الشعار مع تأثير نبض خفيف */}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="relative"
            >
              {/* حلقة التوهج */}
              <motion.div
                animate={{ 
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-primary/30 to-accent/30 blur-xl"
              />
              
              {/* الشعار */}
              <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-card border-2 border-border shadow-2xl flex items-center justify-center overflow-hidden">
                <img 
                  src="/favicon.jpg" 
                  alt="صندوق فتوى" 
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </motion.div>

            {/* اسم التطبيق */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground font-serif mb-2">
                صندوق فتوى
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">
                مسجد الإيمان – 150 مسكن
              </p>
            </motion.div>

            {/* شريط التحميل */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '200px' }}
              transition={{ delay: 0.5 }}
              className="relative h-1.5 bg-border/50 rounded-full overflow-hidden"
              style={{ width: '200px' }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </motion.div>
          </motion.div>

          {/* رسالة التحميل */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-16 text-sm text-muted-foreground"
          >
            جارٍ التحميل...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
