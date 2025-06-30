import { createFileRoute } from "@tanstack/react-router";
import { InfoIcon } from "lucide-react";
import { createHeadConfig, ROUTE_META } from "@/lib/meta";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => createHeadConfig(ROUTE_META.about),
});

function About() {
  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      {/* Title */}
      <div className="max-w-2xl mx-auto mb-10 lg:mb-14">
        <h2 className="text-2xl font-light md:text-4xl text-foreground mb-6 text-center modak-font">
          You might be wondering...
        </h2>
      </div>
      {/* End Title */}

      <div className="max-w-2xl mx-auto divide-y divide-border">
        <div className="py-8 first:pt-0 last:pb-0">
          <div className="flex gap-x-5">
            <InfoIcon className="shrink-0 mt-1 size-6 text-muted-foreground" />

            <div className="grow">
              <h3 className="md:text-lg font-semibold text-foreground">
                How does this work?
              </h3>
              <p className="mt-1 text-muted-foreground">
                You place your bid to place your Spotify content on the spot. If
                you win at the end of the day, you get to keep it for 24 hours
                while the next bid is taking place.
              </p>
            </div>
          </div>
        </div>

        <div className="py-8 first:pt-0 last:pb-0">
          <div className="flex gap-x-5">
            <InfoIcon className="shrink-0 mt-1 size-6 text-muted-foreground" />

            <div className="grow">
              <h3 className="md:text-lg font-semibold text-foreground">
                I didn't win, can I get a refund?
              </h3>
              <p className="mt-1 text-muted-foreground">
                Yes, if your bid wasn't the winning one, you can get a refund,
                no questions asked.
              </p>
            </div>
          </div>
        </div>

        <div className="py-8 first:pt-0 last:pb-0">
          <div className="flex gap-x-5">
            <InfoIcon className="shrink-0 mt-1 size-6 text-muted-foreground" />

            <div className="grow">
              <h3 className="md:text-lg font-semibold text-foreground">
                How long is this thing going to run for?
              </h3>
              <p className="mt-1 text-muted-foreground">
                Hopefully forever but we'll see. To incentivize the activation
                of the next round there is a small tip if you start the new
                round.
              </p>
            </div>
          </div>
        </div>

        <div className="py-8 first:pt-0 last:pb-0">
          <div className="flex gap-x-5">
            <InfoIcon className="shrink-0 mt-1 size-6 text-muted-foreground" />

            <div className="grow">
              <h3 className="md:text-lg font-semibold text-foreground">
                What happens with the money collected?
              </h3>
              <p className="mt-1 text-muted-foreground">
                It's going to get burned!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
