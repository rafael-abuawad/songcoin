import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConnectKitButton } from "connectkit";
import { formatEther } from "viem";
import { useReadContract, useWriteContract } from "wagmi";
import { auctionAbi } from "@/lib/abi";
import { auctionAddress } from "@/lib/constants";
import { toast } from "sonner";
import { Wallet } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/withdraw")({
  component: WithdrawPage,
});

function WithdrawPage() {
  const { isConnected, address } = useAccount();

  const { data: totalPendingReturns, refetch } = useReadContract({
    address: auctionAddress,
    abi: auctionAbi,
    functionName: "get_total_pending_returns",
    args: [address ?? "0x0"],
    query: {
      enabled: !!address,
    },
  });

  const { writeContractAsync } = useWriteContract();

  const handleClaimPendingReturns = async () => {
    if (!address) return;
    toast.promise(Promise.all([
      writeContractAsync({
        address: auctionAddress,
        abi: auctionAbi,
        functionName: "claim_pending_returns",
      }),
      refetch()
    ]), {
      loading: "Claiming pending returns...",
      success: "Successfully claimed pending returns!",
      error: "Failed to claim pending returns. Please try again.",
    });
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
            <CardDescription>
              Pending returns are the amount of Songcoin that you have won in
              the auction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {totalPendingReturns && totalPendingReturns > 0n ? (
              <div className="space-y-4">
                <div className="flex p-4 rounded-lg border bg-secondary/10">
                  <div className="flex-1 text-left">
                    <p className="text-sm text-muted-foreground">
                      Total Pending Returns: {formatEther(totalPendingReturns)}{" "}
                      SONGCOIN
                    </p>
                  </div>
                  <Button onClick={handleClaimPendingReturns}>
                    Claim Returns
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-left text-muted-foreground">
                No pending returns available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
