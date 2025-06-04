import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectKitButton } from "connectkit";
import { formatEther } from "viem";
import { useReadContract, useWriteContract } from "wagmi";
import { auctionAbi } from "@/lib/abi";
import { auctionAddress } from "@/lib/constants";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/withdraw")({
  component: WithdrawPage,
});

function WithdrawPage() {
  const { isConnected, address } = useAccount();
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [selectedRoundId, setSelectedRoundId] = useState<bigint | null>(null);

  // Get current round ID to know which rounds to check
  const { data: currentRoundId } = useReadContract({
    address: auctionAddress,
    abi: auctionAbi,
    functionName: "get_current_round_id",
  });

  // Update selected round ID when current round ID changes
  useEffect(() => {
    if (currentRoundId) {
      setSelectedRoundId(currentRoundId);
    }
  }, [currentRoundId]);

  // Get pending returns for the selected round
  const { data: pendingReturns, refetch } = useReadContract({
    address: auctionAddress,
    abi: auctionAbi,
    functionName: "pending_returns",
    args: [address ?? "0x0", selectedRoundId ?? 0n],
    query: {
      enabled: !!address && !!selectedRoundId,
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
            {currentRoundId ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Select Round:</label>
                    <Select
                      value={selectedRoundId?.toString()}
                      onValueChange={(value) => setSelectedRoundId(BigInt(value))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select round" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: Number(currentRoundId) + 1 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            Round {i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {pendingReturns && pendingReturns > 0n ? (
                    <div className="flex p-4 rounded-lg border bg-secondary/10">
                      <div className="text-left">
                        <p className="font-medium">
                          Round {selectedRoundId?.toString()}
                        </p>
                        <p className="text-sm text-left text-muted-foreground">
                          Pending Returns: {formatEther(pendingReturns)} SONGCOIN
                        </p>
                      </div>
                      <Button
                        onClick={() => handleWithdraw(selectedRoundId!)}
                        disabled={isLoading[selectedRoundId!.toString()]}
                      >
                        {isLoading[selectedRoundId!.toString()]
                          ? "Withdrawing..."
                          : "Withdraw"}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-left text-muted-foreground">
                      No pending returns available for the selected round.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-left text-muted-foreground">
                Loading round information...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
