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

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<Settings> & { id: string }) => {
      const { id, ...data } = updates;
      const { error } = await supabase
        .from('settings')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
