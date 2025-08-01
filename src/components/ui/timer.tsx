import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TimerProps {
  endTime: Date;
  className?: string;
  variant?: "default" | "urgent" | "large";
  onExpired?: () => void;
}

export function Timer({ endTime, className, variant = "default", onExpired }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = endTime.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        onExpired?.();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpired]);

  const isUrgent = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 10;

  const variants = {
    default: "text-sm font-medium",
    urgent: cn(
      "text-base font-bold",
      isUrgent && "animate-countdown-urgency"
    ),
    large: "text-lg font-bold"
  };

  if (isExpired) {
    return (
      <div className={cn("text-destructive font-bold", className)}>
        ¡SUBASTA FINALIZADA!
      </div>
    );
  }

  return (
    <div className={cn(variants[variant], className)}>
      <div className="flex items-center gap-2">
        {timeLeft.days > 0 && (
          <>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold">{timeLeft.days}</span>
              <span className="text-xs text-muted-foreground">días</span>
            </div>
            <span className="text-muted-foreground">:</span>
          </>
        )}
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">hrs</span>
        </div>
        <span className="text-muted-foreground">:</span>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">min</span>
        </div>
        <span className="text-muted-foreground">:</span>
        <div className="flex flex-col items-center">
          <span className={cn(
            "text-2xl font-bold",
            isUrgent && "text-destructive animate-pulse"
          )}>
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-xs text-muted-foreground">seg</span>
        </div>
      </div>
    </div>
  );
}