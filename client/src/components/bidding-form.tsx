import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DiscIcon, Music, Wallet } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  useAccount,
  useBalance,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { ConnectKitButton } from "connectkit";
import { auctionAbi } from "@/lib/abi";
import { auctionAddress, songcoinAddress } from "@/lib/constants";
import {
  erc20Abi,
  formatEther,
  formatUnits,
  hashMessage,
  parseUnits,
  type Address,
} from "viem";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface FormContext {
  currentRound:
    | {
        highest_bid: bigint;
      }
    | undefined;
  allowance: bigint;
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
      const currentRound = (ctx.path[0] as unknown as FormContext)
        ?.currentRound;
      console.log("ctx", ctx);
      console.log("currentRound", currentRound);
      if (!currentRound) return;
      if (Number(val) <= Number(formatEther(currentRound.highest_bid))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bid must be higher than current highest bid",
        });
      }
    }),
});

type FormValues = z.infer<typeof formSchema>;

export function BiddingForm() {
  const { isConnected, address } = useAccount();
  const result = useReadContracts({
    contracts: [
      {
        abi: auctionAbi,
        address: auctionAddress,
        functionName: "get_current_round",
      },
      {
        abi: erc20Abi,
        address: songcoinAddress,
        functionName: "allowance",
        args: [address ?? ("" as Address), auctionAddress],
      },
    ],
    query: {
      enabled: !!address && isConnected,
    },
  });

  const currentRound = result.data?.[0]?.result;
  const allowance = result.data?.[1]?.result;

  const { data: songCoinBalance } = useBalance({
    address: address,
    token: songcoinAddress,
    query: {
      enabled: isConnected,
    },
  });
  const { writeContractAsync } = useWriteContract();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      songName: "",
      artistName: "",
      songUrl: "",
      bidAmount: "",
    },
    context: {
      currentRound,
      allowance,
    } as FormContext,
  });

  const validateSpotifyEmbed = (url: string) => {
    try {
      const iframeRegex = /<iframe[^>]*src="([^"]+)"[^>]*>/;
      const match = url.match(iframeRegex);
      if (!match) return null;

      const srcUrl = match[1];
      // Validate that it's a Spotify embed URL
      if (!srcUrl.startsWith("https://open.spotify.com/embed/track/")) {
        return null;
      }
      return srcUrl;
    } catch {
      return null;
    }
  };

  const handleBalanceClick = () => {
    form.setValue("bidAmount", formatEther(songCoinBalance?.value ?? 0n));
  };

  const onSubmit = async (values: FormValues) => {
    if (!currentRound) return;

    const spotifyUrl = validateSpotifyEmbed(values.songUrl);
    if (!spotifyUrl) {
      toast.error(
        "Invalid Spotify embed URL. Please use the embed code from Spotify.",
      );
      return;
    }

    setIsSubmitting(true);
    if (
      allowance &&
      Number(formatUnits(allowance ?? 0n, songCoinBalance?.decimals ?? 18)) <
        Number(values.bidAmount)
    ) {
      toast.promise(
        writeContractAsync({
          abi: erc20Abi,
          address: songcoinAddress,
          functionName: "approve",
          args: [
            auctionAddress,
            parseUnits(values.bidAmount, songCoinBalance?.decimals ?? 18),
          ],
        }),
        {
          loading: "Approving allowance...",
          success: "Allowance approved successfully!",
          error: (error) => {
            console.error("Error approving allowance:", error);
            return "Failed to approve allowance. Please try again. ";
          },
        },
      );
    }

    toast.promise(
      writeContractAsync({
        abi: auctionAbi,
        address: auctionAddress,
        functionName: "bid",
        args: [
          parseUnits(values.bidAmount, songCoinBalance?.decimals ?? 18),
          {
            title: values.songName,
            artist: values.artistName,
            iframe_hash: hashMessage(spotifyUrl),
            iframe_url: spotifyUrl,
          },
        ],
      }),
      {
        loading: "Placing bid...",
        success: () => {
          form.reset();
          return "Bid placed successfully!";
        },
        error: (error) => {
          console.error("Error placing bid:", error);
          return "Failed to place bid. Please try again. ";
        },
      },
    );
    setIsSubmitting(false);
  };

  return (
    <div className="p-3 bg-card rounded-lg border">
      <div className="pb-2">
        <h3 className="text-lg font-semibold">Place Your Bid</h3>
        <p className="text-sm text-muted-foreground">
          Current highest bid:{" "}
          <span className="font-semibold text-primary">
            {formatEther(currentRound?.highest_bid ?? 0n)} SONGCOIN
          </span>
        </p>
      </div>
      <div>
        {!isConnected ? (
          <ConnectKitButton.Custom>
            {({ show }) => {
              return (
                <Button className="w-full" variant="secondary" onClick={show}>
                  <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                </Button>
              );
            }}
          </ConnectKitButton.Custom>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <FormField
                control={form.control}
                name="songUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Song Embed Spotify Code</FormLabel>
                    <div className="rounded-md border bg-secondary/10">
                      <div className="mb-2 flex items-center gap-2 p-3">
                        <Music className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Paste iframe HTML code below
                        </span>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="<iframe src='https://open.spotify.com/embed/track/...' ...></iframe>"
                          className="min-h-[100px] border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <p className="text-xs text-muted-foreground underline">
                      <a
                        href="https://developer.spotify.com/documentation/embeds/tutorials/creating-an-embed"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        We currently only support Spotify embeds. You can get
                        the embed code by right clicking on the Spotify player
                        and selecting "Embed track".
                      </a>
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          min={
                            +formatEther(currentRound?.highest_bid ?? 0n) +
                            0.001
                          }
                          placeholder={`Min: ${(+formatEther(currentRound?.highest_bid ?? 0n) + 0.001).toFixed(3)} SONGCOIN`}
                          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Balance:{" "}
                      <span
                        className="underline hover:text-primary cursor-pointer"
                        onClick={handleBalanceClick}
                      >
                        {formatEther(songCoinBalance?.value ?? 0n)} SONGCOIN
                      </span>
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className="mt-2 w-full cursor-pointer"
                variant="secondary"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Confirming on blockchain..." : "Place Bid"}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
