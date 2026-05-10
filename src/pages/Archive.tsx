import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, Archive as ArchiveIcon, Home, Loader2, Download, ShieldCheck } from 'lucide-react';
import { ZipWriter, BlobWriter, TextReader } from '@zip.js/zip.js';

// كلمة مرور تشفير الأرشيف (تُستخدم لفك ضغط الملف الناتج)
const ARCHIVE_ZIP_PASSWORD = '2020';

export default function Archive() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storedPassword, setStoredPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [lastBuildInfo, setLastBuildInfo] = useState<{ size: number; questions: number; logs: number } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) return;
    setIsVerifying(true);
    try {
      // فحص حالة القفل أولاً
      const { data: lockStatus } = await supabase.rpc('check_admin_lock_status');
      if (lockStatus && (lockStatus as any).is_locked) {
        const mins = Math.ceil((lockStatus as any).remaining_seconds / 60);
        toast({
          title: '🔒 الحساب مقفل',
          description: `تم قفل الحساب بسبب محاولات فاشلة. حاول بعد ${mins} دقيقة.`,
          variant: 'destructive',
        });
        setIsVerifying(false);
        return;
      }

      const { data: isValid, error } = await supabase.rpc('verify_admin_password', {
        input_password: adminPassword,
      });
      if (error) throw error;

      if (isValid === true) {
        setStoredPassword(adminPassword);
        setIsAuthenticated(true);
        toast({ title: 'تم التحقق', description: 'يمكنك الآن إنشاء الأرشيف المشفّر' });
      } else {
        const { data: newLock } = await supabase.rpc('check_admin_lock_status');
        const remaining = 5 - ((newLock as any)?.failed_attempts || 0);
        toast({
          title: 'كلمة المرور غير صحيحة',
          description: remaining > 0
            ? `متبقي ${remaining} محاولات قبل القفل`
            : 'تم قفل الحساب لمدة 15 دقيقة',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message || 'فشل التحقق', variant: 'destructive' });
    }
    setIsVerifying(false);
  };

  const handleBuildArchive = async () => {
    setIsBuilding(true);
    try {
      // جلب الأسئلة
      const { data: questions, error: qErr } = await supabase.rpc('get_questions_authenticated', {
        p_password: storedPassword,
      });
      if (qErr) throw qErr;

      // جلب سجلات الدخول الإدارية
      const { data: logs, error: lErr } = await supabase.rpc('get_admin_access_logs_authenticated', {
        p_password: storedPassword,
      });
      if (lErr) throw lErr;

      const questionsArr = questions || [];
      const logsArr = logs || [];

      // إنشاء ZIP مشفّر بـ AES-256
      const zipWriter = new ZipWriter(new BlobWriter('application/zip'), {
        password: ARCHIVE_ZIP_PASSWORD,
        encryptionStrength: 3, // AES-256
      });

      const meta = {
        generated_at: new Date().toISOString(),
        questions_count: questionsArr.length,
        logs_count: logsArr.length,
        note: 'أرشيف مشفّر — كلمة فك الضغط: 2020',
      };

      await zipWriter.add('README.txt',
        new TextReader(
          `أرشيف صندوق الفتاوى\n` +
          `تاريخ الإنشاء: ${new Date().toLocaleString('ar')}\n` +
          `عدد الأسئلة: ${questionsArr.length}\n` +
          `عدد السجلات: ${logsArr.length}\n\n` +
          `كلمة فك الضغط: 2020\n` +
          `التشفير: AES-256\n`
        )
      );
      await zipWriter.add('meta.json', new TextReader(JSON.stringify(meta, null, 2)));
      await zipWriter.add('questions.json', new TextReader(JSON.stringify(questionsArr, null, 2)));
      await zipWriter.add('access_logs.json', new TextReader(JSON.stringify(logsArr, null, 2)));

      const blob = await zipWriter.close();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `archive-${ts}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastBuildInfo({ size: blob.size, questions: questionsArr.length, logs: logsArr.length });
      toast({
        title: '✓ تم إنشاء الأرشيف',
        description: `حجم الملف: ${(blob.size / 1024).toFixed(1)} KB`,
      });
    } catch (err: any) {
      toast({ title: 'فشل إنشاء الأرشيف', description: err.message || String(err), variant: 'destructive' });
    }
    setIsBuilding(false);
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
            <p className="text-sm text-muted-foreground mt-2">
              أدخل كلمة مرور المسؤول للوصول إلى أداة الأرشفة
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <Input
                type="password"
                placeholder="كلمة مرور المسؤول"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="text-center"
                autoFocus
              />
              <Button type="submit" className="w-full" disabled={isVerifying || !adminPassword}>
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'دخول'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/')}
              >
                <Home className="w-4 h-4 ml-2" />
                العودة للرئيسية
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
            <ArchiveIcon className="w-6 h-6 text-primary" />
            الأرشيف المشفّر
          </h1>
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <Home className="w-4 h-4 ml-2" />
            لوحة الإدارة
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              إنشاء أرشيف مشفّر بـ AES-256
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 text-sm space-y-1">
              <p>📦 المحتوى: <strong>الأسئلة</strong> + <strong>سجلات الدخول الإدارية</strong></p>
              <p>🔐 التشفير: <strong>AES-256</strong></p>
              <p>🔑 كلمة فك الضغط: <strong className="text-primary">2020</strong></p>
              <p className="text-xs text-muted-foreground pt-2">
                لفتح الملف الناتج: استخدم 7-Zip أو WinRAR أو أي أداة تدعم ZIP المشفّر، وأدخل كلمة المرور <strong>2020</strong>.
              </p>
            </div>

            <Button
              onClick={handleBuildArchive}
              disabled={isBuilding}
              className="w-full"
              size="lg"
            >
              {isBuilding ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جارٍ التجميع والتشفير...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 ml-2" />
                  إنشاء وتنزيل الأرشيف
                </>
              )}
            </Button>

            {lastBuildInfo && (
              <div className="p-3 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400 text-sm">
                ✓ آخر أرشيف: {lastBuildInfo.questions} سؤال، {lastBuildInfo.logs} سجل،{' '}
                {(lastBuildInfo.size / 1024).toFixed(1)} KB
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
