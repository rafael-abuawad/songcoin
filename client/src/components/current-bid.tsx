import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { ConnectKitButton } from "connectkit";
import { formatEther, zeroAddress } from "viem";
import { Link } from "@tanstack/react-router";
import { CurrentRoundContext } from "@/context/current-round.context";
import { useContext } from "react";

export function CurrentBid() {
  const { isConnected } = useAccount();
  const { currentRound } = useContext(CurrentRoundContext);
  const initial = currentRound && currentRound.highest_bidder === zeroAddress;

  return (
    <div className="p-3 bg-card rounded-lg border">
      {initial ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
          Place the first bid and make history! The floor is yours to set.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Current highest bid: {formatEther(currentRound?.highest_bid ?? 0n)}{" "}
          SONGCOIN
        </p>
      )}
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
