import { useEffect, useState, useCallback } from 'react';
import { WifiOff, Wifi, RefreshCw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const queryClient = useQueryClient();

  const handleManualSync = useCallback(async () => {
    setIsSyncing(true);
    setSyncComplete(false);
    
    try {
      // Invalidate and refetch all queries
      await queryClient.invalidateQueries();
      
      // Clear settings cache
      localStorage.removeItem('fatwa-settings-cache');
      
      setSyncComplete(true);
      setTimeout(() => setSyncComplete(false), 2000);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [queryClient]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // إظهار عند التحميل إذا كان غير متصل
    if (!navigator.onLine) {
      setShowStatus(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={`fixed top-0 left-0 right-0 z-[100] py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-3 ${
            isOnline 
              ? 'bg-green-500 text-white' 
              : 'bg-destructive text-destructive-foreground'
          }`}
        >
          {isOnline ? (
            <>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                <span>تم استعادة الاتصال</span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="h-7 px-3 bg-white/20 hover:bg-white/30 text-white border-0"
              >
                {syncComplete ? (
                  <>
                    <Check className="w-3 h-3 ml-1" />
                    تم
                  </>
                ) : isSyncing ? (
                  <>
                    <RefreshCw className="w-3 h-3 ml-1 animate-spin" />
                    جارٍ المزامنة...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 ml-1" />
                    مزامنة الآن
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowStatus(false)}
                className="h-7 px-2 text-white hover:bg-white/20"
              >
                ✕
              </Button>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 animate-pulse" />
              <span>لا يوجد اتصال بالإنترنت - يعمل الموقع في الوضع المحفوظ</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
