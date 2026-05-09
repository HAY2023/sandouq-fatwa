import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { getCategoryLabel } from '@/lib/categories';

export interface ArchiveProgress {
  step: string;
  percent: number;
}

export async function buildAndDownloadArchive(
  password: string,
  onProgress?: (p: ArchiveProgress) => void
): Promise<{ size: number; filename: string }> {
  const zip = new JSZip();
  const root = zip.folder('sandouq-fatwa-archive')!;
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

  onProgress?.({ step: 'الأسئلة', percent: 10 });
  const { data: questions } = await supabase.rpc('get_questions_authenticated', { p_password: password });
  const qList = (questions as any[]) || [];
  root.file('questions/questions.json', JSON.stringify(qList, null, 2));
  // Excel
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(
    qList.map((q, i) => ({
      '#': i + 1,
      'التصنيف': getCategoryLabel(q.category),
      'السؤال': q.question_text,
      'التاريخ': new Date(q.created_at).toLocaleString('ar-SA'),
      'حالة المراجعة': q.review_status || '',
    }))
  );
  ws['!cols'] = [{ wch: 5 }, { wch: 20 }, { wch: 60 }, { wch: 22 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws, 'الأسئلة');
  const xlsxBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  root.file('questions/questions.xlsx', xlsxBuffer);

  onProgress?.({ step: 'سجلات الأمان', percent: 35 });
  const { data: logs } = await supabase.rpc('get_admin_access_logs_authenticated', { p_password: password });
  root.file('security/access_logs.json', JSON.stringify(logs || [], null, 2));

  onProgress?.({ step: 'الإعدادات', percent: 55 });
  const { data: settings } = await supabase.from('settings').select('*');
  root.file('settings/settings.json', JSON.stringify(settings || [], null, 2));

  onProgress?.({ step: 'البلاغات', percent: 70 });
  const { data: reports } = await supabase.rpc('get_user_reports_authenticated', { p_password: password });
  root.file('reports/user_reports.json', JSON.stringify(reports || [], null, 2));

  onProgress?.({ step: 'محتوى عام', percent: 80 });
  const [{ data: videos }, { data: announcements }, { data: flash }, { data: notifs }] = await Promise.all([
    supabase.from('videos').select('*'),
    supabase.from('announcements').select('*'),
    supabase.from('flash_messages').select('*'),
    supabase.rpc('get_notification_history_authenticated', { p_password: password }),
  ]);
  root.file('content/videos.json', JSON.stringify(videos || [], null, 2));
  root.file('content/announcements.json', JSON.stringify(announcements || [], null, 2));
  root.file('content/flash_messages.json', JSON.stringify(flash || [], null, 2));
  root.file('content/notification_history.json', JSON.stringify(notifs || [], null, 2));

  root.file(
    'README.txt',
    `أرشيف صندوق فتوى\nتاريخ التصدير: ${new Date().toLocaleString('ar-SA')}\nالأسئلة: ${qList.length}\nسجلات الأمان: ${(logs as any[])?.length || 0}\nالبلاغات: ${(reports as any[])?.length || 0}\n\nملاحظة: تم استخدام صيغة ZIP (مضغوطة بالكامل) لتوافقها مع جميع الأنظمة بدون برامج إضافية. يمكن فتحه على ويندوز / ماك / أندرويد / آيفون مباشرة، أو عبر 7-Zip / WinRAR.`
  );

  onProgress?.({ step: 'ضغط الأرشيف', percent: 90 });
  const blob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } },
    (meta) => onProgress?.({ step: 'ضغط الأرشيف', percent: 90 + Math.round(meta.percent / 10) })
  );

  const filename = `sandouq-fatwa-archive-${stamp}.zip`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  onProgress?.({ step: 'اكتمل', percent: 100 });
  return { size: blob.size, filename };
}
