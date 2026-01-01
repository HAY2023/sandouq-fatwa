import { useTranslation } from 'react-i18next';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Monitor, Apple, Chrome } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const { t, i18n } = useTranslation();
  const { data: settings, isLoading } = useSettings();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if install page is disabled
  if (settings && !settings.show_install_page) {
    return <Navigate to="/" replace />;
  }

  const isRTL = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-card border-b border-border py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">
            {isRTL ? 'تثبيت التطبيق' : 'Install App'}
          </h1>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {isInstalled ? (
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <Download className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-foreground">
                {isRTL ? 'التطبيق مثبت بالفعل!' : 'App Already Installed!'}
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'يمكنك الآن استخدام التطبيق من الشاشة الرئيسية'
                  : 'You can now use the app from your home screen'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/'}>
                {isRTL ? 'العودة للرئيسية' : 'Go to Home'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Main Install Card */}
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Smartphone className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-2xl text-foreground">
                  {isRTL ? 'ثبّت التطبيق على جهازك' : 'Install the App on Your Device'}
                </CardTitle>
                <CardDescription className="text-base">
                  {isRTL 
                    ? 'احصل على تجربة أفضل مع إشعارات فورية ووصول سريع'
                    : 'Get a better experience with instant notifications and quick access'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {deferredPrompt && (
                  <Button onClick={handleInstall} className="w-full" size="lg">
                    <Download className="w-5 h-5 me-2" />
                    {isRTL ? 'تثبيت الآن' : 'Install Now'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* iOS Instructions */}
            {isIOS && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <Apple className="w-6 h-6 text-foreground" />
                    </div>
                    <CardTitle className="text-lg text-foreground">
                      {isRTL ? 'التثبيت على iPhone/iPad' : 'Install on iPhone/iPad'}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                    <li>{isRTL ? 'اضغط على زر المشاركة في Safari' : 'Tap the Share button in Safari'}</li>
                    <li>{isRTL ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Select "Add to Home Screen"'}</li>
                    <li>{isRTL ? 'اضغط "إضافة" للتأكيد' : 'Tap "Add" to confirm'}</li>
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Android Instructions */}
            {isAndroid && !deferredPrompt && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Chrome className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-lg text-foreground">
                      {isRTL ? 'التثبيت على Android' : 'Install on Android'}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                    <li>{isRTL ? 'اضغط على قائمة المتصفح (⋮)' : 'Tap the browser menu (⋮)'}</li>
                    <li>{isRTL ? 'اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"' : 'Select "Install app" or "Add to Home screen"'}</li>
                    <li>{isRTL ? 'اضغط "تثبيت" للتأكيد' : 'Tap "Install" to confirm'}</li>
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Desktop Instructions */}
            {!isIOS && !isAndroid && !deferredPrompt && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Monitor className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg text-foreground">
                      {isRTL ? 'التثبيت على الكمبيوتر' : 'Install on Desktop'}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                    <li>{isRTL ? 'ابحث عن أيقونة التثبيت في شريط العنوان' : 'Look for the install icon in the address bar'}</li>
                    <li>{isRTL ? 'اضغط على الأيقونة واختر "تثبيت"' : 'Click the icon and select "Install"'}</li>
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-foreground">
                  {isRTL ? 'مميزات التطبيق' : 'App Benefits'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    {isRTL ? 'وصول سريع من الشاشة الرئيسية' : 'Quick access from home screen'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    {isRTL ? 'يعمل بدون إنترنت' : 'Works offline'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    {isRTL ? 'تحميل أسرع' : 'Faster loading'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    {isRTL ? 'تجربة مستخدم أفضل' : 'Better user experience'}
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Back Button */}
            <div className="text-center">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}