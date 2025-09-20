"use client";

import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Monitor,
  Tablet,
  Smartphone,
  Split,
  Code,
  Eye,
} from "lucide-react";
import { Logo } from "@/components/app/icons";
import { exportCodeAsZip } from "@/lib/export";
import { cn } from "@/lib/utils";
import type { Code as AppCode, ViewMode, Device } from "@/app/page";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppHeaderProps {
  code: AppCode;
  view: ViewMode;
  setView: Dispatch<SetStateAction<ViewMode>>;
  device: Device;
  setDevice: Dispatch<SetStateAction<Device>>;
}

export function AppHeader({
  code,
  view,
  setView,
  device,
  setDevice,
}: AppHeaderProps) {
  const handleExport = () => {
    exportCodeAsZip(code);
  };

  return (
    <header className="flex items-center justify-between p-2 border-b shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">
            AI Web Artisan
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <div className={cn("flex items-center bg-muted p-1 rounded-md")}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={view === "split" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setView("split")}
                  className="px-2"
                >
                  <Split className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Split View</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={view === "code" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setView("code")}
                  className="px-2"
                >
                  <Code className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Code View</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={view === "preview" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setView("preview")}
                  className="px-2"
                >
                  <Eye className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Preview</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center bg-muted p-1 rounded-md",
            view === "code" && "hidden md:flex"
          )}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={device === "desktop" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setDevice("desktop")}
                  className="px-2"
                >
                  <Monitor className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Desktop</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={device === "tablet" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setDevice("tablet")}
                  className="px-2"
                >
                  <Tablet className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tablet</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={device === "mobile" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setDevice("mobile")}
                  className="px-2"
                >
                  <Smartphone className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mobile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          size="sm"
          onClick={handleExport}
          className="hidden md:inline-flex"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </header>
  );
}
