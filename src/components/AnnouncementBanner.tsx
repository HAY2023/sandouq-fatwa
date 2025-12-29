import { useAnnouncements } from '@/hooks/useAnnouncements';
import { AlertCircle, CheckCircle, AlertTriangle, Info, Megaphone } from 'lucide-react';

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

  if (isLoading || !announcements || announcements.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {announcements.map((announcement) => {
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
            
            <div className="relative flex items-center gap-4 p-6 md:p-8">
              <div className="flex-shrink-0 p-4 bg-white/20 rounded-full">
                <Megaphone className="w-10 h-10 md:w-12 md:h-12" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-6 h-6" />
                  <span className="text-lg font-semibold opacity-90">إعلان هام</span>
                </div>
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed">
                  {announcement.message}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
