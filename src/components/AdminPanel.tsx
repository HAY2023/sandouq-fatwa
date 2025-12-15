import { useState, useEffect } from 'react';
import { useSettings, useVerifyAdminPassword, useUpdateSettingsAuthenticated, useGetQuestionsCountAuthenticated } from '@/hooks/useSettings';
import { useGetQuestionsAuthenticated, Question } from '@/hooks/useQuestionsList';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { getCategoryLabel } from '@/lib/categories';
import { 
  X, Upload, Lock, MessageSquare, Calendar, Video, 
  FileSpreadsheet, FileText, Bell, BellOff, Trash2, Settings, List
} from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [storedPassword, setStoredPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionsCount, setQuestionsCount] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { toast } = useToast();
  
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const verifyPassword = useVerifyAdminPassword();
  const updateSettings = useUpdateSettingsAuthenticated();
  const getQuestionsCount = useGetQuestionsCountAuthenticated();
  const getQuestions = useGetQuestionsAuthenticated();

  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [nextSessionDate, setNextSessionDate] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Create notification sound using Web Audio API
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log('Could not play notification sound');
    }
  };

  useEffect(() => {
    if (settings) {
      setIsBoxOpen(settings.is_box_open);
      setNextSessionDate(settings.next_session_date || '');
      setVideoTitle(settings.video_title || '');
    }
  }, [settings]);

  useEffect(() => {
    if (isAuthenticated && storedPassword) {
      loadQuestions();
    }
  }, [isAuthenticated, storedPassword]);

  // Realtime subscription for new questions
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('questions-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'questions' },
        () => {
          // Play notification sound
          if (soundEnabled) {
            playNotificationSound();
          }
          // Refresh questions list
          loadQuestions();
          toast({ title: 'سؤال جديد', description: 'تم استلام سؤال جديد' });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, soundEnabled]);

  const loadQuestions = async () => {
    if (!storedPassword) return;
    try {
      const data = await getQuestions.mutateAsync(storedPassword);
      setQuestions(data || []);
      setQuestionsCount(data?.length || 0);
    } catch {
      console.error('Failed to load questions');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const isValid = await verifyPassword.mutateAsync(password);
      if (isValid) {
        setIsAuthenticated(true);
        setStoredPassword(password);
      } else {
        toast({ title: 'خطأ', description: 'كلمة المرور غير صحيحة', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء التحقق', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleToggleBox = async () => {
    if (!settings || !storedPassword) return;
    setIsLoading(true);
    try {
      const success = await updateSettings.mutateAsync({
        password: storedPassword,
        is_box_open: !isBoxOpen,
      });
      if (success) {
        setIsBoxOpen(!isBoxOpen);
        toast({ title: 'تم التحديث', description: `الصندوق ${!isBoxOpen ? 'مفتوح' : 'مغلق'} الآن` });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل التحديث', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleUpdateSession = async () => {
    if (!settings || !nextSessionDate || !storedPassword) return;
    setIsLoading(true);
    try {
      const success = await updateSettings.mutateAsync({
        password: storedPassword,
        next_session_date: nextSessionDate,
      });
      if (success) {
        toast({ title: 'تم التحديث', description: 'تم تحديث موعد الحلقة' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل التحديث', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings || !storedPassword) return;

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

      const success = await updateSettings.mutateAsync({
        password: storedPassword,
        video_url: urlData.publicUrl,
        video_title: videoTitle || 'فيديو جديد',
      });

      if (success) {
        toast({ title: 'تم الرفع', description: 'تم رفع الفيديو بنجاح' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل رفع الفيديو', variant: 'destructive' });
    }
    setUploadingVideo(false);
  };

  const handleRemoveVideo = async () => {
    if (!storedPassword) return;
    setIsLoading(true);
    try {
      const success = await updateSettings.mutateAsync({
        password: storedPassword,
        video_url: '',
        video_title: '',
      });
      if (success) {
        toast({ title: 'تم الحذف', description: 'تم حذف الفيديو' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل الحذف', variant: 'destructive' });
    }
    setIsLoading(false);
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              <Lock className="w-4 h-4 ml-2" />
              {isLoading ? 'جارٍ التحقق...' : 'دخول'}
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
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">لوحة التحكم</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? 'إيقاف الصوت' : 'تشغيل الصوت'}
                >
                  {soundEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Questions Count Summary */}
            <div className="bg-primary/10 rounded-xl p-4 mb-6 text-center">
              <div className="text-3xl font-bold text-primary">{questionsCount ?? 0}</div>
              <div className="text-sm text-muted-foreground">سؤال مستلم</div>
            </div>

            <Tabs defaultValue="questions" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="questions" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  الأسئلة
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  الفيديو
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  الإعدادات
                </TabsTrigger>
              </TabsList>

              {/* Questions Tab */}
              <TabsContent value="questions" className="space-y-4">
                {/* Export Buttons */}
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportToExcel(questions)}
                    disabled={questions.length === 0}
                  >
                    <FileSpreadsheet className="w-4 h-4 ml-2" />
                    Excel
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportToPDF(questions)}
                    disabled={questions.length === 0}
                  >
                    <FileText className="w-4 h-4 ml-2" />
                    PDF
                  </Button>
                </div>

                {/* Questions List */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {questions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد أسئلة حتى الآن</p>
                    </div>
                  ) : (
                    questions.map((q, index) => (
                      <div key={q.id} className="bg-secondary/50 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                            {getCategoryLabel(q.category)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            #{index + 1} - {new Date(q.created_at).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                        <p className="text-sm">{q.question_text}</p>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Videos Tab */}
              <TabsContent value="videos" className="space-y-4">
                {settings?.video_url && (
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{settings.video_title}</h4>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleRemoveVideo}
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4 ml-1" />
                        حذف
                      </Button>
                    </div>
                    <video 
                      src={settings.video_url} 
                      className="w-full rounded-lg max-h-48 object-cover"
                      controls
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    رفع فيديو جديد
                  </h4>
                  <Input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="عنوان الفيديو"
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
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
