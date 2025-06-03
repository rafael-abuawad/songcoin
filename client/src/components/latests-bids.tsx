import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auctionAbi } from "@/lib/abi";
import { auctionAddress } from "@/lib/constants";
import { Music } from "lucide-react";
import { useReadContract } from "wagmi";

export function LatestBids() {
  const { data: currentRoundId } = useReadContract({
    address: auctionAddress,
    abi: auctionAbi,
    functionName: "get_current_round_id",
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

  console.log({ latestBids, currentRoundId, error, isLoading });

  const emptyLatestBids =
    latestBids?.filter((bid) => bid.title !== "").length === 0;

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
              .map((bid, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border bg-secondary/10 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Music className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{bid.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {bid.artist}
                      </p>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
