import { BiddingForm } from "@/components/bidding-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/bid")({
  component: Bid,
});

function Bid() {
  return (
    <div className="container mx-auto max-w-xl px-4 py-6">
      <BiddingForm />
      <div className="flex flex-col justify-center items-center text-sm">
        <Link to="/">
          <Button variant="link">
            <ArrowLeft className="h-3 w-3" />
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
