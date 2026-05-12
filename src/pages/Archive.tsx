import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Lock, Archive as ArchiveIcon, Home, Loader2, Download, ShieldCheck, Trash2, AlertTriangle, RefreshCw, Eye, FileText } from 'lucide-react';
import { ZipWriter, ZipReader, BlobWriter, BlobReader, TextReader, TextWriter } from '@zip.js/zip.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const ARCHIVE_ZIP_PASSWORD = '2020';

interface StoredArchive {
  id: string;
  filename: string;
  size_bytes: number;
  questions_count: number;
  logs_count: number;
  reports_count: number;
  note: string | null;
  created_at: string;
}

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result as string;
      resolve(r.split(',')[1] || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const base64ToBlob = (b64: string, mime = 'application/zip') => {
  const byteChars = atob(b64);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
  return new Blob([bytes], { type: mime });
};

export default function Archive() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storedPassword, setStoredPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [archives, setArchives] = useState<StoredArchive[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const loadArchives = async (pwd: string) => {
    setLoadingList(true);
    const { data, error } = await supabase.rpc('list_site_archives_authenticated', { p_password: pwd });
    if (!error) setArchives((data as StoredArchive[]) || []);
    setLoadingList(false);
  };

  useEffect(() => {
    if (isAuthenticated && storedPassword) loadArchives(storedPassword);
  }, [isAuthenticated, storedPassword]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) return;
    setIsVerifying(true);
    try {
      const { data: lockStatus } = await supabase.rpc('check_admin_lock_status');
      if (lockStatus && (lockStatus as any).is_locked) {
        const mins = Math.ceil((lockStatus as any).remaining_seconds / 60);
        toast({ title: '🔒 الحساب مقفل', description: `حاول بعد ${mins} دقيقة.`, variant: 'destructive' });
        setIsVerifying(false);
        return;
      }
      const { data: isValid, error } = await supabase.rpc('verify_admin_password', { input_password: adminPassword });
      if (error) throw error;
      if (isValid === true) {
        setStoredPassword(adminPassword);
        setIsAuthenticated(true);
        toast({ title: 'تم التحقق' });
      } else {
        toast({ title: 'كلمة المرور غير صحيحة', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
    }
    setIsVerifying(false);
  };

  const buildEncryptedZip = async () => {
    const { data: questions } = await supabase.rpc('get_questions_authenticated', { p_password: storedPassword });
    const { data: logs } = await supabase.rpc('get_admin_access_logs_authenticated', { p_password: storedPassword });
    const { data: reports } = await supabase.rpc('get_user_reports_authenticated', { p_password: storedPassword });
    const { data: settings } = await supabase.from('settings').select('*');
    const { data: notifs } = await supabase.rpc('get_notification_history_authenticated', { p_password: storedPassword });

    const qArr = questions || [];
    const lArr = logs || [];
    const rArr = reports || [];

    const zipWriter = new ZipWriter(new BlobWriter('application/zip'), {
      password: ARCHIVE_ZIP_PASSWORD, encryptionStrength: 3,
    });
    const meta = {
      generated_at: new Date().toISOString(),
      questions_count: qArr.length, logs_count: lArr.length, reports_count: rArr.length,
      note: 'كلمة فك الضغط: 2020',
    };
    await zipWriter.add('README.txt', new TextReader(
      `أرشيف صندوق الفتاوى\nتاريخ: ${new Date().toLocaleString('ar')}\n` +
      `الأسئلة: ${qArr.length}\nالسجلات: ${lArr.length}\nالبلاغات: ${rArr.length}\n\nكلمة فك الضغط: 2020\nالتشفير: AES-256\n`
    ));
    await zipWriter.add('meta.json', new TextReader(JSON.stringify(meta, null, 2)));
    await zipWriter.add('questions.json', new TextReader(JSON.stringify(qArr, null, 2)));
    await zipWriter.add('access_logs.json', new TextReader(JSON.stringify(lArr, null, 2)));
    await zipWriter.add('reports.json', new TextReader(JSON.stringify(rArr, null, 2)));
    await zipWriter.add('settings.json', new TextReader(JSON.stringify(settings || [], null, 2)));
    await zipWriter.add('notifications.json', new TextReader(JSON.stringify(notifs || [], null, 2)));

    const blob = await zipWriter.close();
    return { blob, qCount: qArr.length, lCount: lArr.length, rCount: rArr.length };
  };

  const handleArchiveAndReset = async () => {
    setIsResetting(true);
    try {
      // 1. بناء الأرشيف المشفّر
      toast({ title: 'جارٍ بناء الأرشيف...' });
      const { blob, qCount, lCount, rCount } = await buildEncryptedZip();

      // 2. حفظ في قاعدة البيانات
      const b64 = await blobToBase64(blob);
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `archive-${ts}.zip`;
      const { data: archiveId, error: saveErr } = await supabase.rpc('save_site_archive_authenticated', {
        p_password: storedPassword,
        p_filename: filename,
        p_data_b64: b64,
        p_size_bytes: blob.size,
        p_questions_count: qCount,
        p_logs_count: lCount,
        p_reports_count: rCount,
        p_note: 'تصفير كامل',
      });
      if (saveErr || !archiveId) throw saveErr || new Error('فشل حفظ الأرشيف');

      // 3. تصفير كل البيانات
      toast({ title: 'جارٍ تصفير البيانات...' });
      const { data: resetResult, error: resetErr } = await supabase.rpc('reset_all_site_data_authenticated', {
        p_password: storedPassword,
      });
      if (resetErr) throw resetErr;

      const r = resetResult as any;
      toast({
        title: '✓ تم بنجاح',
        description: `تم حفظ الأرشيف وتصفير ${r?.questions_deleted || 0} سؤال، ${r?.reports_deleted || 0} بلاغ، ${r?.logs_deleted || 0} سجل`,
      });
      await loadArchives(storedPassword);
    } catch (err: any) {
      toast({ title: 'فشلت العملية', description: err.message || String(err), variant: 'destructive' });
    }
    setIsResetting(false);
  };

  const handleBuildOnly = async () => {
    setIsBuilding(true);
    try {
      const { blob, qCount, lCount, rCount } = await buildEncryptedZip();
      const b64 = await blobToBase64(blob);
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `archive-${ts}.zip`;
      const { error } = await supabase.rpc('save_site_archive_authenticated', {
        p_password: storedPassword,
        p_filename: filename,
        p_data_b64: b64,
        p_size_bytes: blob.size,
        p_questions_count: qCount,
        p_logs_count: lCount,
        p_reports_count: rCount,
        p_note: null,
      });
      if (error) throw error;
      toast({ title: '✓ تم حفظ الأرشيف', description: `${(blob.size / 1024).toFixed(1)} KB` });
      await loadArchives(storedPassword);
    } catch (err: any) {
      toast({ title: 'فشل', description: err.message, variant: 'destructive' });
    }
    setIsBuilding(false);
  };

  const handleDownload = async (archive: StoredArchive) => {
    const { data, error } = await supabase.rpc('get_site_archive_authenticated', {
      p_password: storedPassword, p_archive_id: archive.id,
    });
    if (error || !data || !(data as any[])[0]) {
      toast({ title: 'فشل التنزيل', variant: 'destructive' });
      return;
    }
    const row = (data as any[])[0];
    const blob = base64ToBlob(row.data_b64);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = row.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.rpc('delete_site_archive_authenticated', {
      p_password: storedPassword, p_archive_id: id,
    });
    if (error) {
      toast({ title: 'فشل الحذف', variant: 'destructive' });
      return;
    }
    toast({ title: 'تم الحذف' });
    await loadArchives(storedPassword);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background" dir="rtl">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <CardTitle>الأرشيف المشفّر</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">أدخل كلمة مرور المسؤول</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <Input type="password" placeholder="كلمة مرور المسؤول"
                value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                className="text-center" autoFocus />
              <Button type="submit" className="w-full" disabled={isVerifying || !adminPassword}>
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'دخول'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/')}>
                <Home className="w-4 h-4 ml-2" /> الرئيسية
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ArchiveIcon className="w-6 h-6 text-primary" /> الأرشيف المشفّر
          </h1>
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <Home className="w-4 h-4 ml-2" /> الإدارة
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              أرشفة + تصفير الموقع
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 text-sm space-y-1">
              <p>📦 يحفظ نسخة <strong>مشفّرة AES-256</strong> داخل الموقع، ثم <strong>يُصفّر كل البيانات</strong>.</p>
              <p>🔑 كلمة فك ضغط الأرشيف: <strong className="text-primary">2020</strong></p>
              <p className="text-xs text-muted-foreground">يشمل التصفير: الأسئلة، البلاغات، سجلات الأمان، سجل الإشعارات، الإعلانات، الرسائل الومضية.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button onClick={handleBuildOnly} disabled={isBuilding || isResetting} variant="outline">
                {isBuilding ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <ArchiveIcon className="w-4 h-4 ml-2" />}
                أرشفة فقط
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={isBuilding || isResetting} variant="destructive">
                    {isResetting ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <RefreshCw className="w-4 h-4 ml-2" />}
                    أرشفة + تصفير الكل
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent dir="rtl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" /> تأكيد التصفير
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      سيتم حفظ نسخة مشفّرة من جميع البيانات داخل الموقع، ثم <strong>حذف كل شيء</strong> (الأسئلة، البلاغات، السجلات، الإشعارات، الإعلانات). لا يمكن التراجع.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction onClick={handleArchiveAndReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      نعم، أرشف وصفّر
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الأرشيفات المحفوظة ({archives.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingList ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : archives.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">لا توجد أرشيفات بعد</p>
            ) : (
              <div className="space-y-2">
                {archives.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{a.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleString('ar')} · {(a.size_bytes / 1024).toFixed(1)} KB
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.questions_count} سؤال · {a.logs_count} سجل · {a.reports_count} بلاغ
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleDownload(a)} title="تنزيل">
                        <Download className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-destructive" title="حذف">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>حذف الأرشيف؟</AlertDialogTitle>
                            <AlertDialogDescription>{a.filename}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(a.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
