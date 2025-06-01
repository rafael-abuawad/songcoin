import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ConnectKitButton } from "connectkit";
import { Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-center w-full h-12">
          <Link to="/" className="text-3xl modak-font">
            Songcoin
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Button variant="ghost" className="w-full">
              <Link to="/">Home</Link>
            </Button>
            <Button variant="ghost" className="w-full">
              <a href="https://docs.songcoin.xyz" target="_blank">
                Buy
              </a>
            </Button>
            <Button variant="ghost" className="w-full">
              <Link to="/about">About</Link>
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ConnectKitButton.Custom>
          {({ show, truncatedAddress, isConnected }) => {
            if (isConnected) {
              return (
                <Button className="w-full mt-4" onClick={show}>
                  <Sparkles className="h-4 w-4" />
                  {truncatedAddress}
                </Button>
              );
            }
            return (
              <Button className="w-full mt-4" onClick={show}>
                <Sparkles className="h-4 w-4" />
                Connect your wallet
              </Button>
            );
          }}
        </ConnectKitButton.Custom>
      </SidebarFooter>
    </Sidebar>
  );
}
