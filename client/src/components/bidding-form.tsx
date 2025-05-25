import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DiscIcon, Music, Wallet } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";

export function BiddingForm() {
  const { isConnected } = useAccount();
  const [songUrl, setSongUrl] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [songName, setSongName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current highest bid for the next slot
  const currentHighestBid = 0.015;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // In a real app, this would create a blockchain transaction
    console.log("Submitting bid:", {
      songUrl,
      bidAmount,
      songName,
      artistName,
    });

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSongUrl("");
      setBidAmount("");
      setSongName("");
      setArtistName("");
      // Show success message or update the upcoming bids list
    }, 1000);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Place Your Bid</CardTitle>
        <p className="text-sm text-muted-foreground">
          Current highest bid:{" "}
          <span className="font-semibold text-primary">
            {currentHighestBid} SONGCOIN
          </span>
        </p>
      </CardHeader>
      <CardContent>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="song-name" className="text-sm">
                Song Name
              </Label>
              <Input
                id="song-name"
                type="text"
                placeholder="Enter song name"
                className="bg-secondary/10"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist-name" className="text-sm">
                Artist Name
              </Label>
              <Input
                id="artist-name"
                type="text"
                placeholder="Enter artist name"
                className="bg-secondary/10"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="song-url" className="text-sm">
                Song Embed Spotify Code
              </Label>
              <div className="rounded-md border bg-secondary/10">
                <div className="mb-2 flex items-center gap-2 p-3">
                  <Music className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Paste iframe HTML code below
                  </span>
                </div>
                <Textarea
                  id="song-url"
                  placeholder="<iframe src='https://www.youtube.com/embed/...' ...></iframe>"
                  className="min-h-[100px] border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={songUrl}
                  onChange={(e) => setSongUrl(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground underline">
                <a
                  href="https://developer.spotify.com/documentation/embeds/tutorials/creating-an-embed"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  We currently only support Spotify embeds. You can get the
                  embed code by right clicking on the Spotify player and
                  selecting "Embed track".
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bid-amount" className="text-sm">
                Your Bid (SONGCOIN)
              </Label>
              <div className="flex items-center rounded-md border bg-secondary/10 px-3">
                <span className="text-muted-foreground">
                  <DiscIcon className="h-4 w-4" />
                </span>
                <Input
                  id="bid-amount"
                  type="number"
                  step="0.001"
                  min={currentHighestBid + 1}
                  placeholder={`Min: ${(currentHighestBid + 1).toFixed(3)} SONGCOIN`}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Gas fees will be calculated at submission
              </p>
            </div>

            <Button
              className="mt-2 w-full"
              variant="secondary"
              disabled={
                isSubmitting ||
                !songUrl ||
                !bidAmount ||
                !songName ||
                !artistName ||
                Number.parseFloat(bidAmount) <= currentHighestBid
              }
              onClick={handleSubmit}
            >
              {isSubmitting ? "Confirming on blockchain..." : "Place Bid"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
