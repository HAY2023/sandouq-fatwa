import { useAnnouncements } from '@/hooks/useAnnouncements';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X, Megaphone } from 'lucide-react';
import { useState } from 'react';

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const colorMap = {
  info: 'bg-primary text-primary-foreground',
  success: 'bg-green-600 text-white',
  warning: 'bg-amber-500 text-white',
  error: 'bg-destructive text-destructive-foreground',
};

export function AnnouncementBanner() {
  const { data: announcements, isLoading } = useAnnouncements();
  const [dismissed, setDismissed] = useState<string[]>([]);

  if (isLoading || !announcements || announcements.length === 0) {
    return null;
  }

  const visibleAnnouncements = announcements.filter(a => !dismissed.includes(a.id));

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {visibleAnnouncements.map((announcement) => {
        const Icon = iconMap[announcement.type] || Info;
        const colorClass = colorMap[announcement.type] || colorMap.info;

        return (
          <div
            key={announcement.id}
            className={`
              relative overflow-hidden rounded-xl shadow-xl
              ${colorClass}
              transform transition-all duration-300 hover:scale-[1.02]
            `}
          >
            {/* خلفية متحركة */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            
            <div className="relative flex items-center gap-4 p-6">
              <div className="flex-shrink-0 p-3 bg-white/20 rounded-full">
                <Megaphone className="w-8 h-8" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">إعلان هام</span>
                </div>
                <p className="text-xl font-bold leading-relaxed">{announcement.message}</p>
              </div>
              
              <button
                onClick={() => setDismissed(prev => [...prev, announcement.id])}
                className="p-2 hover:bg-white/20 transition-colors rounded-full flex-shrink-0"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}