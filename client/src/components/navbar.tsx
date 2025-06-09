import { Link } from "@tanstack/react-router";
import { ModeToggle } from "@/components/mode-toggle";
import { SidebarTrigger } from "./ui/sidebar";
import { MenuIcon, Sparkles } from "lucide-react";
import { ConnectKitButton } from "connectkit";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <div className="flex items-center justify-between w-full px-2 py-4 border-b sticky top-0 bg-background z-9">
      <div className="flex gap-2 items-center">
        <SidebarTrigger>
          <MenuIcon className="h-4 w-4" />
        </SidebarTrigger>
        <div className="pt-1">
          <Link to="/" className="text-2xl modak-font">
            Songcoin
          </Link>
        </div>
      </div>

      <div className="flex gap-2 items-center justify-center">
        <div>
          <ConnectKitButton.Custom>
            {({ show, truncatedAddress, isConnected }) => {
              if (isConnected) {
                return (
                  <Button className="w-full" onClick={show}>
                    <Sparkles className="h-4 w-4" />
                    {truncatedAddress}
                  </Button>
                );
              }
              return (
                <Button className="w-full" onClick={show}>
                  <Sparkles className="h-4 w-4" />
                  Connect your wallet
                </Button>
              );
            }}
          </ConnectKitButton.Custom>
        </div>
        <ModeToggle />
      </div>
    </div>
  );
}
