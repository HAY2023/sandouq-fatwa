import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings, useVerifyAdminPassword, useUpdateSettingsAuthenticated, useDeleteAllQuestionsAuthenticated, useDeleteSelectedQuestionsAuthenticated } from '@/hooks/useSettings';
import { useGetQuestionsAuthenticated, useGetAccessLogsAuthenticated, Question, AccessLog } from '@/hooks/useQuestionsList';
import { useVideos, useAddVideo, useDeleteVideo, useReorderVideos, Video as VideoType } from '@/hooks/useVideos';
import { useAnnouncements, useAddAnnouncement, useDeleteAnnouncement } from '@/hooks/useAnnouncements';
import { useAllFlashMessages, useAddFlashMessage, useDeleteFlashMessage } from '@/hooks/useFlashMessages';
import { supabase } from '@/integrations/supabase/client';
import { logAdminAccess } from '@/hooks/useAdminAccessLog';
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
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableVideoItem } from '@/components/SortableVideoItem';
import { 
  Lock, MessageSquare, Calendar, Video, 
  FileSpreadsheet, FileText, Bell, BellOff, Trash2, Settings, List, Home, AlertTriangle, CheckSquare, Plus, Megaphone, Zap, Hash,
  Shield, MapPin, Monitor, Globe, CheckCircle, XCircle, Clock, Wifi, Smartphone, Fingerprint, ChevronDown, ChevronUp
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
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: videos, isLoading: videosLoading } = useVideos();
  const { data: announcements } = useAnnouncements();
  const { data: flashMessages } = useAllFlashMessages();
  const verifyPassword = useVerifyAdminPassword();
  const updateSettings = useUpdateSettingsAuthenticated();
  const getQuestions = useGetQuestionsAuthenticated();
  const getAccessLogs = useGetAccessLogsAuthenticated();
  const deleteAllQuestions = useDeleteAllQuestionsAuthenticated();
  const deleteSelectedQuestions = useDeleteSelectedQuestionsAuthenticated();
  const addVideo = useAddVideo();
  const deleteVideo = useDeleteVideo();
  const reorderVideos = useReorderVideos();
  const addAnnouncement = useAddAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const addFlashMessage = useAddFlashMessage();
  const deleteFlashMessage = useDeleteFlashMessage();

  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [nextSessionDate, setNextSessionDate] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showCountdown, setShowCountdown] = useState(true);
  const [showQuestionCount, setShowQuestionCount] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);
  const [localVideos, setLocalVideos] = useState<VideoType[]>([]);
  
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
  const [flashFontSize, setFlashFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [savingFlash, setSavingFlash] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const formatDateForInput = (isoDate: string | null): string => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return '';
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
      setShowQuestionCount(settings.show_question_count ?? false);
    }
  }, [settings]);

  useEffect(() => {
    if (videos) {
      setLocalVideos(videos);
    }
  }, [videos]);

  useEffect(() => {
    if (isAuthenticated && storedPassword) {
      loadQuestions();
      loadAccessLogs();
    }
  }, [isAuthenticated, storedPassword]);

  const loadAccessLogs = async () => {
    if (!storedPassword) return;
    try {
      const data = await getAccessLogs.mutateAsync(storedPassword);
      setAccessLogs(data || []);
    } catch {
      // Failed to load access logs
    }
  };

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
      // تسجيل محاولة الدخول
      logAdminAccess(isValid, true);
      
      if (isValid) {
        setIsAuthenticated(true);
        setStoredPassword(password);
      } else {
        toast({ title: 'خطأ', description: 'كلمة المرور غير صحيحة', variant: 'destructive' });
      }
    } catch {
      logAdminAccess(false, true);
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = localVideos.findIndex(v => v.id === active.id);
      const newIndex = localVideos.findIndex(v => v.id === over.id);
      
      const newVideos = arrayMove(localVideos, oldIndex, newIndex);
      setLocalVideos(newVideos);
      
      // Save to database
      try {
        await reorderVideos.mutateAsync({
          password: storedPassword,
          videoIds: newVideos.map(v => v.id),
        });
        toast({ title: 'تم الحفظ', description: 'تم تحديث ترتيب الفيديوهات' });
      } catch {
        toast({ title: 'خطأ', description: 'فشل حفظ الترتيب', variant: 'destructive' });
        // Revert on error
        if (videos) setLocalVideos(videos);
      }
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
        font_size: flashFontSize,
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

  const handleToggleQuestionCount = async () => {
    if (!storedPassword) return;
    setIsLoading(true);
    try {
      const success = await updateSettings.mutateAsync({
        password: storedPassword,
        show_question_count: !showQuestionCount,
      });
      if (success) {
        setShowQuestionCount(!showQuestionCount);
        toast({ title: 'تم التحديث', description: `عداد الأسئلة ${!showQuestionCount ? 'مفعّل' : 'معطّل'} الآن` });
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

  const toggleLogExpand = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
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
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="questions" className="flex items-center gap-1">
              <List className="w-4 h-4" />
              <span className="hidden md:inline">الأسئلة</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-1">
              <Video className="w-4 h-4" />
              <span className="hidden md:inline">الفيديو</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-1">
              <Megaphone className="w-4 h-4" />
              <span className="hidden md:inline">الإعلانات</span>
            </TabsTrigger>
            <TabsTrigger value="flash" className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span className="hidden md:inline">فلاش</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span className="hidden md:inline">السجل</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">الإعدادات</span>
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

          {/* Logs Tab - سجل الدخول */}
          <TabsContent value="logs" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                سجل محاولات الدخول
              </h3>
              <Button variant="outline" size="sm" onClick={loadAccessLogs}>
                تحديث
              </Button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {accessLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">لا توجد سجلات</p>
                </div>
              ) : (
                accessLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`bg-card border rounded-lg overflow-hidden ${
                      log.is_authorized ? 'border-green-500/30' : 'border-destructive/30'
                    }`}
                  >
                    {/* Header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleLogExpand(log.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {log.is_authorized ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                          <span className={log.is_authorized ? 'text-green-500 font-medium' : 'text-destructive font-medium'}>
                            {log.is_authorized ? 'دخول مصرح' : 'محاولة فاشلة'}
                          </span>
                          {log.fingerprint_id && (
                            <span className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
                              <Fingerprint className="w-3 h-3" />
                              {log.fingerprint_id.slice(0, 8)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(log.accessed_at).toLocaleString('ar-SA')}
                          </span>
                          {expandedLogId === log.id ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Globe className="w-4 h-4" />
                          <span>{log.ip_address || 'غير معروف'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{log.country && log.city ? `${log.city}, ${log.country}` : 'غير معروف'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Smartphone className="w-4 h-4" />
                          <span>{log.device_type || 'غير معروف'}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {log.browser} / {log.os}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedLogId === log.id && (
                      <div className="border-t border-border bg-muted/30 p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {/* معلومات الموقع */}
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2 text-primary">
                              <MapPin className="w-4 h-4" />
                              معلومات الموقع
                            </h4>
                            <div className="bg-card rounded-lg p-3 space-y-1">
                              <p><span className="text-muted-foreground">الدولة:</span> {log.country || 'غير معروف'}</p>
                              <p><span className="text-muted-foreground">المدينة:</span> {log.city || 'غير معروف'}</p>
                              <p><span className="text-muted-foreground">المنطقة:</span> {log.region || 'غير معروف'}</p>
                              <p><span className="text-muted-foreground">الرمز البريدي:</span> {log.postal || 'غير معروف'}</p>
                              {log.latitude && log.longitude && (
                                <p><span className="text-muted-foreground">الإحداثيات:</span> {log.latitude}, {log.longitude}</p>
                              )}
                            </div>
                          </div>

                          {/* معلومات الشبكة */}
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2 text-primary">
                              <Wifi className="w-4 h-4" />
                              معلومات الشبكة
                            </h4>
                            <div className="bg-card rounded-lg p-3 space-y-1">
                              <p><span className="text-muted-foreground">IP:</span> {log.ip_address || 'غير معروف'}</p>
                              <p><span className="text-muted-foreground">مزود الخدمة:</span> {log.isp || log.org || 'غير معروف'}</p>
                              <p><span className="text-muted-foreground">ASN:</span> {log.asn || 'غير معروف'}</p>
                              <p><span className="text-muted-foreground">نوع الاتصال:</span> {log.network_type || 'غير معروف'}</p>
                              <p><span className="text-muted-foreground">نوع الشبكة:</span> {log.connection_type || 'غير معروف'}</p>
                            </div>
                          </div>

                          {/* معلومات الجهاز */}
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2 text-primary">
                              <Monitor className="w-4 h-4" />
                              معلومات الجهاز
                            </h4>
                            <div className="bg-card rounded-lg p-3 space-y-1">
                              <p><span className="text-muted-foreground">النوع:</span> {log.device_type || 'غير معروف'}</p>
                              <p><span className="text-muted-foreground">المتصفح:</span> {log.browser || 'غير معروف'}</p>
                              <p><span className="text-muted-foreground">النظام:</span> {log.os || 'غير معروف'}</p>
                              <p><span className="text-muted-foreground">حجم الشاشة:</span> {log.screen_size || 'غير معروف'}</p>
                              <p><span className="text-muted-foreground">عمق الألوان:</span> {log.color_depth || 'غير معروف'}</p>
                              <p><span className="text-muted-foreground">كثافة البكسل:</span> {log.pixel_ratio || 'غير معروف'}</p>
                              <p><span className="text-muted-foreground">دعم اللمس:</span> {log.touch_support ? 'نعم' : 'لا'}</p>
                            </div>
                          </div>

                          {/* معلومات المتصفح */}
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2 text-primary">
                              <Globe className="w-4 h-4" />
                              معلومات المتصفح
                            </h4>
                            <div className="bg-card rounded-lg p-3 space-y-1">
                              <p><span className="text-muted-foreground">اللغة:</span> {log.language || 'غير معروف'}</p>
                              <p><span className="text-muted-foreground">المنطقة الزمنية:</span> {log.timezone || 'غير معروف'}</p>
                              <p><span className="text-muted-foreground">عدد الأنوية:</span> {log.hardware_concurrency || 'غير معروف'}</p>
                              <p><span className="text-muted-foreground">الذاكرة:</span> {log.device_memory ? `${log.device_memory} GB` : 'غير معروف'}</p>
                              <p><span className="text-muted-foreground">المصدر:</span> {log.referrer || 'مباشر'}</p>
                            </div>
                          </div>
                        </div>

                        {/* User Agent */}
                        {log.user_agent && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-primary">User Agent</h4>
                            <div className="bg-card rounded-lg p-3">
                              <p className="text-xs text-muted-foreground break-all font-mono" dir="ltr">
                                {log.user_agent}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Fingerprint */}
                        {log.fingerprint_id && (
                          <div className="flex items-center gap-2 text-sm">
                            <Fingerprint className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">بصمة المتصفح:</span>
                            <code className="bg-muted px-2 py-1 rounded text-xs">{log.fingerprint_id}</code>
                          </div>
                        )}
                      </div>
                    )}
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
            ) : localVideos && localVideos.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">الفيديوهات الحالية ({localVideos.length}) - اسحب لإعادة الترتيب</h4>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={localVideos.map(v => v.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {localVideos.map((video) => (
                      <SortableVideoItem
                        key={video.id}
                        video={video}
                        onDelete={handleDeleteVideo}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
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
                          {ann.type === 'success' ? 'نجاح' : ann.type === 'warning' ? 'تنبيه' : ann.type === 'error' ? 'خطأ' : 'إعلان'}
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
                  <SelectItem value="info">إعلان</SelectItem>
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
              
              <div className="grid grid-cols-3 gap-4">
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
                  <label className="block text-sm mb-2">حجم الخط</label>
                  <Select value={flashFontSize} onValueChange={(v) => setFlashFontSize(v as 'sm' | 'md' | 'lg' | 'xl')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">صغير</SelectItem>
                      <SelectItem value="md">متوسط</SelectItem>
                      <SelectItem value="lg">كبير</SelectItem>
                      <SelectItem value="xl">كبير جداً</SelectItem>
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
                    className="p-3 rounded-lg flex items-center gap-2 overflow-hidden"
                    style={{ backgroundColor: flashColor, color: getContrastColor(flashColor) }}
                    dir={flashDirection}
                  >
                    <Zap className="w-5 h-5 flex-shrink-0" />
                    <div className="animate-marquee whitespace-nowrap">
                      <p className={`inline-block font-medium ${
                        flashFontSize === 'sm' ? 'text-sm' :
                        flashFontSize === 'lg' ? 'text-lg' :
                        flashFontSize === 'xl' ? 'text-xl' : 'text-base'
                      }`}>{flashMessage}</p>
                    </div>
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
                  {showCountdown ? 'يظهر العداد التنازلي للحلقة القادمة' : 'العداد التنازلي مخفي'}
                </p>
              </div>
              <Switch
                checked={showCountdown}
                onCheckedChange={handleToggleCountdown}
                disabled={isLoading}
              />
            </div>

            <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  عداد الأسئلة
                </h3>
                <p className="text-sm text-muted-foreground">
                  {showQuestionCount ? 'يظهر عدد الأسئلة المستلمة للزوار' : 'عداد الأسئلة مخفي عن الزوار'}
                </p>
              </div>
              <Switch
                checked={showQuestionCount}
                onCheckedChange={handleToggleQuestionCount}
                disabled={isLoading}
              />
            </div>

            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-medium">موعد الحلقة القادمة</h3>
              </div>
              <Input
                type="datetime-local"
                value={nextSessionDate}
                onChange={(e) => setNextSessionDate(e.target.value)}
              />
              <Button onClick={handleUpdateSession} disabled={isLoading || !nextSessionDate}>
                {isLoading ? 'جارٍ الحفظ...' : 'حفظ الموعد'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Helper function to get contrast color
function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export default AdminPage;
