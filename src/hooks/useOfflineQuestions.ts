import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OfflineQuestion {
  id: string;
  category: string;
  question_text: string;
  timestamp: number;
}

const DB_NAME = 'fatwa-offline-db';
const STORE_NAME = 'pending-questions';
const DB_VERSION = 1;

// فتح قاعدة البيانات
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// حفظ سؤال
const saveQuestion = async (question: OfflineQuestion): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(question);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// جلب جميع الأسئلة المحفوظة
const getAllQuestions = async (): Promise<OfflineQuestion[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

// حذف سؤال
const deleteQuestion = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export function useOfflineQuestions() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // تحديث عدد الأسئلة المعلقة
  const updatePendingCount = useCallback(async () => {
    try {
      const questions = await getAllQuestions();
      setPendingCount(questions.length);
    } catch (error) {
      console.error('Error getting pending questions:', error);
    }
  }, []);

  // مزامنة الأسئلة المعلقة
  const syncPendingQuestions = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    
    setIsSyncing(true);
    try {
      const questions = await getAllQuestions();
      
      if (questions.length === 0) {
        setIsSyncing(false);
        return;
      }

      let successCount = 0;
      
      for (const q of questions) {
        try {
          const { error } = await supabase
            .from('questions')
            .insert({
              category: q.category,
              question_text: q.question_text,
            });
          
          if (!error) {
            await deleteQuestion(q.id);
            successCount++;
          }
        } catch (err) {
          console.error('Error syncing question:', err);
        }
      }
      
      if (successCount > 0) {
        toast({
          title: '✅ تمت المزامنة',
          description: `تم إرسال ${successCount} سؤال محفوظ`,
        });
      }
      
      await updatePendingCount();
    } catch (error) {
      console.error('Error syncing questions:', error);
    }
    setIsSyncing(false);
  }, [isSyncing, toast, updatePendingCount]);

  // حفظ سؤال للإرسال لاحقاً
  const saveForLater = useCallback(async (category: string, question_text: string) => {
    const question: OfflineQuestion = {
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category,
      question_text,
      timestamp: Date.now(),
    };
    
    await saveQuestion(question);
    await updatePendingCount();
    
    toast({
      title: '💾 تم الحفظ',
      description: 'سيُرسل السؤال تلقائياً عند الاتصال بالإنترنت',
    });
  }, [toast, updatePendingCount]);

  // مراقبة حالة الاتصال
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: '🌐 متصل بالإنترنت',
        description: 'جارٍ مزامنة الأسئلة المحفوظة...',
      });
      syncPendingQuestions();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: '📴 غير متصل',
        description: 'سيتم حفظ أسئلتك وإرسالها عند الاتصال',
        variant: 'destructive',
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // تحديث العدد عند التحميل
    updatePendingCount();
    
    // محاولة المزامنة عند التحميل
    if (navigator.onLine) {
      syncPendingQuestions();
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingQuestions, toast, updatePendingCount]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    saveForLater,
    syncPendingQuestions,
  };
}
