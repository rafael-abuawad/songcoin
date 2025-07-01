import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ClipboardIcon, CheckIcon } from "lucide-react";

interface EmbededDialogProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  FormMessage?: React.ReactNode;
}

export function EmbededDialog({
  value,
  onChange,
  FormMessage,
}: EmbededDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Handler for pasting from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange({
        target: { value: text },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    } catch (e) {
      toast.error("Could not paste from clipboard");
    }
  };

  if (isDesktop) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start px-2.5"
          >
            Enter Spotify Embed Code
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Paste Spotify Embed Code</DialogTitle>
            <DialogDescription>
              We currently only support Spotify embeds. You can get the embed
              code by right clicking on the Spotify player and selecting "Embed
              track".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Textarea
              placeholder="<iframe src='https://open.spotify.com/embed/track/...' ...></iframe>"
              className="min-h-48 max-h-64 border"
              value={value}
              onChange={onChange}
            />
            <div className="flex flex-row gap-2 justify-end">
              <Button
                type="button"
                variant="default"
                className="flex-grow"
                onClick={() => setDialogOpen(false)}
              >
                <span>Add embeded code</span>
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Paste from clipboard"
                onClick={handlePasteFromClipboard}
              >
                <ClipboardIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {FormMessage}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={dialogOpen} onOpenChange={setDialogOpen}>
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start px-2.5"
        >
          Enter Spotify Embed Code
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Paste Spotify Embed Code</DrawerTitle>
          <DrawerDescription>
            We currently only support Spotify embeds. You can get the embed code
            by right clicking on the Spotify player and selecting "Embed track".
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <Textarea
            placeholder="<iframe src='https://open.spotify.com/embed/track/...' ...></iframe>"
            className="min-h-48 max-h-64 border"
            value={value}
            onChange={onChange}
          />
          <div className="flex flex-row gap-2 justify-end mt-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Paste from clipboard"
              onClick={handlePasteFromClipboard}
            >
              <ClipboardIcon className="h-5 w-5" />
            </Button>
            <DrawerClose asChild>
              <Button
                type="button"
                size="icon"
                variant="default"
                aria-label="OK"
              >
                <CheckIcon className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </div>
        {FormMessage}
      </DrawerContent>
    </Drawer>
  );
}
