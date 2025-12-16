import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings, useVerifyAdminPassword, useUpdateSettingsAuthenticated, useDeleteAllQuestionsAuthenticated, useDeleteSelectedQuestionsAuthenticated } from '@/hooks/useSettings';
import { useGetQuestionsAuthenticated, Question } from '@/hooks/useQuestionsList';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { getCategoryLabel } from '@/lib/categories';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Upload, Lock, MessageSquare, Calendar, Video, 
  FileSpreadsheet, FileText, Bell, BellOff, Trash2, Settings, List, Home, AlertTriangle, CheckSquare
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [storedPassword, setStoredPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionsCount, setQuestionsCount] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const { toast } = useToast();
  
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const verifyPassword = useVerifyAdminPassword();
  const updateSettings = useUpdateSettingsAuthenticated();
  const getQuestions = useGetQuestionsAuthenticated();
  const deleteAllQuestions = useDeleteAllQuestionsAuthenticated();
  const deleteSelectedQuestions = useDeleteSelectedQuestionsAuthenticated();

  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [nextSessionDate, setNextSessionDate] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);

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

  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('questions-realtime-admin')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'questions' },
        () => {
          if (soundEnabled) {
            playNotificationSound();
          }
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

  const handleDeleteAllQuestions = async () => {
    if (!storedPassword) return;
    setIsLoading(true);
    try {
      const success = await deleteAllQuestions.mutateAsync(storedPassword);
      if (success) {
        setQuestions([]);
        setQuestionsCount(0);
        setSelectedQuestions([]);
        toast({ title: 'تم الحذف', description: 'تم حذف جميع الأسئلة بنجاح' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل حذف الأسئلة', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleDeleteSelectedQuestions = async () => {
    if (!storedPassword || selectedQuestions.length === 0) return;
    setIsLoading(true);
    try {
      const success = await deleteSelectedQuestions.mutateAsync({
        password: storedPassword,
        questionIds: selectedQuestions,
      });
      if (success) {
        setQuestions(prev => prev.filter(q => !selectedQuestions.includes(q.id)));
        setQuestionsCount(prev => (prev ?? 0) - selectedQuestions.length);
        toast({ title: 'تم الحذف', description: `تم حذف ${selectedQuestions.length} سؤال` });
        setSelectedQuestions([]);
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل حذف الأسئلة المحددة', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map(q => q.id));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">لوحة التحكم</h2>
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Home className="w-5 h-5" />
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">جارٍ التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">لوحة التحكم</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'إيقاف الصوت' : 'تشغيل الصوت'}
            >
              {soundEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Home className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 max-w-4xl">
        {/* Questions Count Summary */}
        <div className="bg-primary/10 rounded-xl p-4 mb-6 text-center">
          <div className="text-3xl font-bold text-primary">{questionsCount ?? 0}</div>
          <div className="text-sm text-muted-foreground">سؤال مستلم</div>
        </div>

        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">الأسئلة</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">الفيديو</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <div className="flex gap-2 flex-wrap">
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
                {questions.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                  >
                    <CheckSquare className="w-4 h-4 ml-2" />
                    {selectedQuestions.length === questions.length ? 'إلغاء التحديد' : 'تحديد الكل'}
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                {selectedQuestions.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف المحدد ({selectedQuestions.length})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          تأكيد الحذف
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف {selectedQuestions.length} سؤال؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-row-reverse gap-2">
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSelectedQuestions} className="bg-destructive hover:bg-destructive/90">
                          حذف المحدد
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      disabled={questions.length === 0}
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف الكل
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        تأكيد الحذف
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        هل أنت متأكد من حذف جميع الأسئلة؟ لا يمكن التراجع عن هذا الإجراء.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row-reverse gap-2">
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllQuestions} className="bg-destructive hover:bg-destructive/90">
                        حذف الكل
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {questions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">لا توجد أسئلة حتى الآن</p>
                </div>
              ) : (
                questions.map((q, index) => (
                  <div 
                    key={q.id} 
                    className={`bg-card border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedQuestions.includes(q.id) ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => toggleQuestionSelection(q.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedQuestions.includes(q.id)}
                        onCheckedChange={() => toggleQuestionSelection(q.id)}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
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
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-4">
            {settings?.video_url && (
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
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
                  className="w-full rounded-lg max-h-64 object-cover"
                  controls
                />
              </div>
            )}

            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
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
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
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
          <TabsContent value="settings" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
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

            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
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
      </main>
    </div>
  );
};

export default AdminPage;
