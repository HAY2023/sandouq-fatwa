import { useTranslation } from 'react-i18next';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Share, Plus, MoreVertical, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

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
  const [isIOS, setIsIOS] = useState(false);

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
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
      installed: 'التطبيق مثبت ✓',
      goHome: 'العودة للرئيسية',
      iosTitle: 'للتثبيت على iPhone:',
      iosStep1: 'اضغط على',
      iosStep2: 'ثم اختر',
      iosStep3: 'إضافة إلى الشاشة الرئيسية',
    },
    fr: {
      title: "Télécharger l'app",
      appName: 'Boîte à Fatwas',
      subtitle: 'Mosquée Al-Iman – 150 Logements',
      downloadBtn: "Télécharger l'application",
      installed: 'Application installée ✓',
      goHome: "Retour à l'accueil",
      iosTitle: 'Pour installer sur iPhone:',
      iosStep1: 'Appuyez sur',
      iosStep2: 'puis choisissez',
      iosStep3: "Ajouter à l'écran d'accueil",
    },
    en: {
      title: 'Download App',
      appName: 'Fatwa Box',
      subtitle: 'Al-Iman Mosque – 150 Housing',
      downloadBtn: 'Download App',
      installed: 'App Installed ✓',
      goHome: 'Go to Home',
      iosTitle: 'To install on iPhone:',
      iosStep1: 'Tap',
      iosStep2: 'then choose',
      iosStep3: 'Add to Home Screen',
    },
  };

  const c = content[i18n.language as keyof typeof content] || content.ar;

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center max-w-sm mx-auto">
          {/* App Icon */}
          <div className="w-28 h-28 mx-auto mb-6 rounded-3xl overflow-hidden shadow-xl border border-border">
            <img 
              src="/favicon.jpg" 
              alt={c.appName} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* App Name */}
          <h2 className="text-3xl font-bold font-serif mb-2">{c.appName}</h2>
          <p className="text-muted-foreground mb-8">{c.subtitle}</p>

          {/* Install Button or Status */}
          {isInstalled ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary font-medium">
                {c.installed}
              </div>
              <div>
                <Button onClick={() => navigate('/')} variant="outline" size="lg" className="w-full">
                  {c.goHome}
                </Button>
              </div>
            </div>
          ) : deferredPrompt ? (
            <Button onClick={handleInstall} size="lg" className="w-full gap-2">
              <Download className="w-5 h-5" />
              {c.downloadBtn}
            </Button>
          ) : isIOS ? (
            <div className="space-y-4">
              <div className="bg-muted rounded-xl p-6 text-start">
                <p className="font-medium mb-4">{c.iosTitle}</p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">1</span>
                    <span>{c.iosStep1}</span>
                    <Share className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">2</span>
                    <span>{c.iosStep2}</span>
                    <Plus className="w-4 h-4 text-primary" />
                    <span>{c.iosStep3}</span>
                  </div>
                </div>
              </div>
              <Button onClick={() => navigate('/')} variant="outline" size="lg" className="w-full">
                {c.goHome}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted rounded-xl p-6 text-start">
                <p className="font-medium mb-4">
                  {i18n.language === 'ar' ? 'للتثبيت:' : i18n.language === 'fr' ? 'Pour installer:' : 'To install:'}
                </p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">1</span>
                    <span>
                      {i18n.language === 'ar' ? 'اضغط على' : i18n.language === 'fr' ? 'Appuyez sur' : 'Tap'}
                    </span>
                    <MoreVertical className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">2</span>
                    <span>
                      {i18n.language === 'ar' ? 'اختر "تثبيت التطبيق"' : i18n.language === 'fr' ? 'Choisissez "Installer"' : 'Choose "Install app"'}
                    </span>
                  </div>
                </div>
              </div>
              <Button onClick={() => navigate('/')} variant="outline" size="lg" className="w-full">
                {c.goHome}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
