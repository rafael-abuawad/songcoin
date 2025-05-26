import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { ConnectKitButton } from "connectkit";
import type { Round } from "@/lib/types";
import { formatEther, zeroAddress } from "viem";
import { Link } from "@tanstack/react-router";
import Bid from "./bid";

export function CurrentBid({ currentRound }: { currentRound: Round }) {
  const { isConnected } = useAccount();

  if (currentRound.highest_bidder !== zeroAddress) {
    return (
      <div className="p-3 bg-card rounded-lg border">
        <p className="text-2xl text-muted-foreground flex items-center gap-2 justify-center">
          Current highest bid: {formatEther(currentRound.highest_bid)} SONGCOIN
        </p>
        <div>
          <Bid bid={currentRound} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-card rounded-lg border">
      <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
        Place the first bid and make history! The floor is yours to set.
      </p>
      {isConnected ? (
        <Link to="/bid">
          <Button className="w-full mt-4">
            <Sparkles className="h-4 w-4" />
            Place a bid
          </Button>
        </Link>
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
  );
}
