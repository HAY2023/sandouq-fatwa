import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubmitQuestion } from '@/hooks/useQuestions';
import { QUESTION_CATEGORIES } from '@/lib/categories';
import { validateWithToast, questionSchema } from '@/lib/validations';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Send, Tag, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
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

  const isRTL = i18n.language === 'ar';

  // تصحيح تلقائي بدون معاينة
  const handleCorrectQuestion = async () => {
    if (!questionText.trim() || questionText.trim().length < 10) {
      toast({
        title: 'تنبيه',
        description: 'يرجى كتابة سؤال أطول للتصحيح',
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
          title: '✨ تم التصحيح',
          description: 'تم تصحيح السؤال تلقائياً',
        });
      } else {
        toast({
          title: '✓ ممتاز!',
          description: 'سؤالك مكتوب بشكل صحيح',
        });
      }
    } catch (error) {
      console.error('Error correcting question:', error);
      toast({
        title: 'خطأ',
        description: 'فشل التصحيح، حاول مرة أخرى',
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
        description: 'يرجى كتابة نوع الفتوى',
        variant: 'destructive',
      });
      return;
    }

    const finalCategory = category === 'other' ? customCategory.trim() : category;

    try {
      await submitQuestion.mutateAsync({
        category: finalCategory,
        question_text: questionText.trim(),
      });
      setIsSubmitted(true);
    } catch {
      toast({
        title: t('common.error'),
        description: t('toast.submitError'),
        variant: 'destructive',
      });
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
          {t('form.successMessage')}
        </p>
        <Button onClick={handleReset} variant="outline" size="lg">
          {t('form.submitAnother')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            placeholder="اكتب نوع الفتوى (مثال: الحج، الزكاة، المعاملات...)"
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
              title="تصحيح السؤال تلقائياً"
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
        disabled={submitQuestion.isPending || isCorrecting}
      >
        <Send className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        {submitQuestion.isPending ? t('form.submitting') : t('form.submit')}
      </Button>
    </form>
  );
}
