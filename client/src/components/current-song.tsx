import { useState, useEffect, useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink, AlertCircle } from "lucide-react";
import { formatEther, zeroAddress } from "viem";
import { truncateAddress } from "@/lib/utils";
import { CurrentRoundContext } from "@/context/current-round.context";
import { Button } from "./ui/button";
import StartNewRound from "./start-new-round";

export function CurrentSong() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const {
    currentRound,
    isLoading,
    isFetching,
    isError,
    lastWinningRound,
    isThereALastWinningRound,
  } = useContext(CurrentRoundContext);
  const displayRound = isThereALastWinningRound
    ? lastWinningRound
    : currentRound;

  useEffect(() => {
    if (!currentRound) return;

    const timer = setInterval(() => {
      const now = new Date();
      const endTime = new Date(
        parseInt(currentRound.end_time.toString()) * 1000,
      );
      const difference = endTime.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRound]);

  if (isLoading || isFetching) {
    return (
      <Card className="overflow-hidden p-0 pb-6 gap-4">
        <div className="aspect-video w-full">
          <Skeleton className="h-full w-full" />
        </div>

        <CardContent className="pt-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !currentRound || !lastWinningRound || !displayRound) {
    return (
      <Card className="overflow-hidden p-0 pb-6 gap-4">
        <div className="aspect-video w-full bg-muted flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">
              An error occurred, please refresh the page or try again later.
            </p>
          </div>
        </div>

        <CardContent className="pt-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Waiting for the next round
            </div>
            <div className="text-lg font-bold">-- SONGCOIN</div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              No data available
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              --:--:--
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const thereAreNoBids = displayRound.highest_bidder === zeroAddress;

  if (thereAreNoBids) {
    return (
      <>
        <Card className="overflow-hidden p-0 gap-4">
          <div className="w-full h-[352px] rounded-xl flex items-center justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-primary animate-pulse">
                Be the First to Bid!
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto text-sm px-6">
                Place your bid now and become the first owner of this exclusive
                song promotion platform. Your bid could make history in the
                music promotion space.
              </p>
            </div>
          </div>
        </Card>
      </>
    );
  }

  return (
    <Card className="overflow-hidden p-0 pb-6 gap-4">
      <div className="h-[352px] w-full">
        <iframe
          src={displayRound.song.iframe_url}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <CardContent className="pt-2">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            Bid by
            <a
              href={`https://basescan.io/address/${displayRound.highest_bidder}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="font-mono text-xs font-semibold hover:text-foreground">
                {truncateAddress(displayRound.highest_bidder)}
              </span>
            </a>
          </div>
          <div className="text-lg font-bold">
            {formatEther(displayRound.highest_bid)} SONGCOIN
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            <a
              href={`https://basescan.io/address/${displayRound.highest_bidder}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground"
            >
              View on Basescan <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex items-center gap-1">
            {timeLeft.hours === 0 &&
              timeLeft.minutes === 0 &&
              timeLeft.seconds === 0 && <StartNewRound />}
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {String(timeLeft.hours).padStart(2, "0")}:
              {String(timeLeft.minutes).padStart(2, "0")}:
              {String(timeLeft.seconds).padStart(2, "0")}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
