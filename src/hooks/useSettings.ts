import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Settings {
  id: string;
  is_box_open: boolean;
  next_session_date: string | null;
  video_url: string | null;
  video_title: string | null;
  show_countdown: boolean;
  show_question_count: boolean;
  show_install_page: boolean;
  maintenance_mode?: boolean;
  maintenance_message?: string;
  content_filter_enabled?: boolean;
}

// التخزين المؤقت للإعدادات
const SETTINGS_CACHE_KEY = 'fatwa-settings-v2';

const getCachedSettings = (): Settings | null => {
  try {
    const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // صالحة لمدة ساعة واحدة
      if (Date.now() - timestamp < 3600000) {
        return data;
      }
    }
  } catch {}
  return null;
};

const setCachedSettings = (data: Settings) => {
  try {
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch {}
};

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('id, is_box_open, next_session_date, video_url, video_title, show_countdown, show_question_count, show_install_page, maintenance_mode, maintenance_message, content_filter_enabled')
        .maybeSingle();
      
      if (error) throw error;
      
      const settings = data as Settings | null;
      if (settings) {
        setCachedSettings(settings);
      }
      return settings;
    },
    // استخدام البيانات المخزنة مؤقتاً كقيمة أولية
    initialData: getCachedSettings,
    // تحديث في الخلفية
    staleTime: 1000 * 60 * 5, // 5 دقائق
    gcTime: 1000 * 60 * 60, // ساعة واحدة
    // إعادة المحاولة عند الخطأ
    retry: 2,
    retryDelay: 1000,
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
      show_countdown?: boolean;
      show_question_count?: boolean;
      show_install_page?: boolean;
      maintenance_mode?: boolean;
      maintenance_message?: string;
      content_filter_enabled?: boolean;
    }) => {
      const { data, error } = await supabase.rpc('update_settings_authenticated', {
        p_password: params.password,
        p_is_box_open: params.is_box_open,
        p_next_session_date: params.next_session_date,
        p_video_url: params.video_url,
        p_video_title: params.video_title,
        p_show_countdown: params.show_countdown,
        p_show_question_count: params.show_question_count,
        p_show_install_page: params.show_install_page,
        p_maintenance_mode: params.maintenance_mode,
        p_maintenance_message: params.maintenance_message,
        p_content_filter_enabled: params.content_filter_enabled,
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

export function useDeleteAllQuestionsAuthenticated() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { data, error } = await supabase.rpc('delete_all_questions_authenticated', {
        p_password: password,
      });
      if (error) throw error;
      return data as boolean;
    },
  });
}

export function useDeleteSelectedQuestionsAuthenticated() {
  return useMutation({
    mutationFn: async (params: { password: string; questionIds: string[] }) => {
      const { data, error } = await supabase.rpc('delete_selected_questions_authenticated', {
        p_password: params.password,
        p_question_ids: params.questionIds,
      });
      if (error) throw error;
      return data as boolean;
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

// Hook for notification settings
export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notification_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      password: string;
      notify_on_question?: boolean;
      notify_every_n_questions?: number;
    }) => {
      // First verify password
      const { data: isValid, error: verifyError } = await supabase.rpc('verify_admin_password', {
        input_password: params.password
      });
      
      if (verifyError || !isValid) {
        throw new Error('Invalid password');
      }
      
      // Update notification settings
      const { error } = await supabase
        .from('notification_settings')
        .update({
          notify_on_question: params.notify_on_question,
          notify_every_n_questions: params.notify_every_n_questions,
          updated_at: new Date().toISOString()
        })
        .eq('id', (await supabase.from('notification_settings').select('id').single()).data?.id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification_settings'] });
    },
  });
}

// Block user by IP or fingerprint
export function useBlockUser() {
  return useMutation({
    mutationFn: async (params: { 
      password: string; 
      ip_address?: string; 
      fingerprint_id?: string;
      reason?: string;
    }) => {
      const { data, error } = await supabase.rpc('block_user_authenticated', {
        p_password: params.password,
        p_ip_address: params.ip_address || null,
        p_fingerprint_id: params.fingerprint_id || null,
        p_reason: params.reason || null
      });
      
      if (error) throw error;
      return !!data;
    },
  });
}

// Unblock user
export function useUnblockUser() {
  return useMutation({
    mutationFn: async (params: { password: string; id: string }) => {
      const { data, error } = await supabase.rpc('unblock_user_authenticated', {
        p_password: params.password,
        p_blocked_id: params.id
      });
      
      if (error) throw error;
      return !!data;
    },
  });
}

// Get blocked users list
export function useGetBlockedUsers() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { data, error } = await supabase.rpc('get_blocked_users_authenticated', {
        p_password: password
      });
      
      if (error) throw error;
      return (data || []) as Array<{
        id: string;
        ip_address: string | null;
        fingerprint_id: string | null;
        reason: string | null;
        blocked_at: string;
        blocked_by: string;
      }>;
    },
  });
}
