import { Web3Provider } from "@/components/web3-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { CurrentRoundProvider } from "@/context/current-round.context";
import { createHeadConfig } from "@/lib/meta";

export const Route = createRootRoute({
  component: Root,
  head: () => createHeadConfig(),
});

function Root() {
  return (
    <>
      <HeadContent />
      <ThemeProvider>
        <SidebarProvider defaultOpen={false}>
          <Web3Provider>
            <CurrentRoundProvider>
              <TooltipProvider>
                <AppSidebar />
                <main className="flex flex-col min-h-screen min-w-screen">
                  <Navbar />
                  <Outlet />
                </main>
              </TooltipProvider>
            </CurrentRoundProvider>
          </Web3Provider>
        </SidebarProvider>
      </ThemeProvider>

      <Toaster />
      <TanStackRouterDevtools />
    </>
  );
}
