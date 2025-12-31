import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Question {
  id: string;
  category: string;
  question_text: string;
  created_at: string;
  review_status: string | null;
  reviewed_text: string | null;
  reviewer_notes: string | null;
}

export interface AccessLog {
  id: string;
  accessed_at: string;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  screen_size: string | null;
  is_authorized: boolean | null;
  password_attempted: boolean | null;
}

export function useGetQuestionsAuthenticated() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { data, error } = await supabase.rpc('get_questions_authenticated', {
        p_password: password
      });
      
      if (error) throw error;
      return data as Question[];
    },
  });
}

export function useGetAccessLogsAuthenticated() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { data, error } = await supabase.rpc('get_admin_access_logs_authenticated', {
        p_password: password
      });
      
      if (error) throw error;
      return data as AccessLog[];
    },
  });
}

export function useUpdateQuestionReview() {
  return useMutation({
    mutationFn: async (params: {
      password: string;
      questionId: string;
      review_status: string;
      reviewed_text?: string;
      reviewer_notes?: string;
    }) => {
      const { data, error } = await supabase.rpc('update_question_review_authenticated', {
        p_password: params.password,
        p_question_id: params.questionId,
        p_review_status: params.review_status,
        p_reviewed_text: params.reviewed_text || null,
        p_reviewer_notes: params.reviewer_notes || null,
      });
      if (error) throw error;
      return data;
    },
  });
}
