import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Workflow,
  Gauge,
  Video,
  Settings,
  Moon,
  Sun,
  Bell,
  Menu,
  ClipboardList,
  PowerOff,
  Power
} from "lucide-react";
import { KeepAwake } from '@capacitor-community/keep-awake';
import { useHeyElly, enableBackgroundListening, disableBackgroundListening } from "@/hooks/useHeyElly";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useHome } from "@/lib/home/store";
import { EllyLogo } from "@/components/elly/EllyLogo";
import { EllyProvider, useElly } from "@/components/elly/EllyContext";
import { Toaster } from "@/components/ui/sonner";

const nav = [
  { to: "/", label: "Home", icon: LayoutDashboard, exact: true },
  { to: "/automations", label: "Flows", icon: Workflow, exact: false },
  { to: "/energy", label: "Energy", icon: Gauge, exact: false },
  { to: "/camera", label: "Vision", icon: Video, exact: false },
  { to: "/settings", label: "Settings", icon: Settings, exact: false },
] as const;

import { autoConnectBluetooth } from "@/lib/home/bluetooth";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <EllyProvider>
      <LayoutInner>{children}</LayoutInner>
    </EllyProvider>
  );
}

function LayoutInner({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const { alerts, state } = useHome();
  const { openElly, open: isEllyOpen } = useElly();
  const { isListening } = useHeyElly({ onWakeWord: openElly, pause: isEllyOpen });
  const [bgEnabled, setBgEnabled] = useState(false);

  useEffect(() => {
    // Keep screen on permanently for 24/7 kiosk mode
    const keepAwake = async () => {
      try {
        await KeepAwake.keepAwake();
      } catch (e) {
        // Ignore if unsupported (e.g. on web)
      }
    };
    keepAwake();
    
    // Auto connect bluetooth if saved
    autoConnectBluetooth();
  }, []);

  const path = useRouterState({ select: (s) => s.location.pathname });
  // Always start new pages from the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  return (
    <div className="relative flex h-[100dvh] w-full justify-center overflow-hidden bg-secondary/50">
      {/* Ambient static blobs (subtle, no blur filter to avoid per-frame repaint cost) */}
      <div aria-hidden className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-primary/[0.08] dark:bg-primary/[0.12]" />
      <div aria-hidden className="pointer-events-none absolute top-20 right-10 h-40 w-40 rounded-full bg-chart-2/[0.08] dark:bg-chart-2/[0.12]" />
      <div aria-hidden className="pointer-events-none absolute top-1/3 left-10 h-24 w-24 rounded-full bg-chart-3/[0.08] dark:bg-chart-3/[0.12]" />
      <div aria-hidden className="pointer-events-none absolute top-1/2 right-24 h-48 w-48 rounded-full bg-primary/[0.06] dark:bg-primary/[0.10]" />
      <div aria-hidden className="pointer-events-none absolute bottom-1/3 left-20 h-36 w-36 rounded-full bg-chart-4/[0.08] dark:bg-chart-4/[0.12]" />
      <div aria-hidden className="pointer-events-none absolute bottom-20 right-12 h-28 w-28 rounded-full bg-chart-5/[0.08] dark:bg-chart-5/[0.12]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-10 left-1/3 h-40 w-40 rounded-full bg-chart-2/[0.08] dark:bg-chart-2/[0.12]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-primary/[0.08] dark:bg-primary/[0.12]" />
      <div aria-hidden className="pointer-events-none absolute top-1/4 -right-16 h-56 w-56 rounded-full bg-chart-1/[0.05] dark:bg-chart-1/[0.08]" />
      <div aria-hidden className="pointer-events-none absolute top-3/4 -left-16 h-48 w-48 rounded-full bg-chart-3/[0.05] dark:bg-chart-3/[0.08]" />

      {/* Phone-sized app column */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col overflow-hidden bg-background shadow-lg shadow-primary/5 ring-1 ring-border/60">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-border/60 glass">
          <div className="flex items-center gap-3 px-4 py-3">
            <EllyLogo className="h-9 w-9" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-extrabold leading-none">
                ElectraWireless
              </p>
              <p className="truncate text-[11px] text-muted-foreground">ELLY Home Automation</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative h-9 w-9 rounded-full"
                  aria-label="Alerts"
                >
                  <Bell className="h-4 w-4" />
                  {alerts.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                      {alerts.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Alerts & Warnings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {alerts.length === 0 ? (
                  <DropdownMenuItem disabled>All systems nominal</DropdownMenuItem>
                ) : (
                  alerts.map((a) => (
                    <DropdownMenuItem key={a} className="text-sm">
                      <Badge variant="destructive" className="mr-2">
                        !
                      </Badge>
                      {a}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={toggle}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant={bgEnabled ? "default" : "outline"}
              size="icon"
              className={`h-9 w-9 rounded-full ${bgEnabled ? 'bg-purple-600 hover:bg-purple-700 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : ''}`}
              onClick={() => {
                if (bgEnabled) {
                  disableBackgroundListening();
                  setBgEnabled(false);
                } else {
                  enableBackgroundListening();
                  setBgEnabled(true);
                }
              }}
              aria-label="Toggle Background Service"
            >
              {bgEnabled ? <Power className="h-4 w-4 text-slate-900 dark:text-white" /> : <PowerOff className="h-4 w-4" />}
            </Button>
          </div>
          <div className="px-4 pb-3">
            <button
              type="button"
              onClick={openElly}
              aria-label="Talk to ELLY"
              className="flex w-full items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-3 py-2.5 text-left transition-colors hover:bg-primary/10"
            >
              <EllyLogo className="h-9 w-9 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-none">Talk to ELLY</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  Tap to speak or type a command
                </p>
              </div>
            </button>
          </div>
        </header>

        {/* Page content (no re-mount animation, keeps navigation instant) */}
        <main className="flex flex-1 flex-col overflow-y-auto no-scrollbar px-4 pb-4 pt-5">{children}</main>

        {/* Bottom Navigation Bar */}
        <nav className="mt-auto shrink-0 z-50 flex items-center justify-around border-t border-border/60 bg-background/80 px-2 py-2 backdrop-blur-md">
          {nav.map((item) => {
            const active = item.exact ? path === item.to : path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                preload="render"
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                    active ? "bg-primary/15" : "bg-transparent",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                </div>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* In-app notifications, constrained to the phone column */}
        <Toaster
          position="top-center"
          offset={16}
          mobileOffset={16}
          expand={true}
          richColors={true}
          style={{ position: "absolute" }}
        />
      </div>
    </div>
  );
}
