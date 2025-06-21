import { auctionAbi } from "@/lib/abi";
import { auctionAddress, songcoinAddress } from "@/lib/constants";
import { erc20Abi, type Hash } from "viem";
import { useAccount, useReadContracts, useWriteContract } from "wagmi";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface BidButtonProps {
  bidAmount: bigint;
  song: {
    title: string;
    artist: string;
    iframe_hash: Hash;
    iframe_url: string;
  };
  onSuccess: () => void;
  className?: string;
}

export function BidButton({
  bidAmount,
  song,
  onSuccess,
  className,
}: BidButtonProps) {
  const { address } = useAccount();
  if (!address) return null;

  const { writeContractAsync, isPending, isError, isSuccess, failureReason } =
    useWriteContract();
  const { data } = useReadContracts({
    contracts: [
      {
        address: auctionAddress,
        abi: auctionAbi,
        functionName: "get_current_round_highest_bid",
      },
      {
        address: songcoinAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address, auctionAddress],
      },
    ],
  });

  const currentHighestBid = data?.[0]?.result;
  const bidIsTooLow = !!currentHighestBid && currentHighestBid > bidAmount;
  const allowance = data?.[1]?.result;
  const insufficientAllowance = !!allowance && allowance < bidAmount;
  const isDisabled = bidIsTooLow || insufficientAllowance || isPending;

  const handleBid = async () => {
    if (bidIsTooLow) return;
    if (insufficientAllowance) return;
    if (!song.iframe_url) return;
    if (!song.iframe_url || song.iframe_url.trim() === "") return;

    try {
      toast.loading("Bidding...");
      await writeContractAsync({
        address: auctionAddress,
        abi: auctionAbi,
        functionName: "bid",
        args: [bidAmount, song],
      });
      onSuccess();
      toast.success("Bid successful");
    } catch (error) {
      console.error(error);
      toast.error(() => {
        return (
          <div>
            <p>An error occurred</p>
            <p>{failureReason?.message ?? "Unknown error"}</p>
          </div>
        );
      });
    }
  };

  const buttonText = isPending
    ? "Bidding..."
    : bidIsTooLow
      ? "Bid is too low"
      : insufficientAllowance
        ? "Insufficient allowance"
        : isError
          ? "An error occurred. Try again."
          : isSuccess
            ? "Bid successful"
            : "Bid";

  if (insufficientAllowance) {
    return null;
  }

  return isError ? (
    <div className="flex flex-col gap-2">
      <Button
        type="submit"
        className={className}
        disabled={isDisabled}
        onClick={handleBid}
      >
        {buttonText}
      </Button>
      <p className="text-red-500">{failureReason?.message}</p>
    </div>
  ) : (
    <Button
      type="submit"
      className={className}
      disabled={isDisabled}
      onClick={handleBid}
    >
      {buttonText}
    </Button>
  );
}
