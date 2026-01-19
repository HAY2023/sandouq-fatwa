import { useTranslation } from 'react-i18next';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Check, Monitor, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

// استيراد صور دليل التثبيت
import step1Main from '@/assets/install-guide/step1-main.png';
import step2Menu from '@/assets/install-guide/step2-menu.png';
import step3Install from '@/assets/install-guide/step3-install.png';
import step4App from '@/assets/install-guide/step4-app.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: settings, isLoading } = useSettings();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);
  const [currentGuideStep, setCurrentGuideStep] = useState(0);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const isRTL = i18n.language === 'ar';
  
  // صور دليل التثبيت للحاسوب
  const desktopGuideSteps = [
    { image: step1Main, title: isRTL ? 'افتح الموقع في المتصفح' : 'Open the website' },
    { image: step2Menu, title: isRTL ? 'اضغط على قائمة المتصفح' : 'Click browser menu' },
    { image: step3Install, title: isRTL ? 'اختر "تثبيت التطبيق"' : 'Choose "Install app"' },
    { image: step4App, title: isRTL ? 'التطبيق جاهز للاستخدام!' : 'App is ready!' },
  ];

  useEffect(() => {
    // فحص إذا كان التطبيق مثبت
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // فحص التثبيت الناجح
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    // إذا كان لدينا prompt، استخدمه
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Installation failed:', error);
      }
      setIsInstalling(false);
      return;
    }

    // إذا لم يتوفر prompt، أظهر دليل التثبيت
    setShowDesktopGuide(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (settings && !settings.show_install_page) {
    return <Navigate to="/" replace />;
  }

  const content = {
    ar: {
      title: 'تحميل التطبيق',
      appName: 'صندوق فتوى',
      subtitle: 'مسجد الإيمان – 150 مسكن',
      downloadBtn: 'تحميل التطبيق',
      downloading: 'جارٍ التحميل...',
      installed: 'تم التثبيت ✓',
      goHome: 'فتح التطبيق',
      features: 'يعمل بدون إنترنت • سريع • إشعارات فورية',
      showGuide: 'عرض دليل التثبيت',
    },
    fr: {
      title: "Télécharger l'app",
      appName: 'Boîte à Fatwas',
      subtitle: 'Mosquée Al-Iman – 150 Logements',
      downloadBtn: "Télécharger",
      downloading: 'Téléchargement...',
      installed: 'Installée ✓',
      goHome: "Ouvrir l'app",
      features: 'Fonctionne hors ligne • Rapide • Notifications',
      showGuide: 'Voir le guide',
    },
    en: {
      title: 'Download App',
      appName: 'Fatwa Box',
      subtitle: 'Al-Iman Mosque – 150 Housing',
      downloadBtn: 'Download App',
      downloading: 'Downloading...',
      installed: 'Installed ✓',
      goHome: 'Open App',
      features: 'Works offline • Fast • Instant notifications',
      showGuide: 'View Install Guide',
    },
  };

  const c = content[i18n.language as keyof typeof content] || content.ar;

  const nextStep = () => {
    if (currentGuideStep < desktopGuideSteps.length - 1) {
      setCurrentGuideStep(currentGuideStep + 1);
    }
  };

  const prevStep = () => {
    if (currentGuideStep > 0) {
      setCurrentGuideStep(currentGuideStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <h1 className="text-xl font-bold">{c.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setZoomedImage(null)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setZoomedImage(null)}
            >
              <X className="w-6 h-6" />
            </Button>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={zoomedImage}
              alt="Zoomed"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto w-full"
        >
          {/* App Icon */}
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-36 h-36 mx-auto mb-8 rounded-3xl overflow-hidden shadow-2xl border-4 border-primary/20 relative"
          >
            <img 
              src="/favicon.jpg" 
              alt={c.appName} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
          </motion.div>

          {/* App Name */}
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold font-serif mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            {c.appName}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-10"
          >
            {c.subtitle}
          </motion.p>

          {/* Install Button */}
          {isInstalled ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-lg border-2 border-green-500/20">
                <Check className="w-6 h-6" />
                {c.installed}
              </div>
              <div>
                <Button onClick={() => navigate('/')} size="lg" className="w-full text-lg h-14 rounded-xl">
                  {c.goHome}
                </Button>
              </div>
            </motion.div>
          ) : showDesktopGuide ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 w-full"
            >
              <div className="bg-card border-2 border-border rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2 justify-center">
                  <Monitor className="w-5 h-5 text-primary" />
                  {isRTL ? 'دليل التثبيت للحاسوب' : 'Desktop Install Guide'}
                </h3>
                
                {/* صورة الخطوة الحالية */}
                <div 
                  className="relative overflow-hidden rounded-xl border border-border cursor-pointer group"
                  onClick={() => setZoomedImage(desktopGuideSteps[currentGuideStep].image)}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentGuideStep}
                      src={desktopGuideSteps[currentGuideStep].image}
                      alt={desktopGuideSteps[currentGuideStep].title}
                      className="w-full h-auto"
                      initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                
                {/* عنوان الخطوة */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                      {currentGuideStep + 1}
                    </span>
                    {desktopGuideSteps[currentGuideStep].title}
                  </span>
                </div>
                
                {/* أزرار التنقل */}
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={prevStep}
                    disabled={currentGuideStep === 0}
                    className="gap-1"
                  >
                    {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    {isRTL ? 'السابق' : 'Previous'}
                  </Button>
                  
                  <div className="flex gap-1">
                    {desktopGuideSteps.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentGuideStep(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentGuideStep ? 'bg-primary w-6' : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={nextStep}
                    disabled={currentGuideStep === desktopGuideSteps.length - 1}
                    className="gap-1"
                  >
                    {isRTL ? 'التالي' : 'Next'}
                    {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  setShowDesktopGuide(false);
                  setCurrentGuideStep(0);
                }} 
                variant="outline" 
                size="lg" 
                className="w-full h-14 rounded-xl"
              >
                {i18n.language === 'ar' ? 'رجوع' : 'Back'}
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <Button 
                onClick={handleInstall} 
                size="lg" 
                className="w-full gap-3 text-xl h-20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                disabled={isInstalling}
              >
                <Download className="w-8 h-8" />
                {isInstalling ? c.downloading : c.downloadBtn}
              </Button>
              <p className="text-sm text-muted-foreground">{c.features}</p>
              
              {/* زر عرض دليل التثبيت للحاسوب */}
              <Button
                variant="outline"
                onClick={() => setShowDesktopGuide(true)}
                className="w-full gap-2"
              >
                <Monitor className="w-4 h-4" />
                {c.showGuide}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}