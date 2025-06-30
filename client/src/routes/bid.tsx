import { BiddingForm } from "@/components/bidding-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import { createHeadConfig, ROUTE_META } from "@/lib/meta";

export const Route = createFileRoute("/bid")({
  component: Bid,
  head: () => createHeadConfig(ROUTE_META.bid),
});

function Bid() {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleBidSuccess = () => {
    setShowSuccessAlert(true);
  };

  return (
    <div className="container mx-auto max-w-xl px-4 py-6">
      <BiddingForm onBidSuccess={handleBidSuccess} />

      {showSuccessAlert && (
        <Alert className="mt-4 bg-green-600/10 border-none">
          <CheckCircle className="h-4 w-4 stroke-green-600" />
          <AlertTitle className="text-green-600">Bid Successful!</AlertTitle>
          <AlertDescription className="text-green-600">
            Your bid has been placed successfully. You are now the highest
            bidder!
          </AlertDescription>
        </Alert>
      )}

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
