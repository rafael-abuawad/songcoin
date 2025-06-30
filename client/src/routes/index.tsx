import { CurrentSong } from "@/components/current-song";
import { createFileRoute } from "@tanstack/react-router";
import { LatestBids } from "@/components/latests-bids";
import { CurrentBid } from "@/components/current-bid";
import { createHeadConfig, ROUTE_META } from "@/lib/meta";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => createHeadConfig(ROUTE_META.home),
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
        <LatestBids />
      </div>
    </div>
  );
}
