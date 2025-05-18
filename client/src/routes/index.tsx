import { CurrentSong } from "@/components/current-song";
import { BiddingForm } from "@/components/bidding-form";
import { createFileRoute } from "@tanstack/react-router";
import { CurrentBids } from "@/components/current-bids";
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main>
      <div className="container mx-auto max-w-lg px-4 py-6">
        <h1 className="mb-6 text-center text-5xl font-thin modak-font">Songcoin</h1>
        <div className="flex flex-col gap-6">
          <CurrentSong />
          <BiddingForm />
          <CurrentBids />
        </div>
      </div>
    </main>
  );
}
