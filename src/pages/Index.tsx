import { useState, useEffect, useCallback } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { CountdownTimer } from '@/components/CountdownTimer';
import { VideoPlayer } from '@/components/VideoPlayer';
import { QuestionForm } from '@/components/QuestionForm';
import { AdminPanel } from '@/components/AdminPanel';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen } from 'lucide-react';

const Index = () => {
  const [showForm, setShowForm] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [logoTaps, setLogoTaps] = useState(0);
  const { data: settings, isLoading } = useSettings();

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
      // Reset after 2 seconds
      setTimeout(() => setLogoTaps(0), 2000);
      return newCount;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background islamic-pattern">
        <div className="text-xl text-muted-foreground">جارٍ التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background islamic-pattern" dir="rtl">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-3xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div
            className="inline-block cursor-default select-none"
            onClick={handleLogoTap}
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            صندوق فتوى مسجد الإيمان
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            هذا الموقع مخصص لجمع أسئلتكم فقط، وسيتم الإجابة عليها في حلقة علمية في وقت معلوم.
          </p>
        </header>

        {/* Video Section */}
        {settings?.video_url && settings?.video_title && (
          <section className="mb-12">
            <VideoPlayer url={settings.video_url} title={settings.video_title} />
          </section>
        )}

        {/* Countdown Timer */}
        {settings?.next_session_date && (
          <section className="mb-12">
            <CountdownTimer targetDate={settings.next_session_date} />
          </section>
        )}

        {/* Main Action */}
        <section className="text-center">
          {settings?.is_box_open ? (
            <Button
              onClick={() => setShowForm(true)}
              size="lg"
              className="text-xl px-12 py-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <BookOpen className="w-6 h-6 ml-3" />
              فتح صندوق الفتوى
            </Button>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <p className="text-xl text-muted-foreground">
                صندوق الفتوى مغلق حاليًا
              </p>
              <p className="text-muted-foreground mt-2">
                يُرجى العودة في وقت لاحق
              </p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>مسجد الإيمان – 150 مسكن</p>
        </footer>
      </div>

      {/* Question Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl">إرسال سؤال</DialogTitle>
          </DialogHeader>
          <QuestionForm onClose={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Admin Panel */}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
};

export default Index;
