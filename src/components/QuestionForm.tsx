import { useState } from 'react';
import { useSubmitQuestion } from '@/hooks/useQuestions';
import { QUESTION_CATEGORIES } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Send } from 'lucide-react';

interface QuestionFormProps {
  onClose: () => void;
}

export function QuestionForm({ onClose }: QuestionFormProps) {
  const [category, setCategory] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const submitQuestion = useSubmitQuestion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !questionText.trim()) {
      toast({
        title: 'تنبيه',
        description: 'يرجى اختيار التصنيف وكتابة السؤال',
        variant: 'destructive',
      });
      return;
    }

    try {
      await submitQuestion.mutateAsync({
        category,
        question_text: questionText.trim(),
      });
      setIsSubmitted(true);
    } catch {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إرسال السؤال',
        variant: 'destructive',
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12 px-6 animate-in fade-in duration-500">
        <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
        <h3 className="text-2xl font-bold mb-4">وصل سؤالك</h3>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          سيتم الإجابة عليه في الحلقة القادمة إن شاء الله
        </p>
        <Button onClick={onClose} variant="outline" size="lg">
          العودة
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div>
        <label className="block text-sm font-medium mb-2">تصنيف السؤال</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full text-right">
            <SelectValue placeholder="اختر التصنيف" />
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
        <label className="block text-sm font-medium mb-2">السؤال</label>
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="اكتب سؤالك هنا..."
          className="min-h-[150px] resize-none"
          dir="rtl"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1"
          size="lg"
          disabled={submitQuestion.isPending}
        >
          <Send className="w-4 h-4 ml-2" />
          {submitQuestion.isPending ? 'جارٍ الإرسال...' : 'إرسال السؤال'}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={onClose}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
