import { CurrentSong } from "@/components/current-song";
import { createFileRoute } from "@tanstack/react-router";
import { CurrentBids } from "@/components/current-bids";
import { CurrentBid } from "@/components/current-bid";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="container mx-auto max-w-xl px-4 py-6">
      <h1 className="mb-6 text-center text-5xl font-thin modak-font">
        Songcoin
      </h1>
      <div className="flex flex-col gap-6">
        <CurrentSong />
        <CurrentBid />
        <CurrentBids />
      </div>
    </div>
  );
}
