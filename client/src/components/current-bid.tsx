import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { ConnectKitButton } from "connectkit";
import { formatEther, zeroAddress } from "viem";
import { Link } from "@tanstack/react-router";
import { CurrentRoundContext } from "@/context/current-round.context";
import { useContext } from "react";
import StartNewRound from "./start-new-round";

export function CurrentBid() {
  const { isConnected } = useAccount();
  const { currentRound } = useContext(CurrentRoundContext);
  const initial = currentRound && currentRound.highest_bidder === zeroAddress;

  // Check if the current time has passed the round's end time
  const currentTime = BigInt(Math.floor(Date.now() / 1000)); // Current timestamp in seconds
  const roundEnded = currentRound && currentTime >= currentRound.end_time;

  return (
    <div className="p-3 bg-card rounded-lg border">
      {roundEnded ? (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            The current round has ended. Start a new round to continue bidding!
          </p>
          <StartNewRound className="w-full" />
        </div>
      ) : initial ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
          Place the first bid and make history! The floor is yours to set.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Current highest bid: {formatEther(currentRound?.highest_bid ?? 0n)}{" "}
          SONGCOIN
        </p>
      )}
      {!roundEnded && (
        <>
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
        </>
      )}
    </div>
  );
}
