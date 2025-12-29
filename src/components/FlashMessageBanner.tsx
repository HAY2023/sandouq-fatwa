import { useFlashMessages } from '@/hooks/useFlashMessages';
import { X, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

export function FlashMessageBanner() {
  const { data: flashMessages, isLoading } = useFlashMessages();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [visible, setVisible] = useState<string[]>([]);

  useEffect(() => {
    if (flashMessages) {
      // Show messages with animation
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
    <div className="w-full space-y-2 px-4 py-3">
      {visibleMessages.map((message) => (
        <div
          key={message.id}
          dir={message.text_direction}
          className={`
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
          <p className="flex-1 text-sm font-medium">{message.message}</p>
          <button
            onClick={() => handleDismiss(message.id)}
            className="p-1 hover:opacity-70 transition-opacity rounded-full hover:bg-black/10"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Helper function to determine text color based on background
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
