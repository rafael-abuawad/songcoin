import { Music } from "lucide-react";
import type { Round } from "@/lib/types";
import { formatEther } from "viem";

export function Bid({ bid }: { bid: Round }) {
  const song = bid.song;
  return (
    <div
      key={bid.id}
      className="flex items-center justify-between rounded-lg border bg-secondary/10 p-3"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
          <Music className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{song.title}</p>
          <p className="text-xs text-muted-foreground">{song.artist}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-primary">
          Ξ {formatEther(bid.highest_bid)}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          {bid.highest_bidder}
        </p>
      </div>
    </div>
  );
}
