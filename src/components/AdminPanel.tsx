import { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { useQuestionsCount } from '@/hooks/useQuestions';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, Lock, MessageSquare, Calendar, Video } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: questionsCount } = useQuestionsCount();
  const updateSettings = useUpdateSettings();

  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [nextSessionDate, setNextSessionDate] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    if (settings) {
      setIsBoxOpen(settings.is_box_open);
      setNextSessionDate(settings.next_session_date || '');
      setVideoTitle(settings.video_title || '');
    }
  }, [settings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production use proper hashing
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      toast({
        title: 'خطأ',
        description: 'كلمة المرور غير صحيحة',
        variant: 'destructive',
      });
    }
  };

  const handleToggleBox = async () => {
    if (!settings) return;
    setIsLoading(true);
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        is_box_open: !isBoxOpen,
      });
      setIsBoxOpen(!isBoxOpen);
      toast({ title: 'تم التحديث', description: `الصندوق ${!isBoxOpen ? 'مفتوح' : 'مغلق'} الآن` });
    } catch {
      toast({ title: 'خطأ', description: 'فشل التحديث', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleUpdateSession = async () => {
    if (!settings || !nextSessionDate) return;
    setIsLoading(true);
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        next_session_date: nextSessionDate,
      });
      toast({ title: 'تم التحديث', description: 'تم تحديث موعد الحلقة' });
    } catch {
      toast({ title: 'خطأ', description: 'فشل التحديث', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    setUploadingVideo(true);
    try {
      const fileName = `video_${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      await updateSettings.mutateAsync({
        id: settings.id,
        video_url: urlData.publicUrl,
        video_title: videoTitle || 'فيديو جديد',
      });

      toast({ title: 'تم الرفع', description: 'تم رفع الفيديو بنجاح' });
    } catch {
      toast({ title: 'خطأ', description: 'فشل رفع الفيديو', variant: 'destructive' });
    }
    setUploadingVideo(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">لوحة التحكم</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">كلمة المرور</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="text-center"
              />
            </div>
            <Button type="submit" className="w-full">
              <Lock className="w-4 h-4 ml-2" />
              دخول
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (settingsLoading) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-lg">جارٍ التحميل...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-full p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">لوحة التحكم</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-8">
              {/* Questions Count */}
              <div className="bg-primary/10 rounded-xl p-6 text-center">
                <MessageSquare className="w-10 h-10 text-primary mx-auto mb-3" />
                <div className="text-4xl font-bold text-primary mb-1">{questionsCount || 0}</div>
                <div className="text-muted-foreground">سؤال مستلم</div>
              </div>

              {/* Toggle Box */}
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                <div>
                  <h3 className="font-medium">حالة الصندوق</h3>
                  <p className="text-sm text-muted-foreground">
                    {isBoxOpen ? 'الصندوق مفتوح للأسئلة' : 'الصندوق مغلق حاليًا'}
                  </p>
                </div>
                <Switch
                  checked={isBoxOpen}
                  onCheckedChange={handleToggleBox}
                  disabled={isLoading}
                />
              </div>

              {/* Next Session */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">موعد الحلقة القادمة</h3>
                </div>
                <div className="flex gap-3">
                  <Input
                    type="datetime-local"
                    value={nextSessionDate}
                    onChange={(e) => setNextSessionDate(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleUpdateSession} disabled={isLoading}>
                    حفظ
                  </Button>
                </div>
              </div>

              {/* Video Upload */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">رفع فيديو</h3>
                </div>
                <Input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="عنوان الفيديو"
                  className="mb-2"
                />
                <label className="block">
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      {uploadingVideo ? 'جارٍ الرفع...' : 'اضغط لاختيار فيديو'}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoUpload}
                    disabled={uploadingVideo}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
