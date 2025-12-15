export const QUESTION_CATEGORIES = [
  { value: 'worship', label: 'العبادات' },
  { value: 'transactions', label: 'المعاملات' },
  { value: 'family', label: 'الأسرة والنكاح' },
  { value: 'creed', label: 'العقيدة' },
  { value: 'morals', label: 'الأخلاق والسلوك' },
  { value: 'other', label: 'أخرى' },
] as const;

export type QuestionCategory = typeof QUESTION_CATEGORIES[number]['value'];

export function getCategoryLabel(value: string): string {
  const category = QUESTION_CATEGORIES.find(c => c.value === value);
  return category?.label || value;
}
