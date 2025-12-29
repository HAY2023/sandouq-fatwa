import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubmitQuestion } from '@/hooks/useQuestions';
import { QUESTION_CATEGORIES } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Send, Tag, MessageSquare } from 'lucide-react';

export function QuestionForm() {
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const submitQuestion = useSubmitQuestion();

  const isRTL = i18n.language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !questionText.trim()) {
      toast({
        title: t('common.alert'),
        description: t('toast.categoryRequired'),
        variant: 'destructive',
      });
      return;
    }

    try {
      await submitQuestion.mutateAsync({
        category: category,
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
    setQuestionText('');
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
        <Select value={category} onValueChange={setCategory}>
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
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <MessageSquare className="w-4 h-4 text-accent" />
          <span>{t('form.questionLabel')}</span>
          <span className="text-destructive">{t('form.required')}</span>
        </label>
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder={t('form.questionPlaceholder')}
          className="min-h-[120px] resize-none bg-background"
          dir={isRTL ? 'rtl' : 'ltr'}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        size="lg"
        disabled={submitQuestion.isPending}
      >
        <Send className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        {submitQuestion.isPending ? t('form.submitting') : t('form.submit')}
      </Button>
    </form>
  );
}