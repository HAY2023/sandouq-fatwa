import { useFlashMessages } from '@/hooks/useFlashMessages';
import { X, Megaphone } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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
    <div className="w-full space-y-3">
      {visibleMessages.map((message) => (
        <FlashMessageItem
          key={message.id}
          message={message}
          isVisible={visible.includes(message.id)}
          onDismiss={() => handleDismiss(message.id)}
        />
      ))}
    </div>
  );
}

function FlashMessageItem({ 
  message, 
  isVisible, 
  onDismiss 
}: { 
  message: { 
    id: string; 
    message: string; 
    text_direction: string; 
    color: string;
    font_size?: string | null;
  }; 
  isVisible: boolean;
  onDismiss: () => void;
}) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [needsMarquee, setNeedsMarquee] = useState(false);
  
  const fontSize = fontSizeMap[(message.font_size as keyof typeof fontSizeMap) || 'md'] || fontSizeMap.md;
  const textColor = getContrastColor(message.color);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && containerRef.current) {
        const textWidth = textRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth - 100; // Account for icon and button
        setNeedsMarquee(textWidth > containerWidth);
      }
    };
    
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [message.message]);

  return (
    <div
      dir={message.text_direction}
      className={`
        relative overflow-hidden
        flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
      style={{ 
        backgroundColor: message.color,
        color: textColor
      }}
    >
      <Megaphone className="w-5 h-5 flex-shrink-0" />
      <div ref={containerRef} className="flex-1 overflow-hidden">
        {needsMarquee ? (
          <div className="animate-marquee-smooth whitespace-nowrap">
            <p ref={textRef} className={`inline-block font-medium ${fontSize}`}>
              {message.message}
            </p>
            <span className="inline-block w-24"></span>
            <p className={`inline-block font-medium ${fontSize}`}>
              {message.message}
            </p>
          </div>
        ) : (
          <p ref={textRef} className={`font-medium ${fontSize} truncate`}>
            {message.message}
          </p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="p-1.5 hover:opacity-70 transition-opacity rounded-full hover:bg-black/10 flex-shrink-0"
        aria-label="إغلاق"
      >
        <X className="w-4 h-4" />
      </button>
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
