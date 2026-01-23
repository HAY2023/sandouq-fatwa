import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  style?: number;
}

export function CountdownTimer({ targetDate, style = 1 }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-8 text-center shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuMSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary-foreground animate-pulse" />
        <p className="text-2xl md:text-3xl text-primary-foreground font-bold">
          🎉 الحلقة الآن أو قريبًا جدًا! 🎉
        </p>
      </div>
    );
  }

  // بناء وحدات الوقت مع إخفاء الأيام إذا كانت 0
  const timeUnits = [
    ...(timeLeft.days > 0 ? [{ value: timeLeft.days, label: 'DAYS', arabicLabel: 'يوم' }] : []),
    { value: timeLeft.hours, label: 'HOURS', arabicLabel: 'ساعة' },
    { value: timeLeft.minutes, label: 'MINUTES', arabicLabel: 'دقيقة' },
    { value: timeLeft.seconds, label: 'SECONDS', arabicLabel: 'ثانية' },
  ];

  // النمط 1: LED أخضر (الافتراضي)
  if (style === 1) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-black/95 border border-green-900/50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-green-500/5"></div>
        
        <div className="relative p-6 md:p-8">
          <div className="text-center mb-6">
            <h3 className="text-lg md:text-xl font-bold text-green-400/80">
              الحلقة القادمة بعد
            </h3>
          </div>
          
          <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap" dir="ltr">
            {timeUnits.map((unit, index) => (
              <div key={index} className="flex items-center">
                <div className="relative text-center">
                  <div 
                    className="font-mono text-5xl md:text-7xl font-bold text-green-400 tabular-nums tracking-wider"
                    style={{
                      textShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.4), 0 0 60px rgba(34, 197, 94, 0.2)',
                      fontFamily: '"Share Tech Mono", "Courier New", monospace',
                    }}
                  >
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  
                  <div 
                    className="text-[10px] md:text-xs font-medium text-green-600/70 uppercase tracking-widest mt-1"
                    style={{ textShadow: '0 0 10px rgba(34, 197, 94, 0.5)' }}
                  >
                    {unit.label}
                  </div>
                </div>
                
                {index < timeUnits.length - 1 && (
                  <div 
                    className="text-4xl md:text-6xl font-bold text-green-400 mx-1 md:mx-3 animate-pulse"
                    style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.4)' }}
                  >
                    :
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 h-0.5 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
        </div>
      </div>
    );
  }

  // النمط 2: بطاقات زرقاء
  if (style === 2) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/90 to-indigo-900/90 border border-blue-500/30 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.3),transparent_50%)]"></div>
        
        <div className="relative p-6 md:p-8">
          <div className="text-center mb-6">
            <h3 className="text-lg md:text-xl font-bold text-blue-200">
              الحلقة القادمة بعد
            </h3>
          </div>
          
          <div className="flex justify-center items-center gap-3 md:gap-5 flex-wrap" dir="ltr">
            {timeUnits.map((unit, index) => (
              <div key={index} className="flex items-center">
                <div className="relative text-center">
                  <div className="bg-blue-800/50 backdrop-blur-sm border border-blue-400/30 rounded-xl p-4 md:p-6 min-w-[70px] md:min-w-[100px]">
                    <div className="text-4xl md:text-6xl font-bold text-white tabular-nums">
                      {String(unit.value).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="text-xs md:text-sm font-medium text-blue-300 mt-2">
                    {unit.arabicLabel}
                  </div>
                </div>
                
                {index < timeUnits.length - 1 && (
                  <div className="text-3xl md:text-5xl font-bold text-blue-400 mx-1 md:mx-2 animate-pulse">
                    :
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // النمط 3: دوائر متحركة
  if (style === 3) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/90 to-pink-900/90 border border-purple-500/30 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.2),transparent_40%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.2),transparent_40%)]"></div>
        
        <div className="relative p-6 md:p-8">
          <div className="text-center mb-6">
            <h3 className="text-lg md:text-xl font-bold text-purple-200">
              الحلقة القادمة بعد
            </h3>
          </div>
          
          <div className="flex justify-center items-center gap-4 md:gap-6 flex-wrap" dir="ltr">
            {timeUnits.map((unit, index) => {
              const maxValue = unit.label === 'DAYS' ? 30 : unit.label === 'HOURS' ? 24 : 60;
              const percentage = (unit.value / maxValue) * 100;
              
              return (
                <div key={index} className="relative">
                  <div className="relative w-20 h-20 md:w-28 md:h-28">
                    {/* خلفية الدائرة */}
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        fill="none"
                        stroke="rgba(168,85,247,0.2)"
                        strokeWidth="4"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${percentage * 2.83} 283`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* الرقم في الوسط */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl md:text-4xl font-bold text-white">
                        {String(unit.value).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] md:text-xs text-purple-300">
                        {unit.arabicLabel}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // النمط 4: بسيط أنيق
  if (style === 4) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
        
        <div className="relative p-6 md:p-8">
          <div className="text-center mb-6">
            <h3 className="text-lg md:text-xl font-bold text-foreground">
              الحلقة القادمة بعد
            </h3>
          </div>
          
          <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap" dir="ltr">
            {timeUnits.map((unit, index) => (
              <div key={index} className="flex items-center">
                <div className="text-center px-4 py-3 bg-muted rounded-lg">
                  <div className="text-3xl md:text-5xl font-bold text-primary tabular-nums">
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">
                    {unit.arabicLabel}
                  </div>
                </div>
                
                {index < timeUnits.length - 1 && (
                  <div className="text-2xl md:text-4xl font-bold text-muted-foreground mx-1 md:mx-2">
                    :
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // النمط 5: ذهبي فخم
  if (style === 5) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/90 to-yellow-950/90 border border-amber-500/40 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.15),transparent_60%)]"></div>
        
        <div className="relative p-6 md:p-8">
          <div className="text-center mb-6">
            <h3 className="text-lg md:text-xl font-bold text-amber-200 drop-shadow-lg">
              ✨ الحلقة القادمة بعد ✨
            </h3>
          </div>
          
          <div className="flex justify-center items-center gap-3 md:gap-5 flex-wrap" dir="ltr">
            {timeUnits.map((unit, index) => (
              <div key={index} className="flex items-center">
                <div className="relative text-center">
                  <div className="bg-gradient-to-b from-amber-800/50 to-amber-900/50 backdrop-blur-sm border-2 border-amber-400/50 rounded-xl p-4 md:p-5 min-w-[65px] md:min-w-[90px] shadow-lg shadow-amber-500/20">
                    <div 
                      className="text-3xl md:text-5xl font-bold bg-gradient-to-b from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent tabular-nums"
                      style={{ textShadow: '0 2px 10px rgba(251,191,36,0.3)' }}
                    >
                      {String(unit.value).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="text-xs md:text-sm font-medium text-amber-300/80 mt-2">
                    {unit.arabicLabel}
                  </div>
                </div>
                
                {index < timeUnits.length - 1 && (
                  <div className="text-3xl md:text-5xl font-bold text-amber-400/60 mx-1 md:mx-2 animate-pulse">
                    :
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-center">
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  // الافتراضي: النمط 1
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black/95 border border-green-900/50 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-green-500/5"></div>
      
      <div className="relative p-6 md:p-8">
        <div className="text-center mb-6">
          <h3 className="text-lg md:text-xl font-bold text-green-400/80">
            الحلقة القادمة بعد
          </h3>
        </div>
        
        <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap" dir="ltr">
          {timeUnits.map((unit, index) => (
            <div key={index} className="flex items-center">
              <div className="relative text-center">
                <div 
                  className="font-mono text-5xl md:text-7xl font-bold text-green-400 tabular-nums tracking-wider"
                  style={{
                    textShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.4), 0 0 60px rgba(34, 197, 94, 0.2)',
                    fontFamily: '"Share Tech Mono", "Courier New", monospace',
                  }}
                >
                  {String(unit.value).padStart(2, '0')}
                </div>
                
                <div 
                  className="text-[10px] md:text-xs font-medium text-green-600/70 uppercase tracking-widest mt-1"
                  style={{ textShadow: '0 0 10px rgba(34, 197, 94, 0.5)' }}
                >
                  {unit.label}
                </div>
              </div>
              
              {index < timeUnits.length - 1 && (
                <div 
                  className="text-4xl md:text-6xl font-bold text-green-400 mx-1 md:mx-3 animate-pulse"
                  style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.4)' }}
                >
                  :
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 h-0.5 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
      </div>
    </div>
  );
}