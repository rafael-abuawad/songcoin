import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, DiscIcon, Wallet } from "lucide-react";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { auctionAddress, songcoinAddress } from "@/lib/constants";
import {
  erc20Abi,
  formatEther,
  hashMessage,
  parseUnits,
  type Address,
} from "viem";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { auctionAbi } from "@/lib/abi";
import { ApproveButton } from "./approve-button";
import { BidButton } from "./bid-button";
import { useContext, useState } from "react";
import { CurrentRoundContext } from "@/context/current-round.context";
import { Countdown } from "./countdown";
import { EmbededDialog } from "./embeded-dialog";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface FormContext {
  highestBid: bigint;
}

const formSchema = z.object({
  songName: z
    .string()
    .min(1, "Song name is required")
    .max(32, "Song name must be less than 32 characters"),
  artistName: z
    .string()
    .min(1, "Artist name is required")
    .max(32, "Artist name must be less than 32 characters"),
  songUrl: z
    .string()
    .min(1, "Spotify embed code is required")
    .refine((url) => {
      const iframeRegex =
        /<iframe[^>]*src="(https:\/\/open\.spotify\.com\/embed\/track\/[^"]+)"[^>]*>/;
      return iframeRegex.test(url);
    }, "Invalid Spotify embed code. Please use the embed code from Spotify."),
  bidAmount: z
    .string()
    .min(1, "Bid amount is required")
    .refine((val) => !isNaN(Number(val)), "Must be a valid number")
    .superRefine((val, ctx) => {
      const ctxt = ctx.path[0] as unknown as FormContext;
      const highestBid = ctxt?.highestBid;
      if (!highestBid) return;

      if (Number(val) <= Number(formatEther(highestBid))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bid must be higher than current highest bid",
        });
      }
    }),
});

type FormValues = z.infer<typeof formSchema>;

export function BiddingForm() {
  const { currentRound, isLoading, isError } = useContext(CurrentRoundContext);
  const { isConnected, address } = useAccount();
  const [bidSuccess, setBidSuccess] = useState(false);
  const { data } = useBalance({
    address: address ?? ("" as Address),
    token: songcoinAddress,
  });
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: songcoinAddress,
    functionName: "allowance",
    args: [address ?? ("" as Address), auctionAddress],
  });
  const { data: highestBid, refetch: refetchHighestBid } = useReadContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: "get_current_round_highest_bid",
  });
  const { decimals, value: balance } = data ?? { decimals: 18, value: 0n };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      songName: "",
      artistName: "",
      songUrl: "",
      bidAmount: "",
    },
    context: {
      highestBid,
    } as FormContext,
  });

  const validateSpotifyEmbed = (url: string) => {
    try {
      const iframeRegex = /<iframe[^>]*src="([^"]+)"[^>]*>/;
      const match = url.match(iframeRegex);
      if (!match) return "";

      const srcUrl = match[1];
      // Validate that it's a Spotify embed URL
      if (!srcUrl.startsWith("https://open.spotify.com/embed/track/")) {
        return "";
      }
      return srcUrl;
    } catch {
      return "";
    }
  };

  const handleBalanceClick = () => {
    const value = formatEther(balance ?? 0n);
    form.setValue("bidAmount", value);
  };

  const handleMinClick = () => {
    const minBidAmount = +formatEther(highestBid ?? 0n) + 1;
    const value = minBidAmount.toFixed(3);
    form.setValue("bidAmount", value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit(() => null)(e);
  };

  const refetchData = () => {
    refetchHighestBid();
    refetchAllowance();
  };

  const handleBidSuccess = () => {
    refetchData();
    setBidSuccess(true);
  };

  const bidAmount = form.watch("bidAmount") || "0";
  const bidAmountParsed = parseUnits(bidAmount, decimals ?? 18);
  const minBidAmount = +formatEther(highestBid ?? 0n) + 1;

  if (!address && !isConnected) {
    return (
      <ConnectKitButton.Custom>
        {({ show }) => {
          return (
            <Button className="w-full" variant="secondary" onClick={show}>
              <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
            </Button>
          );
        }}
      </ConnectKitButton.Custom>
    );
  }

  return (
    <>
      <div className="pb-2">
        <h3 className="text-lg font-semibold">Place Your Bid</h3>
        <p className="text-sm text-muted-foreground">
          Current highest bid:{" "}
          <span className="font-semibold text-primary">
            {formatEther(highestBid ?? 0n)} SONGCOIN
          </span>
        </p>
      </div>

      {/* Countdown Timer */}
      <div>
        {isLoading ? (
          <div className="animate-pulse h-32 bg-muted rounded-xl" />
        ) : isError || !currentRound ? (
          <div className="text-destructive text-center py-8 rounded-xl border bg-destructive/10">
            Unable to load auction info.
          </div>
        ) : (
          <Countdown endTime={Number(currentRound.end_time)} />
        )}
      </div>

      <Form {...form}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Song Name */}
          <FormField
            control={form.control}
            name="songName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Song Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter song name"
                    className="bg-secondary/10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Artist Name */}
          <FormField
            control={form.control}
            name="artistName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Artist Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter artist name"
                    className="bg-secondary/10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Song Embed Spotify Code - Responsive Dialog/Drawer */}
          <FormField
            control={form.control}
            name="songUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Song Embed Spotify Code</FormLabel>
                <EmbededDialog
                  value={field.value}
                  onChange={field.onChange}
                  FormMessage={<FormMessage />}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bid Amount */}
          <FormField
            control={form.control}
            name="bidAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Bid (SONGCOIN)</FormLabel>
                <div className="flex items-center rounded-md border bg-secondary/10 px-3">
                  <span className="text-muted-foreground">
                    <DiscIcon className="h-4 w-4" />
                  </span>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      min={minBidAmount.toFixed(3)}
                      placeholder={`Min: ${minBidAmount.toFixed(3)} SONGCOIN`}
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                      {...field}
                    />
                  </FormControl>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-2">
                  <p className="text-xs text-muted-foreground">
                    Your Balance:{" "}
                    <span
                      className="underline hover:text-primary cursor-pointer"
                      onClick={handleBalanceClick}
                    >
                      {Intl.NumberFormat(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(Number(formatEther(balance ?? 0n)))}
                    </span>
                  </p>
                  <span className="hidden md:block text-xs text-muted-foreground">
                    |
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Min:{" "}
                    <span
                      className="underline hover:text-primary cursor-pointer"
                      onClick={handleMinClick}
                    >
                      {Intl.NumberFormat(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(minBidAmount)}{" "}
                      SONGCOIN
                    </span>
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {bidSuccess && (
            <Alert className="mt-4 bg-green-600/10 border-none">
              <CheckCircle className="h-4 w-4 stroke-green-600" />
              <AlertTitle className="text-green-600">
                Bid Successful!
              </AlertTitle>
              <AlertDescription className="text-green-600">
                Your bid has been placed successfully. You are now the highest
                bidder!
              </AlertDescription>
            </Alert>
          )}

          {balance >= minBidAmount ? (
            <div className="flex flex-col justify-center min-h-10">
              {!allowance || allowance < bidAmountParsed || allowance === 0n ? (
                <div className="flex flex-col items-center gap-2">
                  <ApproveButton
                    className="mt-2 w-full cursor-pointer"
                    bidAmount={bidAmountParsed}
                    onSuccess={refetchData}
                    disabled={bidAmount === "0"}
                  />
                  {bidAmount === "0" ? (
                    <span className="text-xs text-muted-foreground">
                      Input a bid amount to approve.
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      You do not have enough allowance to bid. Approving{" "}
                      {formatEther(bidAmountParsed)} SONGCOIN...
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <BidButton
                    bidAmount={bidAmountParsed}
                    className="mt-2 w-full cursor-pointer"
                    song={{
                      title: form.watch("songName"),
                      artist: form.watch("artistName"),
                      iframe_hash: hashMessage(form.watch("songUrl")),
                      iframe_url: validateSpotifyEmbed(form.watch("songUrl")),
                    }}
                    onSuccess={handleBidSuccess}
                  />
                  <span className="text-xs text-muted-foreground">
                    Ready to place your bid!
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col justify-center min-h-10">
              <div className="flex flex-col items-center gap-2">
                <Button
                  className="mt-2 w-full cursor-pointer"
                  variant="secondary"
                  disabled
                >
                  Insufficient Balance
                </Button>
                <span className="text-xs text-muted-foreground">
                  You do not have enough SONGCOIN to bid.
                </span>
              </div>
            </div>
          )}
        </form>
      </Form>
    </>
  );
}
