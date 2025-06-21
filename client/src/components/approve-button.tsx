import { useWriteContract } from "wagmi";
import { Button } from "./ui/button";
import { erc20Abi } from "viem";
import { auctionAddress, songcoinAddress } from "@/lib/constants";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function ApproveButton({
  bidAmount,
  onSuccess,
  className,
}: {
  bidAmount: bigint;
  onSuccess: () => void;
  className?: string;
}) {
  const { writeContract, status, failureReason } = useWriteContract();

  const handleApprove = () => {
    writeContract({
      abi: erc20Abi,
      address: songcoinAddress,
      functionName: "approve",
      args: [auctionAddress, bidAmount],
    });
  };

  useEffect(() => {
    if (status === "success") {
      onSuccess();
    }
  }, [status, onSuccess]);

  const isPending = status === "pending";
  const isSuccess = status === "success";
  const isError = status === "error";

  const buttonText = isError
    ? "Retry"
    : isPending
      ? "Approving..."
      : isSuccess
        ? "Approved"
        : "Approve";

  const button = (
    <Button
      onClick={handleApprove}
      variant="secondary"
      disabled={isPending || isSuccess}
      className={cn(isPending && "animate-pulse", className)}
      type="button"
    >
      {buttonText}
    </Button>
  );

  if (isSuccess) {
    return null;
  }

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
