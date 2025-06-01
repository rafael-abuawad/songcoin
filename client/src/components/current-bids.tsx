import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { truncateAddress } from "@/lib/utils";
import { Music } from "lucide-react";

export function CurrentBids() {
  // Mock data - in a real app, this would come from the blockchain
  const upcomingBids = [
    {
      id: 1,
      title: "Bohemian Rhapsody",
      artist: "Queen",
      bidAmount: 0.015,
      bidder: "0x1a2b...3c4d",
    },
    {
      id: 2,
      title: "Blinding Lights",
      artist: "The Weeknd",
      bidAmount: 0.012,
      bidder: "0x5e6f...7g8h",
    },
    {
      id: 3,
      title: "Uptown Funk",
      artist: "Mark Ronson ft. Bruno Mars",
      bidAmount: 0.01,
      bidder: "0x9i0j...1k2l",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Latest Bids</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingBids.length === 0 ? (
            <p className="text-center text-slate-400">
              No upcoming bids yet. Be the first!
            </p>
          ) : (
            upcomingBids.map((bid) => (
              <div
                key={bid.id}
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
                <div className="text-right">
                  <p className="font-bold text-primary">
                    Ξ {bid.bidAmount.toFixed(3)}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {truncateAddress(bid.bidder)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
