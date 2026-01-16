import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const CACHE_KEY = 'cached-settings';
const CACHE_DURATION = 1000 * 60 * 60; // ساعة واحدة

interface CachedSettings {
  id: string;
  is_box_open: boolean;
  next_session_date: string | null;
  video_url: string | null;
  video_title: string | null;
  show_countdown: boolean;
  show_question_count: boolean;
  show_install_page: boolean;
  cached_at: number;
}

// حفظ الإعدادات في localStorage
const cacheSettings = (settings: Omit<CachedSettings, 'cached_at'>) => {
  try {
    const cached: CachedSettings = {
      ...settings,
      cached_at: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.error('Error caching settings:', error);
  }
};

// جلب الإعدادات المخزنة
const getCachedSettings = (): CachedSettings | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const parsed: CachedSettings = JSON.parse(cached);
    
    // التحقق من صلاحية التخزين المؤقت
    if (Date.now() - parsed.cached_at > CACHE_DURATION) {
      return null; // انتهت صلاحية التخزين المؤقت
    }
    
    return parsed;
  } catch (error) {
    console.error('Error reading cached settings:', error);
    return null;
  }
};

export function useOfflineSettings() {
  const [settings, setSettings] = useState<CachedSettings | null>(getCachedSettings);
  const [isLoading, setIsLoading] = useState(!getCachedSettings());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('id, is_box_open, next_session_date, video_url, video_title, show_countdown, show_question_count, show_install_page')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const newSettings = {
          ...data,
          show_install_page: data.show_install_page ?? false,
        };
        setSettings({ ...newSettings, cached_at: Date.now() });
        cacheSettings(newSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // استخدام الإعدادات المخزنة في حالة الخطأ
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      fetchSettings(); // تحديث عند العودة للإنترنت
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // جلب الإعدادات إذا كنا متصلين
    if (navigator.onLine) {
      fetchSettings();
    } else {
      setIsLoading(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    isOnline,
    refetch: fetchSettings,
  };
}
