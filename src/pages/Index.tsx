import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { CountdownTimer } from '@/components/CountdownTimer';
import { VideoPlayer } from '@/components/VideoPlayer';
import { QuestionForm } from '@/components/QuestionForm';
import { AdminPanel } from '@/components/AdminPanel';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import mosqueImage from '@/assets/mosque-hero.jpg';

const Index = () => {
  const [showAdmin, setShowAdmin] = useState(false);
  const [logoTaps, setLogoTaps] = useState(0);
  const { data: settings, isLoading } = useSettings();
  const formSectionRef = useRef<HTMLDivElement>(null);

  // Desktop shortcut: Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdmin(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mobile: 5 taps on logo
  const handleLogoTap = useCallback(() => {
    setLogoTaps((prev) => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setShowAdmin(true);
        return 0;
      }
      setTimeout(() => setLogoTaps(0), 2000);
      return newCount;
    });
  }, []);

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-muted-foreground">جارٍ التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-default select-none"
            onClick={handleLogoTap}
          >
            <BookOpen className="w-8 h-8 text-primary-foreground" />
            <div className="text-primary-foreground">
              <h1 className="text-lg font-bold leading-tight">صندوق فتوى</h1>
              <p className="text-xs opacity-80">مسجد الإيمان</p>
            </div>
          </div>
          {settings?.is_box_open && (
            <Button 
              onClick={scrollToForm}
              variant="secondary"
              className="bg-primary-foreground/90 text-foreground hover:bg-primary-foreground"
            >
              اطرح سؤالك
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${mosqueImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/50 to-foreground/70" />
        
        <div className="relative z-10 text-center px-4">
          <div className="w-16 h-1 bg-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4">
            صندوق فتوى
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-3">
            مسجد الإيمان - 150 مسكن
          </p>
          <p className="text-primary-foreground/80 max-w-xl mx-auto text-sm md:text-base">
            نجمع استفساراتكم الشرعية ويتم الإجابة عليها في حلقات دورية بإذن الله
          </p>
          <div className="w-12 h-1 bg-primary mx-auto mt-6" />
        </div>
      </section>

      {/* Video Section */}
      {settings?.video_url && settings?.video_title && (
        <section className="py-12 px-4 bg-card">
          <div className="container mx-auto max-w-3xl">
            <VideoPlayer url={settings.video_url} title={settings.video_title} />
          </div>
        </section>
      )}

      {/* Countdown Timer */}
      {settings?.next_session_date && (
        <section className="py-8 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-xl">
            <CountdownTimer targetDate={settings.next_session_date} />
          </div>
        </section>
      )}

      {/* Question Form Section */}
      <section ref={formSectionRef} className="py-16 px-4 islamic-pattern">
        <div className="container mx-auto max-w-xl">
          {settings?.is_box_open ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  اطرح سؤالك
                </h2>
                <p className="text-muted-foreground">
                  أرسل استفساراتك الشرعية وسيتم الإجابة عليها في الحلقة القادمة بإذن الله
                </p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg">
                <QuestionForm />
              </div>
            </>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-3">صندوق الفتوى مغلق حاليًا</h2>
              <p className="text-muted-foreground">
                يُرجى العودة في وقت لاحق للمشاركة بأسئلتكم
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-card border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>مسجد الإيمان – 150 مسكن</p>
        </div>
      </footer>

      {/* Admin Panel */}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
};

export default Index;
