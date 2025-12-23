import { useAnnouncements } from '@/hooks/useAnnouncements';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const colorMap = {
  info: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-green-500/10 text-green-600 border-green-500/20',
  warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
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
    <div className="space-y-2">
      {visibleAnnouncements.map((announcement) => {
        const Icon = iconMap[announcement.type] || Info;
        const colorClass = colorMap[announcement.type] || colorMap.info;

        return (
          <div
            key={announcement.id}
            className={`flex items-center gap-3 px-4 py-3 border rounded-lg ${colorClass}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium">{announcement.message}</p>
            <button
              onClick={() => setDismissed(prev => [...prev, announcement.id])}
              className="p-1 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
