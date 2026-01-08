import { useTranslation } from 'react-i18next';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Download, Smartphone, Monitor, Apple, Chrome, 
  Tv, Watch, Laptop, CheckCircle2, Wifi, Bell, Zap,
  ArrowLeft
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: settings, isLoading } = useSettings();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [isWindows, setIsWindows] = useState(false);

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));
    setIsMac(/macintosh|mac os/.test(userAgent) && !('ontouchend' in document));
    setIsWindows(/windows/.test(userAgent));

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
      title: 'تثبيت التطبيق',
      mainTitle: 'ثبّت التطبيق على جهازك',
      mainDesc: 'احصل على تجربة أفضل مع إشعارات فورية ووصول سريع',
      installNow: 'تثبيت الآن',
      installed: 'التطبيق مثبت بالفعل!',
      installedDesc: 'يمكنك الآن استخدام التطبيق من الشاشة الرئيسية',
      goHome: 'العودة للرئيسية',
      
      // الهاتف
      phone: 'الهاتف الذكي',
      iosTitle: 'iPhone / iPad',
      iosSteps: [
        'افتح الموقع في متصفح Safari',
        'اضغط على زر المشاركة (المربع مع السهم للأعلى)',
        'اختر "إضافة إلى الشاشة الرئيسية"',
        'اضغط "إضافة" للتأكيد'
      ],
      androidTitle: 'Android',
      androidSteps: [
        'افتح الموقع في Chrome أو أي متصفح حديث',
        'اضغط على قائمة المتصفح (⋮)',
        'اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"',
        'اضغط "تثبيت" للتأكيد'
      ],
      
      // الحاسوب
      computer: 'الحاسوب',
      windowsTitle: 'Windows',
      windowsSteps: [
        'افتح الموقع في Chrome أو Edge',
        'ابحث عن أيقونة التثبيت في شريط العنوان (كمبيوتر مع سهم)',
        'اضغط على الأيقونة واختر "تثبيت"',
        'سيظهر التطبيق في قائمة البرامج وسطح المكتب'
      ],
      macTitle: 'Mac',
      macSteps: [
        'افتح الموقع في Chrome أو Safari',
        'في Chrome: ابحث عن أيقونة التثبيت في شريط العنوان',
        'في Safari: اذهب إلى ملف > إضافة إلى Dock',
        'سيظهر التطبيق في Launchpad'
      ],
      linuxTitle: 'Linux',
      linuxSteps: [
        'افتح الموقع في Chrome أو Chromium',
        'اضغط على النقاط الثلاث في الزاوية',
        'اختر "تثبيت صندوق الفتوى..."',
        'سيظهر التطبيق في قائمة التطبيقات'
      ],
      
      // الساعة الذكية
      smartwatch: 'الساعة الذكية',
      wearosTitle: 'WearOS (Samsung/Google)',
      wearosSteps: [
        'افتح المتصفح على ساعتك',
        'اذهب إلى الموقع',
        'اضغط مطولاً واختر "إضافة للشاشة الرئيسية"',
        'ملاحظة: بعض الميزات قد تكون محدودة'
      ],
      applewatchTitle: 'Apple Watch',
      applewatchSteps: [
        'Apple Watch لا تدعم تطبيقات الويب مباشرة',
        'استخدم iPhone للوصول للتطبيق',
        'يمكنك إضافة اختصار من iPhone للوصول السريع'
      ],
      
      // التلفاز
      smarttv: 'التلفاز الذكي',
      androidtvTitle: 'Android TV',
      androidtvSteps: [
        'افتح متصفح الويب على التلفاز',
        'اكتب عنوان الموقع',
        'أضف الصفحة للمفضلة للوصول السريع',
        'بعض الأجهزة تدعم إضافة اختصار للشاشة الرئيسية'
      ],
      samsungtvTitle: 'Samsung Smart TV',
      samsungtvSteps: [
        'افتح متصفح الإنترنت Samsung',
        'اذهب للموقع وأضفه للمفضلة',
        'يمكنك الوصول السريع من قائمة المفضلة'
      ],
      lgtvTitle: 'LG WebOS',
      lgtvSteps: [
        'افتح متصفح LG Web Browser',
        'اذهب للموقع واحفظه في الإشارات المرجعية',
        'الوصول السريع من الإشارات المرجعية'
      ],
      
      // المميزات
      benefits: 'مميزات التطبيق',
      benefit1: 'وصول سريع من الشاشة الرئيسية',
      benefit2: 'يعمل بدون إنترنت (حفظ الأسئلة)',
      benefit3: 'إشعارات فورية للجلسات الجديدة',
      benefit4: 'تحميل أسرع وأداء أفضل',
    },
    fr: {
      title: "Installer l'application",
      mainTitle: "Installez l'application sur votre appareil",
      mainDesc: "Profitez de notifications instantanées et d'un accès rapide",
      installNow: 'Installer maintenant',
      installed: 'Application déjà installée !',
      installedDesc: "Vous pouvez utiliser l'application depuis l'écran d'accueil",
      goHome: "Retour à l'accueil",
      
      phone: 'Smartphone',
      iosTitle: 'iPhone / iPad',
      iosSteps: [
        'Ouvrez le site dans Safari',
        'Appuyez sur le bouton Partager',
        'Sélectionnez "Sur l\'écran d\'accueil"',
        'Confirmez en appuyant sur "Ajouter"'
      ],
      androidTitle: 'Android',
      androidSteps: [
        'Ouvrez le site dans Chrome',
        'Appuyez sur le menu (⋮)',
        'Sélectionnez "Installer l\'application"',
        'Confirmez l\'installation'
      ],
      
      computer: 'Ordinateur',
      windowsTitle: 'Windows',
      windowsSteps: [
        'Ouvrez le site dans Chrome ou Edge',
        "Cherchez l'icône d'installation dans la barre d'adresse",
        'Cliquez et sélectionnez "Installer"',
        "L'application apparaîtra dans le menu Démarrer"
      ],
      macTitle: 'Mac',
      macSteps: [
        'Ouvrez le site dans Chrome ou Safari',
        "Dans Chrome: cherchez l'icône d'installation",
        'Dans Safari: Fichier > Ajouter au Dock',
        "L'application apparaîtra dans Launchpad"
      ],
      linuxTitle: 'Linux',
      linuxSteps: [
        'Ouvrez le site dans Chrome',
        'Cliquez sur les trois points',
        'Sélectionnez "Installer..."',
        "L'application apparaîtra dans vos applications"
      ],
      
      smartwatch: 'Montre connectée',
      wearosTitle: 'WearOS',
      wearosSteps: [
        'Ouvrez le navigateur sur votre montre',
        'Accédez au site',
        "Ajoutez à l'écran d'accueil",
        'Note: fonctionnalités limitées'
      ],
      applewatchTitle: 'Apple Watch',
      applewatchSteps: [
        "Apple Watch ne supporte pas les apps web",
        "Utilisez l'iPhone pour accéder à l'app",
        'Créez un raccourci depuis iPhone'
      ],
      
      smarttv: 'Smart TV',
      androidtvTitle: 'Android TV',
      androidtvSteps: [
        'Ouvrez le navigateur web',
        "Entrez l'adresse du site",
        'Ajoutez aux favoris',
        'Accès rapide depuis les favoris'
      ],
      samsungtvTitle: 'Samsung TV',
      samsungtvSteps: [
        'Ouvrez Samsung Internet',
        'Ajoutez le site aux favoris',
        'Accès rapide depuis les favoris'
      ],
      lgtvTitle: 'LG WebOS',
      lgtvSteps: [
        'Ouvrez LG Web Browser',
        'Ajoutez aux signets',
        'Accès depuis les signets'
      ],
      
      benefits: 'Avantages',
      benefit1: "Accès rapide depuis l'écran d'accueil",
      benefit2: 'Fonctionne hors ligne',
      benefit3: 'Notifications instantanées',
      benefit4: 'Chargement plus rapide',
    },
    en: {
      title: 'Install App',
      mainTitle: 'Install the App on Your Device',
      mainDesc: 'Get instant notifications and quick access',
      installNow: 'Install Now',
      installed: 'App Already Installed!',
      installedDesc: 'You can now use the app from your home screen',
      goHome: 'Go to Home',
      
      phone: 'Smartphone',
      iosTitle: 'iPhone / iPad',
      iosSteps: [
        'Open the site in Safari',
        'Tap the Share button',
        'Select "Add to Home Screen"',
        'Tap "Add" to confirm'
      ],
      androidTitle: 'Android',
      androidSteps: [
        'Open the site in Chrome',
        'Tap the menu (⋮)',
        'Select "Install app"',
        'Confirm installation'
      ],
      
      computer: 'Computer',
      windowsTitle: 'Windows',
      windowsSteps: [
        'Open the site in Chrome or Edge',
        'Look for the install icon in the address bar',
        'Click and select "Install"',
        'App will appear in Start Menu'
      ],
      macTitle: 'Mac',
      macSteps: [
        'Open the site in Chrome or Safari',
        'In Chrome: look for install icon',
        'In Safari: File > Add to Dock',
        'App will appear in Launchpad'
      ],
      linuxTitle: 'Linux',
      linuxSteps: [
        'Open the site in Chrome',
        'Click the three dots menu',
        'Select "Install..."',
        'App will appear in applications'
      ],
      
      smartwatch: 'Smartwatch',
      wearosTitle: 'WearOS',
      wearosSteps: [
        'Open browser on your watch',
        'Navigate to the site',
        'Add to home screen',
        'Note: limited features'
      ],
      applewatchTitle: 'Apple Watch',
      applewatchSteps: [
        "Apple Watch doesn't support web apps directly",
        'Use iPhone to access the app',
        'Create a shortcut from iPhone'
      ],
      
      smarttv: 'Smart TV',
      androidtvTitle: 'Android TV',
      androidtvSteps: [
        'Open the web browser',
        'Enter the site address',
        'Add to bookmarks',
        'Quick access from bookmarks'
      ],
      samsungtvTitle: 'Samsung TV',
      samsungtvSteps: [
        'Open Samsung Internet',
        'Add site to favorites',
        'Quick access from favorites'
      ],
      lgtvTitle: 'LG WebOS',
      lgtvSteps: [
        'Open LG Web Browser',
        'Add to bookmarks',
        'Access from bookmarks'
      ],
      
      benefits: 'App Benefits',
      benefit1: 'Quick access from home screen',
      benefit2: 'Works offline (saves questions)',
      benefit3: 'Instant notifications',
      benefit4: 'Faster loading',
    },
  };

  const c = content[i18n.language as keyof typeof content] || content.ar;

  const DeviceSection = ({ 
    icon: Icon, 
    title, 
    children,
    color = 'primary'
  }: { 
    icon: React.ElementType; 
    title: string; 
    children: React.ReactNode;
    color?: string;
  }) => (
    <Card className="overflow-hidden">
      <CardHeader className={`bg-${color}/5 border-b border-border`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-${color}/10 rounded-xl flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${color}`} />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {children}
      </CardContent>
    </Card>
  );

  const InstructionCard = ({ 
    icon: Icon, 
    title, 
    steps,
    iconColor = 'text-primary'
  }: { 
    icon: React.ElementType; 
    title: string; 
    steps: string[];
    iconColor?: string;
  }) => (
    <div className="bg-muted/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <h4 className="font-semibold">{title}</h4>
      </div>
      <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20" dir={isRTL ? 'rtl' : 'ltr'}>
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

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {isInstalled ? (
          <Card className="text-center py-8">
            <CardHeader>
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">{c.installed}</CardTitle>
              <CardDescription className="text-base">{c.installedDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')} size="lg">
                {c.goHome}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Main Install Card */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-4 relative">
                  <Smartphone className="w-12 h-12 text-primary" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl md:text-3xl">{c.mainTitle}</CardTitle>
                <CardDescription className="text-base md:text-lg">{c.mainDesc}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {deferredPrompt && (
                  <Button onClick={handleInstall} className="w-full" size="lg">
                    <Download className="w-5 h-5 me-2" />
                    {c.installNow}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Phone Section */}
            <DeviceSection icon={Smartphone} title={c.phone}>
              <div className="grid gap-4 md:grid-cols-2">
                <InstructionCard 
                  icon={Apple} 
                  title={c.iosTitle} 
                  steps={c.iosSteps}
                  iconColor="text-gray-600 dark:text-gray-400"
                />
                <InstructionCard 
                  icon={Chrome} 
                  title={c.androidTitle} 
                  steps={c.androidSteps}
                  iconColor="text-green-600"
                />
              </div>
            </DeviceSection>

            {/* Computer Section */}
            <DeviceSection icon={Laptop} title={c.computer}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InstructionCard 
                  icon={Monitor} 
                  title={c.windowsTitle} 
                  steps={c.windowsSteps}
                  iconColor="text-blue-600"
                />
                <InstructionCard 
                  icon={Apple} 
                  title={c.macTitle} 
                  steps={c.macSteps}
                  iconColor="text-gray-600 dark:text-gray-400"
                />
                <InstructionCard 
                  icon={Monitor} 
                  title={c.linuxTitle} 
                  steps={c.linuxSteps}
                  iconColor="text-orange-600"
                />
              </div>
            </DeviceSection>

            {/* Smartwatch Section */}
            <DeviceSection icon={Watch} title={c.smartwatch}>
              <div className="grid gap-4 md:grid-cols-2">
                <InstructionCard 
                  icon={Watch} 
                  title={c.wearosTitle} 
                  steps={c.wearosSteps}
                  iconColor="text-teal-600"
                />
                <InstructionCard 
                  icon={Apple} 
                  title={c.applewatchTitle} 
                  steps={c.applewatchSteps}
                  iconColor="text-gray-600 dark:text-gray-400"
                />
              </div>
            </DeviceSection>

            {/* Smart TV Section */}
            <DeviceSection icon={Tv} title={c.smarttv}>
              <div className="grid gap-4 md:grid-cols-3">
                <InstructionCard 
                  icon={Tv} 
                  title={c.androidtvTitle} 
                  steps={c.androidtvSteps}
                  iconColor="text-green-600"
                />
                <InstructionCard 
                  icon={Tv} 
                  title={c.samsungtvTitle} 
                  steps={c.samsungtvSteps}
                  iconColor="text-blue-600"
                />
                <InstructionCard 
                  icon={Tv} 
                  title={c.lgtvTitle} 
                  steps={c.lgtvSteps}
                  iconColor="text-red-600"
                />
              </div>
            </DeviceSection>

            {/* Benefits */}
            <Card className="bg-gradient-to-br from-accent/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  {c.benefits}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Smartphone, text: c.benefit1 },
                    { icon: Wifi, text: c.benefit2 },
                    { icon: Bell, text: c.benefit3 },
                    { icon: Zap, text: c.benefit4 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Back Button */}
            <div className="text-center">
              <Button variant="outline" onClick={() => navigate('/')} size="lg">
                {c.goHome}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
