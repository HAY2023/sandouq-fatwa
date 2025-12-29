import { useFlashMessages } from '@/hooks/useFlashMessages';
import { X, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

const fontSizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export function FlashMessageBanner() {
  const { data: flashMessages, isLoading } = useFlashMessages();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [visible, setVisible] = useState<string[]>([]);

  useEffect(() => {
    if (flashMessages) {
      const newVisible = flashMessages
        .filter(m => !dismissed.includes(m.id))
        .map(m => m.id);
      setVisible(newVisible);
    }
  }, [flashMessages, dismissed]);

  if (isLoading || !flashMessages || flashMessages.length === 0) {
    return null;
  }

  const visibleMessages = flashMessages.filter(m => !dismissed.includes(m.id));

  if (visibleMessages.length === 0) {
    return null;
  }

  const handleDismiss = (id: string) => {
    setVisible(prev => prev.filter(v => v !== id));
    setTimeout(() => {
      setDismissed(prev => [...prev, id]);
    }, 300);
  };

  return (
    <div className="w-full space-y-2">
      {visibleMessages.map((message) => {
        const fontSize = fontSizeMap[(message as any).font_size as keyof typeof fontSizeMap] || fontSizeMap.md;
        
        return (
          <div
            key={message.id}
            dir={message.text_direction}
            className={`
              relative overflow-hidden
              flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
              transform transition-all duration-300 ease-in-out
              ${visible.includes(message.id) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
            `}
            style={{ 
              backgroundColor: message.color,
              color: getContrastColor(message.color)
            }}
          >
            <Bell className="w-5 h-5 flex-shrink-0 animate-pulse" />
            <div className="flex-1 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap">
                <p className={`inline-block font-medium ${fontSize}`}>{message.message}</p>
                <span className="inline-block w-16"></span>
                <p className={`inline-block font-medium ${fontSize}`}>{message.message}</p>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(message.id)}
              className="p-1 hover:opacity-70 transition-opacity rounded-full hover:bg-black/10 flex-shrink-0"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}