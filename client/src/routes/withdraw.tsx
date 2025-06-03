import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectKitButton } from "connectkit";
import { formatEther } from "viem";
import { useReadContract, useWriteContract } from "wagmi";
import { auctionAbi } from "@/lib/abi";
import { auctionAddress } from "@/lib/constants";
import { toast } from "sonner";
import { useState } from "react";
import { Wallet } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/withdraw")({
  component: WithdrawPage,
});

function WithdrawPage() {
  const { isConnected, address } = useAccount();
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  // Get current round ID to know which rounds to check
  const { data: currentRoundId } = useReadContract({
    address: auctionAddress,
    abi: auctionAbi,
    functionName: "get_current_round_id",
  });

  // Get pending returns for all rounds up to current round
  const { data: pendingReturns, refetch } = useReadContract({
    address: auctionAddress,
    abi: auctionAbi,
    functionName: "pending_returns",
    args: [address ?? "0x0", currentRoundId ?? 0n],
    query: {
      enabled: !!address && !!currentRoundId,
    },
  });

  const { writeContractAsync } = useWriteContract();

  const handleWithdraw = async (roundId: bigint) => {
    if (!address) return;

    setIsLoading((prev) => ({ ...prev, [roundId.toString()]: true }));

    try {
      await writeContractAsync({
        address: auctionAddress,
        abi: auctionAbi,
        functionName: "withdraw",
        args: [roundId],
      });

      toast.success("Successfully withdrew pending returns!");
      refetch();
    } catch (error) {
      console.error("Error withdrawing:", error);
      toast.error("Failed to withdraw. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, [roundId.toString()]: false }));
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-6">
        <h1 className="mb-6 text-center text-5xl font-thin modak-font">
          Withdraw
        </h1>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Pending Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <ConnectKitButton.Custom>
                {({ show }) => (
                  <Button className="w-full" onClick={show}>
                    <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                  </Button>
                )}
              </ConnectKitButton.Custom>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-xl px-4 py-6">
      <h1 className="mb-6 text-center text-5xl font-thin modak-font">
        Withdraw
      </h1>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Withdraw Pending Returns</CardTitle>
          </CardHeader>
          <CardContent>
            {currentRoundId && pendingReturns && pendingReturns > 0n ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-secondary/10">
                  <div>
                    <p className="font-medium">
                      Round {currentRoundId.toString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Pending Returns: {formatEther(pendingReturns)} SONGCOIN
                    </p>
                  </div>
                  <Button
                    onClick={() => handleWithdraw(currentRoundId)}
                    disabled={isLoading[currentRoundId.toString()]}
                  >
                    {isLoading[currentRoundId.toString()]
                      ? "Withdrawing..."
                      : "Withdraw"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                No pending returns available for withdrawal.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
