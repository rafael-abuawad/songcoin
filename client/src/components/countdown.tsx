import { useEffect, useState } from "react";
import { Label } from "./ui/label";
import StartNewRound from "./start-new-round";

interface CountdownProps {
  endTime: number;
}

function getTimeLeft(endTime: number) {
  const now = Math.floor(Date.now() / 1000);
  let diff = endTime - now;
  if (diff < 0) diff = 0;
  const days = Math.floor(diff / (60 * 60 * 24));
  const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((diff % (60 * 60)) / 60);
  const seconds = diff % 60;
  return { days, hours, minutes, seconds, ended: endTime <= now };
}

export function Countdown({ endTime }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="grid gap-2 pb-4">
      <Label>Auction ends in</Label>
      <div className="flex gap-2 w-full">
        {timeLeft.ended && (
          <div className="flex flex-col gap-1 items-center bg-muted rounded-lg flex-grow py-4">
            <div className="rounded-lg p-2 font-bold text-muted-foreground">
              Auction ended
            </div>
            <StartNewRound />
          </div>
        )}
        {!timeLeft.ended &&
          [
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Minutes", value: timeLeft.minutes },
            { label: "Seconds", value: timeLeft.seconds },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center bg-card rounded-lg flex-grow"
            >
              <div className="rounded-lg p-2 text-3xl font-bold mb-1">
                {String(value).padStart(2, "0")}
              </div>
              <div className="text-xs font-medium tracking-wide uppercase opacity-80 mb-2">
                {label}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
