import { useAccount, useWriteContract } from "wagmi";
import { Button } from "./ui/button";
import { auctionAbi } from "@/lib/abi";
import { auctionAddress } from "@/lib/constants";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { AlertCircleIcon, Check, Loader2 } from "lucide-react";
import { useModal } from "connectkit";
import { toast } from "sonner";
import { useEffect } from "react";

export default function StartNewRound() {
  const { writeContractAsync, isError, isPending, isSuccess, error } =
    useWriteContract();
  const { isConnected } = useAccount();
  const { setOpen } = useModal();

  const handleStartNewRound = async () => {
    if (!isConnected) {
      setOpen(true);
      return;
    }

    toast.promise(
      writeContractAsync({
        address: auctionAddress,
        abi: auctionAbi,
        functionName: "end_round_and_start_new_round",
      }),
      {
        loading: "Starting new round...",
        success: "New round started",
        error: "Unable to start new round.",
      },
    );
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("New round started");
    }

    if (isError) {
      toast(() => (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Unable to start new round.</AlertTitle>
          <AlertDescription>
            <p>{error?.message}</p>
          </AlertDescription>
        </Alert>
      ));
    }
  }, [isError, isSuccess]);

  return (
    <Button
      variant={isError ? "destructive" : "secondary"}
      size="sm"
      disabled={isPending || isSuccess || isError}
      onClick={handleStartNewRound}
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
          <div className="relative">
            <span className="absolute inline-flex top-1 h-3 w-3 animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
          </div>
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
