import { useTranslation } from 'react-i18next';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Check } from 'lucide-react';
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
  const [isInstalling, setIsInstalling] = useState(false);

  const isRTL = i18n.language === 'ar';

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
    if (!deferredPrompt) return;
    
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
          <div className="w-32 h-32 mx-auto mb-8 rounded-3xl overflow-hidden shadow-2xl border-2 border-border">
            <img 
              src="/favicon.jpg" 
              alt={c.appName} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* App Name */}
          <h2 className="text-4xl font-bold font-serif mb-3">{c.appName}</h2>
          <p className="text-muted-foreground mb-10">{c.subtitle}</p>

          {/* Install Button */}
          {isInstalled ? (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary/10 text-primary font-bold text-lg">
                <Check className="w-6 h-6" />
                {c.installed}
              </div>
              <div>
                <Button onClick={() => navigate('/')} size="lg" className="w-full text-lg h-14">
                  {c.goHome}
                </Button>
              </div>
            </div>
          ) : deferredPrompt ? (
            <div className="space-y-6">
              <Button 
                onClick={handleInstall} 
                size="lg" 
                className="w-full gap-3 text-xl h-16 rounded-2xl shadow-lg"
                disabled={isInstalling}
              >
                <Download className="w-6 h-6" />
                {isInstalling ? c.downloading : c.downloadBtn}
              </Button>
              <p className="text-sm text-muted-foreground">{c.features}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-2xl p-6 text-center">
                <p className="text-muted-foreground">
                  {i18n.language === 'ar' 
                    ? 'التطبيق متاح للتثبيت من المتصفح' 
                    : i18n.language === 'fr'
                    ? "L'application est disponible depuis le navigateur"
                    : 'The app is available from the browser'}
                </p>
              </div>
              <Button onClick={() => navigate('/')} variant="outline" size="lg" className="w-full h-14">
                {c.goHome}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}