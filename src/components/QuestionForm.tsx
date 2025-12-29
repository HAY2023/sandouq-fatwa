import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubmitQuestion } from '@/hooks/useQuestions';
import { QUESTION_CATEGORIES } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Send, Tag, MessageSquare } from 'lucide-react';

export function QuestionForm() {
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const submitQuestion = useSubmitQuestion();

  const isRTL = i18n.language === 'ar';

  // Get translated categories
  const getTranslatedCategory = (value: string) => {
    const categoryMap: Record<string, string> = {
      'العبادات': t('categories.worship'),
      'المعاملات': t('categories.transactions'),
      'الأسرة والأحوال الشخصية': t('categories.family'),
      'الأطعمة والأشربة': t('categories.food'),
      'الأخلاق والسلوك': t('categories.ethics'),
      'أخرى': t('categories.other'),
    };
    return categoryMap[value] || value;
  };

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

    if (category === 'أخرى' && !customCategory.trim()) {
      toast({
        title: t('common.alert'),
        description: t('toast.customCategoryRequired'),
        variant: 'destructive',
      });
      return;
    }

    const finalCategory = category === 'أخرى' ? `أخرى: ${customCategory.trim()}` : category;

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

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    if (value !== 'أخرى') {
      setCustomCategory('');
    }
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
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className={`w-full bg-background ${isRTL ? 'text-right' : 'text-left'}`}>
            <SelectValue placeholder={t('form.categoryPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {getTranslatedCategory(cat.value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {category === 'أخرى' && (
          <Input
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder={t('form.customCategoryPlaceholder')}
            className="mt-3 bg-background"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        )}
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
