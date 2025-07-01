import { BiddingForm } from "@/components/bidding-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createHeadConfig, ROUTE_META } from "@/lib/meta";

export const Route = createFileRoute("/bid")({
  component: Bid,
  head: () => createHeadConfig(ROUTE_META.bid),
});

function Bid() {
  return (
    <div className="container mx-auto max-w-xl px-4 py-6 grid gap-4">
      <div className="flex flex-col justify-start items-start text-sm">
        <Link to="/">
          <Button variant="link">
            <ArrowLeft className="h-3 w-3" />
            Back to home
          </Button>
        </Link>
      </div>

      <BiddingForm />
    </div>
  );
}
