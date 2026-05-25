import { Outlet, ScrollRestoration, createRootRouteWithContext, Link, useRouterState } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { BottomTabs } from "@/components/BottomTabs";
import { AppHeader } from "@/components/AppHeader";
import { cn } from "@/lib/utils";
import { Home, Building2, Shield, Landmark, TrendingUp, PiggyBank, Heart, Package, Settings, Gem } from "lucide-react";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FamilyVault" },
    ],
  }),
});

// All nav items for desktop sidebar
const ALL_NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/property", label: "Property", icon: Building2 },
  { to: "/insurance", label: "Insurance", icon: Shield },
  { to: "/loans", label: "Loans", icon: Landmark },
  { to: "/investments", label: "Investments", icon: TrendingUp },
  { to: "/savings", label: "Savings", icon: PiggyBank },
  { to: "/health", label: "Health", icon: Heart },
  { to: "/other-assets", label: "Other Assets", icon: Gem },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/settings", label: "Settings", icon: Settings },
];

function DesktopSidebar() {
  const state = useRouterState();
  const pathname = state.location.pathname;
  return (
    <aside className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-border md:bg-card">
      <div className="flex h-14 items-center border-b border-border px-4">
        <span className="text-sm font-bold">FamilyVault</span>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {ALL_NAV.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function RootLayout() {
  return (
    <div className="flex h-dvh flex-col bg-background md:flex-row">
      {/* Desktop sidebar — hidden on mobile */}
      <DesktopSidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header — mobile only (desktop has sidebar title) */}
        <div className="md:hidden">
          <AppHeader />
        </div>
        {/* Desktop header strip */}
        <div className="hidden h-14 items-center border-b border-border bg-background px-6 md:flex">
          <AppHeader desktopMode />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-6">
          <div className="mx-auto max-w-2xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom tabs — mobile only */}
      <div className="md:hidden">
        <BottomTabs />
      </div>

      <ScrollRestoration />
      <Toaster richColors position="top-center" />
    </div>
  );
}
