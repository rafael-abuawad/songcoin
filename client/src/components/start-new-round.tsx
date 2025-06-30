import { useAccount, useClient, useWriteContract } from "wagmi";
import { Button } from "./ui/button";
import { auctionAbi } from "@/lib/abi";
import { auctionAddress } from "@/lib/constants";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { AlertCircleIcon, Check, Loader2 } from "lucide-react";
import { useModal } from "connectkit";
import { toast } from "sonner";
import { useContext, useEffect } from "react";
import { CurrentRoundContext } from "@/context/current-round.context";
import { waitForTransactionReceipt } from "viem/actions";
import { cn } from "@/lib/utils";

export default function StartNewRound({ className }: { className?: string }) {
  const client = useClient();
  const { writeContractAsync, isError, isPending, isSuccess, error } =
    useWriteContract();
  const { isConnected } = useAccount();
  const { setOpen } = useModal();
  const { refetch } = useContext(CurrentRoundContext);

  const handleStartNewRound = async () => {
    if (!isConnected || !client) {
      setOpen(true);
      return;
    }

    try {
      toast.loading("Starting new round...");
      const tx = await writeContractAsync({
        address: auctionAddress,
        abi: auctionAbi,
        functionName: "end_round_and_start_new_round",
      });
      await waitForTransactionReceipt(client, { hash: tx, confirmations: 2 });
      await refetch();
      toast.dismiss();
      toast.success("New round started!");
    } catch (error) {
      console.error(error);
      toast.error("Unable to start new round.");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("New round started");
    }

    if (isError) {
      toast(() => (
        <Alert variant="destructive" className="bg-red-600/10 border-none">
          <AlertCircleIcon className="stroke-red-600" />
          <AlertTitle className="text-red-600">
            Unable to start new round.
          </AlertTitle>
          <AlertDescription className="text-red-600">
            <p className="truncate">{error?.message}</p>
          </AlertDescription>
        </Alert>
      ));
    }
  }, [isError, isSuccess]);

  return (
    <Button
      variant={isError ? "destructive" : "default"}
      size="sm"
      disabled={isPending || isSuccess || isError}
      onClick={handleStartNewRound}
      className={cn(className, "cursor-pointer hover:animate-pulse")}
    >
      {isPending && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Starting new round...</span>
        </>
      )}

      {isSuccess && (
        <>
          <Check className="h-3 w-3" />
          <span>New round started</span>
        </>
      )}

      {!isPending && !isSuccess && !isError && (
        <>
          <span>Start New Round</span>
        </>
      )}
      {isError && (
        <>
          <AlertCircleIcon />
          <span>Unable to start new round.</span>
        </>
      )}
    </Button>
  );
}
