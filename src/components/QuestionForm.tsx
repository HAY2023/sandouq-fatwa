import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubmitQuestion } from '@/hooks/useQuestions';
import { useOfflineQuestions } from '@/hooks/useOfflineQuestions';
import { QUESTION_CATEGORIES } from '@/lib/categories';
import { validateWithToast, questionSchema } from '@/lib/validations';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Send, Tag, MessageSquare, Sparkles, Loader2, WifiOff, CloudUpload } from 'lucide-react';
import { VoiceInput } from '@/components/VoiceInput';

export function QuestionForm() {
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const { toast } = useToast();
  const submitQuestion = useSubmitQuestion();
  const { isOnline, pendingCount, saveForLater, isSyncing } = useOfflineQuestions();

  const isRTL = i18n.language === 'ar';

  const correctionMessages = {
    ar: {
      short: 'يرجى كتابة سؤال أطول للتصحيح',
      corrected: 'تم تصحيح السؤال تلقائياً',
      correct: 'سؤالك مكتوب بشكل صحيح',
      error: 'فشل التصحيح، حاول مرة أخرى',
    },
    fr: {
      short: 'Veuillez écrire une question plus longue',
      corrected: 'Question corrigée automatiquement',
      correct: 'Votre question est correcte',
      error: 'Échec de la correction, réessayez',
    },
    en: {
      short: 'Please write a longer question',
      corrected: 'Question automatically corrected',
      correct: 'Your question is correct',
      error: 'Correction failed, try again',
    },
  };

  const msgs = correctionMessages[i18n.language as keyof typeof correctionMessages] || correctionMessages.ar;

  const handleCorrectQuestion = async () => {
    if (!questionText.trim() || questionText.trim().length < 10) {
      toast({
        title: t('common.alert'),
        description: msgs.short,
        variant: 'destructive',
      });
      return;
    }

    setIsCorrecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('correct-question', {
        body: { question: questionText.trim() }
      });

      if (error) throw error;

      if (data.hasCorrections && data.corrected) {
        setQuestionText(data.corrected);
        toast({
          title: '✨',
          description: msgs.corrected,
        });
      } else {
        toast({
          title: '✓',
          description: msgs.correct,
        });
      }
    } catch (error) {
      console.error('Error correcting question:', error);
      toast({
        title: t('common.error'),
        description: msgs.error,
        variant: 'destructive',
      });
    }
    setIsCorrecting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateWithToast(
      questionSchema,
      {
        category,
        question_text: questionText.trim(),
        customCategory: category === 'other' ? customCategory.trim() : undefined,
      },
      (msg) => toast({ title: t('common.alert'), description: msg, variant: 'destructive' })
    );

    if (!validation) return;

    if (category === 'other' && !customCategory.trim()) {
      toast({
        title: t('common.alert'),
        description: i18n.language === 'ar' ? 'يرجى كتابة نوع الفتوى' : 'Please specify the category',
        variant: 'destructive',
      });
      return;
    }

    const finalCategory = category === 'other' ? customCategory.trim() : category;

    // إذا كان غير متصل، احفظ للإرسال لاحقاً
    if (!isOnline) {
      await saveForLater(finalCategory, questionText.trim());
      setIsSubmitted(true);
      return;
    }

    try {
      await submitQuestion.mutateAsync({
        category: finalCategory,
        question_text: questionText.trim(),
      });
      setIsSubmitted(true);
    } catch {
      // إذا فشل الإرسال، احفظ للإرسال لاحقاً
      if (!isOnline) {
        await saveForLater(finalCategory, questionText.trim());
        setIsSubmitted(true);
      } else {
        toast({
          title: t('common.error'),
          description: t('toast.submitError'),
          variant: 'destructive',
        });
      }
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setCategory('');
    setCustomCategory('');
    setQuestionText('');
  };

  const handleVoiceTranscript = (transcript: string) => {
    setQuestionText((prev) => prev ? `${prev} ${transcript}` : transcript);
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8 animate-in fade-in duration-500">
        <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
        <h3 className="text-2xl font-bold mb-4">{t('form.successTitle')}</h3>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          {!isOnline 
            ? (i18n.language === 'ar' ? 'تم حفظ سؤالك وسيُرسل عند الاتصال بالإنترنت' : 'Your question was saved and will be sent when online')
            : t('form.successMessage')
          }
        </p>
        <Button onClick={handleReset} variant="outline" size="lg">
          {t('form.submitAnother')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* حالة الاتصال */}
      {(!isOnline || pendingCount > 0) && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          isOnline ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-destructive/10 text-destructive'
        }`}>
          {isOnline ? (
            <>
              <CloudUpload className="w-4 h-4 animate-pulse" />
              <span>
                {i18n.language === 'ar' 
                  ? `جارٍ إرسال ${pendingCount} سؤال محفوظ...`
                  : `Syncing ${pendingCount} saved questions...`
                }
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>
                {i18n.language === 'ar' 
                  ? 'غير متصل - سيُحفظ سؤالك ويُرسل عند الاتصال'
                  : 'Offline - Your question will be saved and sent when online'
                }
              </span>
            </>
          )}
        </div>
      )}

      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Tag className="w-4 h-4 text-accent" />
          <span>{t('form.categoryLabel')}</span>
          <span className="text-destructive">{t('form.required')}</span>
        </label>
        <Select value={category} onValueChange={(val) => {
          setCategory(val);
          if (val !== 'other') setCustomCategory('');
        }}>
          <SelectTrigger className={`w-full bg-background ${isRTL ? 'text-right' : 'text-left'}`}>
            <SelectValue placeholder={t('form.categoryPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {category === 'other' && (
          <Input
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder={i18n.language === 'ar' ? "اكتب نوع الفتوى (مثال: الحج، الزكاة...)" : "Specify category..."}
            className="mt-3 bg-background"
            dir={isRTL ? 'rtl' : 'ltr'}
            required
          />
        )}
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <MessageSquare className="w-4 h-4 text-accent" />
          <span>{t('form.questionLabel')}</span>
          <span className="text-destructive">{t('form.required')}</span>
        </label>
        <div className="flex gap-2">
          <Textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder={t('form.questionPlaceholder')}
            className="min-h-[120px] resize-none bg-background flex-1"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          <div className="flex flex-col gap-2 justify-end">
            <VoiceInput 
              onTranscript={handleVoiceTranscript}
              disabled={submitQuestion.isPending || isCorrecting}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCorrectQuestion}
              disabled={isCorrecting || !questionText.trim() || questionText.trim().length < 10}
              title={i18n.language === 'ar' ? "تصحيح السؤال تلقائياً" : "Auto-correct question"}
              className="h-10 w-10"
            >
              {isCorrecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        size="lg"
        disabled={submitQuestion.isPending || isCorrecting || isSyncing}
      >
        {!isOnline ? (
          <>
            <CloudUpload className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {i18n.language === 'ar' ? 'حفظ السؤال' : 'Save Question'}
          </>
        ) : (
          <>
            <Send className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {submitQuestion.isPending ? t('form.submitting') : t('form.submit')}
          </>
        )}
      </Button>
    </form>
  );
}
