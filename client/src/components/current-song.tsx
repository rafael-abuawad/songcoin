import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink, AlertCircle, Sparkles } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { auctionAbi } from "@/lib/abi";
import { formatEther, zeroAddress } from "viem";
import { auctionAddress } from "@/lib/constants";
import { Button } from "./ui/button";
import { ConnectKitButton } from "connectkit";

export function CurrentSong() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const {
    data: currentRound,
    isLoading,
    isFetching,
    isError,
    error,
  } = useReadContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: "get_current_round",
  });

  const { isConnected } = useAccount();

  useEffect(() => {
    if (!currentRound) return;

    const timer = setInterval(() => {
      const now = new Date();
      const difference =
        new Date(parseInt(currentRound.end_time.toString())).getTime() -
        now.getTime();

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

  console.log({ currentRound });
  console.log({ error, isError });

  if (isError || !currentRound) {
    return (
      <Card className="overflow-hidden p-0 pb-6 gap-4">
        <div className="aspect-video w-full bg-muted flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">No active auction at the moment</p>
          </div>
        </div>

        <CardContent className="pt-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Waiting for the next round
            </div>
            <div className="text-lg font-bold">-- ETH</div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              No transaction available
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

  const isNoBids = currentRound.highest_bidder === zeroAddress;

  if (isNoBids) {
    return (
      <>
        <Card className="overflow-hidden p-0 gap-4">
          <div className="w-full h-[352px]">
            <iframe
              style={{ borderRadius: "12px" }}
              src="https://open.spotify.com/embed/track/1IKnkAtTKion90wF8yxSgS?utm_source=generator"
              width="100%"
              height="352"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
          </div>
        </Card>
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
            Place the first bid and make history! The floor is yours to set.
          </p>
          {isConnected ? (
            <Button className="w-full mt-4">
              <Sparkles className="h-4 w-4" />
              Place a bid
            </Button>
          ) : (
            <ConnectKitButton.Custom>
              {({ show }) => {
                return (
                  <Button className="w-full mt-4" onClick={show}>
                    <Sparkles className="h-4 w-4" />
                    Connect your wallet to bid
                  </Button>
                );
              }}
            </ConnectKitButton.Custom>
          )}
        </div>
      </>
    );
  }

  if (currentRound.ended) {
    return (
      <Card className="overflow-hidden p-0 pb-6 gap-4">
        <div className="aspect-video w-full">
          <iframe
            src={currentRound.song.iframe_hash}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <CardContent className="pt-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Winner{" "}
              <span className="font-mono text-xs font-semibold">
                {currentRound.highest_bidder}
              </span>
            </div>
            <div className="text-lg font-bold">
              {formatEther(currentRound.highest_bid)} ETH
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              <a
                href={`https://etherscan.io/address/${currentRound.highest_bidder}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground"
              >
                View on Etherscan <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Round Ended
            </Badge>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Next round coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0 pb-6 gap-4">
      <div className="aspect-video w-full">
        <iframe
          src={currentRound.song.iframe_hash}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      <CardContent className="pt-2">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Bid by{" "}
            <span className="font-mono text-xs font-semibold">
              {currentRound.highest_bidder}
            </span>
          </div>
          <div className="text-lg font-bold">
            {formatEther(currentRound.highest_bid)} ETH
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            <a
              href={`https://etherscan.io/address/${currentRound.highest_bidder}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground"
            >
              View on Etherscan <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {String(timeLeft.hours).padStart(2, "0")}:
            {String(timeLeft.minutes).padStart(2, "0")}:
            {String(timeLeft.seconds).padStart(2, "0")}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
