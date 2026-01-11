import { useFlashMessages } from '@/hooks/useFlashMessages';
import { Megaphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function FlashMessageBanner() {
  const { data: flashMessages, isLoading } = useFlashMessages();

  if (isLoading || !flashMessages || flashMessages.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-3">
      {flashMessages.map((message) => (
        <FlashMessageItem
          key={message.id}
          message={message}
        />
      ))}
    </div>
  );
}

function FlashMessageItem({ 
  message, 
}: { 
  message: { 
    id: string; 
    message: string; 
    text_direction: string; 
  }; 
}) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [needsMarquee, setNeedsMarquee] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && containerRef.current) {
        const textWidth = textRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth - 60; // Account for icon
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
      className="
        relative overflow-hidden
        flex items-center gap-4 px-6 py-5 
        bg-muted border-y border-border
        w-full
      "
    >
      <Megaphone className="w-6 h-6 flex-shrink-0 text-foreground" />
      <div ref={containerRef} className="flex-1 overflow-hidden">
        {needsMarquee ? (
          <div className="animate-marquee-smooth whitespace-nowrap">
            <p ref={textRef} className="inline-block font-medium text-lg text-foreground">
              {message.message}
            </p>
            <span className="inline-block w-24"></span>
            <p className="inline-block font-medium text-lg text-foreground">
              {message.message}
            </p>
          </div>
        ) : (
          <p ref={textRef} className="font-medium text-lg text-foreground">
            {message.message}
          </p>
        )}
      </div>
    </div>
  );
}
