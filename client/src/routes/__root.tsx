import { Web3Provider } from "@/components/web3-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ModeToggle } from "@/components/mode-toggle";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  return (
    <>
      <ThemeProvider>
        <div className="flex items-center justify-between w-full px-2 py-4">
          <div className="flex gap-2 items-center pt-1">
            <Link to="/" className="text-2xl modak-font">
              Songcoin
            </Link>
            <Link to="/" className="text-sm">
              Home
            </Link>{" "}
            <Link to="/about" className="text-sm">
              About
            </Link>
            <a href="https://docs.songcoin.xyz" className="text-sm" target="_blank" rel="noopener noreferrer">
              Buy
            </a>
          </div>
          <ModeToggle />
        </div>
        <hr />
        <Web3Provider>
          <Outlet />
        </Web3Provider>
      </ThemeProvider>
      <TanStackRouterDevtools />
    </>
  );
}
