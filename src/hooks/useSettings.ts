import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Settings {
  id: string;
  is_box_open: boolean;
  next_session_date: string | null;
  video_url: string | null;
  video_title: string | null;
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('id, is_box_open, next_session_date, video_url, video_title')
        .maybeSingle();
      
      if (error) throw error;
      return data as Settings | null;
    },
  });
}

export function useVerifyAdminPassword() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { data, error } = await supabase.rpc('verify_admin_password', {
        input_password: password
      });
      
      if (error) throw error;
      return data as boolean;
    },
  });
}

export function useUpdateSettingsAuthenticated() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      password: string;
      is_box_open?: boolean;
      next_session_date?: string;
      video_url?: string;
      video_title?: string;
    }) => {
      const { data, error } = await supabase.rpc('update_settings_authenticated', {
        p_password: params.password,
        p_is_box_open: params.is_box_open,
        p_next_session_date: params.next_session_date,
        p_video_url: params.video_url,
        p_video_title: params.video_title,
      });
      
      if (error) throw error;
      return data as boolean;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function useGetQuestionsCountAuthenticated() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { data, error } = await supabase.rpc('get_questions_count_authenticated', {
        p_password: password
      });
      
      if (error) throw error;
      return data as number;
    },
  });
}

export function useUpdateAdminPassword() {
  return useMutation({
    mutationFn: async (params: { oldPassword: string; newPassword: string }) => {
      const { data, error } = await supabase.rpc('update_admin_password', {
        p_old_password: params.oldPassword,
        p_new_password: params.newPassword,
      });
      
      if (error) throw error;
      return data as boolean;
    },
  });
}
