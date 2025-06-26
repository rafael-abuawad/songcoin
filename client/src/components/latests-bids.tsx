import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auctionAbi } from "@/lib/abi";
import { auctionAddress } from "@/lib/constants";
import type { Song } from "@/lib/types";
import { Music, Crown } from "lucide-react";
import { useReadContract } from "wagmi";

export function LatestBids() {
  const { data: currentRoundId } = useReadContract({
    address: auctionAddress,
    abi: auctionAbi,
    functionName: "get_current_round_id",
  });

  const { data: currentRound } = useReadContract({
    address: auctionAddress,
    abi: auctionAbi,
    functionName: "get_current_round",
    query: {
      enabled: currentRoundId !== undefined,
    },
  });

  const {
    data: latestBids,
    error,
    isLoading,
  } = useReadContract({
    address: auctionAddress,
    abi: auctionAbi,
    functionName: "get_latests_bidded_songs",
    args: [currentRoundId ?? 0n],
    query: {
      enabled: currentRoundId !== undefined,
    },
  });

  console.log({ latestBids, currentRoundId, currentRound, error, isLoading });

  const emptyLatestBids =
    latestBids?.filter((bid) => bid.title !== "").length === 0;

  // Helper function to check if a song is the current highest bid
  const isHighestBid = (song: Song) => {
    if (!currentRound || !currentRound.song) return false;
    return (
      song.title === currentRound.song.title &&
      song.artist === currentRound.song.artist &&
      song.iframe_url === currentRound.song.iframe_url
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Latest Bids</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {emptyLatestBids || !latestBids ? (
            <p className="text-center text-sm text-muted-foreground">
              No latest bids yet. Be the first!
            </p>
          ) : (
            latestBids
              .filter((bid) => bid.title !== "")
              .reverse()
              .map((bid, i) => {
                const isHighest = isHighestBid(bid);
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      isHighest
                        ? "bg-primary/10 border-primary/20"
                        : "bg-secondary/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          isHighest
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/20 text-primary"
                        }`}
                      >
                        {isHighest ? (
                          <Crown className="h-4 w-4" />
                        ) : (
                          <Music className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{bid.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {bid.artist}
                        </p>
                      </div>
                    </div>
                    {isHighest && (
                      <div className="text-right">
                        <p className="text-xs font-medium text-primary">
                          Highest Bid
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
