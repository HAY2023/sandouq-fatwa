import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings, useVerifyAdminPassword, useUpdateSettingsAuthenticated, useDeleteAllQuestionsAuthenticated, useDeleteSelectedQuestionsAuthenticated } from '@/hooks/useSettings';
import { useGetQuestionsAuthenticated, Question } from '@/hooks/useQuestionsList';
import { useVideos, useAddVideo, useDeleteVideo } from '@/hooks/useVideos';
import { useAnnouncements, useAddAnnouncement, useDeleteAnnouncement } from '@/hooks/useAnnouncements';
import { useAllFlashMessages, useAddFlashMessage, useDeleteFlashMessage } from '@/hooks/useFlashMessages';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { getCategoryLabel } from '@/lib/categories';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Lock, MessageSquare, Calendar, Video, 
  FileSpreadsheet, FileText, Bell, BellOff, Trash2, Settings, List, Home, AlertTriangle, CheckSquare, Plus, Megaphone, Zap
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
  const { data: videos, isLoading: videosLoading } = useVideos();
  const { data: announcements } = useAnnouncements();
  const { data: flashMessages } = useAllFlashMessages();
  const verifyPassword = useVerifyAdminPassword();
  const updateSettings = useUpdateSettingsAuthenticated();
  const getQuestions = useGetQuestionsAuthenticated();
  const deleteAllQuestions = useDeleteAllQuestionsAuthenticated();
  const deleteSelectedQuestions = useDeleteSelectedQuestionsAuthenticated();
  const addVideo = useAddVideo();
  const deleteVideo = useDeleteVideo();
  const addAnnouncement = useAddAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const addFlashMessage = useAddFlashMessage();
  const deleteFlashMessage = useDeleteFlashMessage();

  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [nextSessionDate, setNextSessionDate] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showCountdown, setShowCountdown] = useState(true);
  const [savingVideo, setSavingVideo] = useState(false);
  
  // Announcement states
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementType, setAnnouncementType] = useState('info');
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  // Flash message states
  const [flashMessage, setFlashMessage] = useState('');
  const [flashDirection, setFlashDirection] = useState('rtl');
  const [flashColor, setFlashColor] = useState('#3b82f6');
  const [flashStartDate, setFlashStartDate] = useState('');
  const [flashEndDate, setFlashEndDate] = useState('');
  const [savingFlash, setSavingFlash] = useState(false);

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
    } catch {
      // Sound not supported
    }
  };

  // Helper to format ISO date to datetime-local format
  const formatDateForInput = (isoDate: string | null): string => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return '';
      // Format: YYYY-MM-DDTHH:mm
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (settings) {
      setIsBoxOpen(settings.is_box_open);
      setNextSessionDate(formatDateForInput(settings.next_session_date));
      setVideoTitle(settings.video_title || '');
      setVideoUrl(settings.video_url || '');
      setShowCountdown(settings.show_countdown);
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
      // Failed to load questions
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
      } else {
        toast({ title: 'خطأ', description: 'فشل التحديث - تحقق من كلمة المرور', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل التحديث', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleUpdateSession = async () => {
    if (!settings || !nextSessionDate || !storedPassword) return;
    setIsLoading(true);
    try {
      // Convert datetime-local to ISO format
      const isoDate = new Date(nextSessionDate).toISOString();
      const success = await updateSettings.mutateAsync({
        password: storedPassword,
        next_session_date: isoDate,
      });
      if (success) {
        toast({ title: 'تم التحديث', description: 'تم تحديث موعد الحلقة' });
      } else {
        toast({ title: 'خطأ', description: 'فشل التحديث - تحقق من كلمة المرور', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل التحديث', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleSaveVideo = async () => {
    if (!storedPassword || !videoUrl || !videoTitle) return;
    setSavingVideo(true);
    try {
      const result = await addVideo.mutateAsync({
        password: storedPassword,
        title: videoTitle,
        url: videoUrl,
      });
      if (result) {
        setVideoTitle('');
        setVideoUrl('');
        toast({ title: 'تم الحفظ', description: 'تم إضافة الفيديو بنجاح' });
      } else {
        toast({ title: 'خطأ', description: 'فشل إضافة الفيديو', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل حفظ الفيديو', variant: 'destructive' });
    }
    setSavingVideo(false);
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!storedPassword) return;
    try {
      const success = await deleteVideo.mutateAsync({
        password: storedPassword,
        videoId,
      });
      if (success) {
        toast({ title: 'تم الحذف', description: 'تم حذف الفيديو' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل الحذف', variant: 'destructive' });
    }
  };

  const handleSaveAnnouncement = async () => {
    if (!storedPassword || !announcementMessage) return;
    setSavingAnnouncement(true);
    try {
      const result = await addAnnouncement.mutateAsync({
        password: storedPassword,
        message: announcementMessage,
        type: announcementType,
      });
      if (result) {
        setAnnouncementMessage('');
        toast({ title: 'تم الحفظ', description: 'تم إضافة الإعلان بنجاح' });
      } else {
        toast({ title: 'خطأ', description: 'فشل إضافة الإعلان', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل حفظ الإعلان', variant: 'destructive' });
    }
    setSavingAnnouncement(false);
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!storedPassword) return;
    try {
      const success = await deleteAnnouncement.mutateAsync({
        password: storedPassword,
        announcementId,
      });
      if (success) {
        toast({ title: 'تم الحذف', description: 'تم حذف الإعلان' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل الحذف', variant: 'destructive' });
    }
  };

  const handleSaveFlashMessage = async () => {
    if (!storedPassword || !flashMessage) return;
    setSavingFlash(true);
    try {
      const result = await addFlashMessage.mutateAsync({
        password: storedPassword,
        message: flashMessage,
        text_direction: flashDirection,
        color: flashColor,
        start_date: flashStartDate ? new Date(flashStartDate).toISOString() : null,
        end_date: flashEndDate ? new Date(flashEndDate).toISOString() : null,
      });
      if (result) {
        setFlashMessage('');
        setFlashStartDate('');
        setFlashEndDate('');
        toast({ title: 'تم الحفظ', description: 'تم إضافة رسالة الفلاش بنجاح' });
      } else {
        toast({ title: 'خطأ', description: 'فشل إضافة رسالة الفلاش', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل حفظ رسالة الفلاش', variant: 'destructive' });
    }
    setSavingFlash(false);
  };

  const handleDeleteFlashMessage = async (flashMessageId: string) => {
    if (!storedPassword) return;
    try {
      const success = await deleteFlashMessage.mutateAsync({
        password: storedPassword,
        flashMessageId,
      });
      if (success) {
        toast({ title: 'تم الحذف', description: 'تم حذف رسالة الفلاش' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل الحذف', variant: 'destructive' });
    }
  };

  const handleToggleCountdown = async () => {
    if (!storedPassword) return;
    setIsLoading(true);
    try {
      const success = await updateSettings.mutateAsync({
        password: storedPassword,
        show_countdown: !showCountdown,
      });
      if (success) {
        setShowCountdown(!showCountdown);
        toast({ title: 'تم التحديث', description: `العداد التنازلي ${!showCountdown ? 'مفعّل' : 'معطّل'} الآن` });
      }
    } catch {
      toast({ title: 'خطأ', description: 'فشل التحديث', variant: 'destructive' });
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
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">الأسئلة</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">الفيديو</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">الإعلانات</span>
            </TabsTrigger>
            <TabsTrigger value="flash" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">فلاش</span>
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
            {/* Existing Videos */}
            {videosLoading ? (
              <div className="text-center py-4 text-muted-foreground">جارٍ تحميل الفيديوهات...</div>
            ) : videos && videos.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">الفيديوهات الحالية ({videos.length})</h4>
                {videos.map((video) => (
                  <div key={video.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{video.title}</h4>
                        <a 
                          href={video.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-primary hover:underline"
                        >
                          {video.url}
                        </a>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteVideo(video.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد فيديوهات</p>
              </div>
            )}

            {/* Add New Video */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                إضافة فيديو جديد
              </h4>
              <Input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="عنوان الفيديو"
              />
              <Input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="رابط YouTube (مثال: https://www.youtube.com/watch?v=...)"
                dir="ltr"
              />
              <Button 
                onClick={handleSaveVideo} 
                disabled={savingVideo || !videoUrl || !videoTitle}
                className="w-full"
              >
                <Plus className="w-4 h-4 ml-2" />
                {savingVideo ? 'جارٍ الإضافة...' : 'إضافة الفيديو'}
              </Button>
            </div>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-4">
            {/* Existing Announcements */}
            {announcements && announcements.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">الإعلانات الحالية ({announcements.length})</h4>
                {announcements.map((ann) => (
                  <div key={ann.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          ann.type === 'success' ? 'bg-green-500/20 text-green-600' :
                          ann.type === 'warning' ? 'bg-amber-500/20 text-amber-600' :
                          ann.type === 'error' ? 'bg-destructive/20 text-destructive' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {ann.type === 'success' ? 'نجاح' : ann.type === 'warning' ? 'تنبيه' : ann.type === 'error' ? 'خطأ' : 'معلومة'}
                        </span>
                        <p className="mt-2 text-sm">{ann.message}</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد إعلانات</p>
              </div>
            )}

            {/* Add New Announcement */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                إضافة إعلان جديد
              </h4>
              <Input
                type="text"
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                placeholder="نص الإعلان"
              />
              <Select value={announcementType} onValueChange={setAnnouncementType}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع الإعلان" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">معلومة</SelectItem>
                  <SelectItem value="success">نجاح</SelectItem>
                  <SelectItem value="warning">تنبيه</SelectItem>
                  <SelectItem value="error">تحذير</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleSaveAnnouncement} 
                disabled={savingAnnouncement || !announcementMessage}
                className="w-full"
              >
                <Plus className="w-4 h-4 ml-2" />
                {savingAnnouncement ? 'جارٍ الإضافة...' : 'إضافة الإعلان'}
              </Button>
            </div>
          </TabsContent>

          {/* Flash Messages Tab */}
          <TabsContent value="flash" className="space-y-4">
            {/* Existing Flash Messages */}
            {flashMessages && flashMessages.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">رسائل الفلاش الحالية ({flashMessages.length})</h4>
                {flashMessages.map((msg) => (
                  <div key={msg.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: msg.color }}
                          />
                          <span className="text-xs text-muted-foreground">
                            {msg.text_direction === 'rtl' ? 'من اليمين لليسار' : 'من اليسار لليمين'}
                          </span>
                          {msg.start_date && (
                            <span className="text-xs text-muted-foreground">
                              من: {new Date(msg.start_date).toLocaleDateString('ar-SA')}
                            </span>
                          )}
                          {msg.end_date && (
                            <span className="text-xs text-muted-foreground">
                              إلى: {new Date(msg.end_date).toLocaleDateString('ar-SA')}
                            </span>
                          )}
                        </div>
                        <p 
                          className="text-sm p-2 rounded" 
                          style={{ backgroundColor: msg.color, color: getContrastColor(msg.color) }}
                          dir={msg.text_direction}
                        >
                          {msg.message}
                        </p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteFlashMessage(msg.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد رسائل فلاش</p>
              </div>
            )}

            {/* Add New Flash Message */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                إضافة رسالة فلاش جديدة
              </h4>
              
              <Input
                type="text"
                value={flashMessage}
                onChange={(e) => setFlashMessage(e.target.value)}
                placeholder="نص الرسالة"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">اتجاه النص</label>
                  <Select value={flashDirection} onValueChange={setFlashDirection}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rtl">من اليمين لليسار</SelectItem>
                      <SelectItem value="ltr">من اليسار لليمين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm mb-2">اللون</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={flashColor}
                      onChange={(e) => setFlashColor(e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={flashColor}
                      onChange={(e) => setFlashColor(e.target.value)}
                      className="flex-1"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">تاريخ البداية (اختياري)</label>
                  <Input
                    type="datetime-local"
                    value={flashStartDate}
                    onChange={(e) => setFlashStartDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">اتركه فارغاً للظهور فوراً</p>
                </div>
                
                <div>
                  <label className="block text-sm mb-2">تاريخ النهاية (اختياري)</label>
                  <Input
                    type="datetime-local"
                    value={flashEndDate}
                    onChange={(e) => setFlashEndDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">اتركه فارغاً لعدم الانتهاء</p>
                </div>
              </div>

              {/* Preview */}
              {flashMessage && (
                <div>
                  <label className="block text-sm mb-2">معاينة:</label>
                  <div 
                    className="p-3 rounded-lg flex items-center gap-2"
                    style={{ backgroundColor: flashColor, color: getContrastColor(flashColor) }}
                    dir={flashDirection}
                  >
                    <Zap className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{flashMessage}</p>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSaveFlashMessage} 
                disabled={savingFlash || !flashMessage}
                className="w-full"
              >
                <Plus className="w-4 h-4 ml-2" />
                {savingFlash ? 'جارٍ الإضافة...' : 'إضافة رسالة الفلاش'}
              </Button>
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

            <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">العداد التنازلي</h3>
                <p className="text-sm text-muted-foreground">
                  {showCountdown ? 'العداد ظاهر في الصفحة الرئيسية' : 'العداد مخفي'}
                </p>
              </div>
              <Switch
                checked={showCountdown}
                onCheckedChange={handleToggleCountdown}
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
                <Button onClick={handleUpdateSession} disabled={isLoading || !nextSessionDate}>
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

// Helper function to determine text color based on background
function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export default AdminPage;
