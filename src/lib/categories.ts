export const QUESTION_CATEGORIES = [
  { value: 'worship', label: 'العبادات' },
  { value: 'transactions', label: 'المعاملات' },
  { value: 'family', label: 'الأسرة والنكاح' },
  { value: 'creed', label: 'العقيدة' },
  { value: 'morals', label: 'الأخلاق والسلوك' },
  { value: 'other', label: 'أخرى' },
] as const;

export type QuestionCategory = typeof QUESTION_CATEGORIES[number]['value'];
