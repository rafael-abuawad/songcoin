import { useClient, useWriteContract } from "wagmi";
import { Button } from "./ui/button";
import { erc20Abi } from "viem";
import { auctionAddress, songcoinAddress } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { waitForTransactionReceipt } from "viem/actions";

export function ApproveButton({
  bidAmount,
  onSuccess,
  className,
  disabled,
}: {
  bidAmount: bigint;
  onSuccess: () => void;
  className?: string;
  disabled?: boolean;
}) {
  const client = useClient();
  const [isApproving, setIsApproving] = useState(false);
  const { writeContractAsync, status, failureReason } = useWriteContract();

  const handleApprove = async () => {
    if (!client) return;

    try {
      setIsApproving(true);
      toast.loading("Approving...");
      const tx = await writeContractAsync({
        abi: erc20Abi,
        address: songcoinAddress,
        functionName: "approve",
        args: [auctionAddress, bidAmount],
      });
      await waitForTransactionReceipt(client, { hash: tx, confirmations: 2 });

      toast.dismiss();
      toast.success("Approval successful!");
      onSuccess();
      setIsApproving(false);
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error("Approval failed");
    }
  };

  const isPending = status === "pending";
  const isSuccess = status === "success";
  const isError = status === "error";

  const buttonText = isError
    ? "Retry"
    : isPending || isApproving
      ? "Approving..."
      : isSuccess
        ? "Approved"
        : "Approve";

  const button = (
    <Button
      onClick={isSuccess ? onSuccess : handleApprove}
      disabled={isPending || isApproving || disabled}
      className={cn((isPending || isApproving) && "animate-pulse", className)}
      type="button"
    >
      {buttonText}
    </Button>
  );

  if (isError) {
    return (
      <div className="flex flex-col gap-2">
        {button}
        <p className="text-red-500">{failureReason?.message}</p>
      </div>
    );
  }

  return button;
}
