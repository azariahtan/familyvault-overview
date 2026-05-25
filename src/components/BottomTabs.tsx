import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Building2, Shield, Landmark, MoreHorizontal, TrendingUp, PiggyBank, Heart, Package, Settings, Gem } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PRIMARY_TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/property", label: "Property", icon: Building2 },
  { to: "/insurance", label: "Insurance", icon: Shield },
  { to: "/loans", label: "Loans", icon: Landmark },
];

const MORE_ITEMS = [
  { to: "/investments", label: "Investments", icon: TrendingUp },
  { to: "/savings", label: "Savings", icon: PiggyBank },
  { to: "/health", label: "Health", icon: Heart },
  { to: "/other-assets", label: "Other Assets", icon: Gem },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function BottomTabs() {
  const state = useRouterState();
  const pathname = state.location.pathname;
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = MORE_ITEMS.some((i) => i.to !== "/" && pathname.startsWith(i.to));

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-background/95 backdrop-blur safe-area-pb">
        {PRIMARY_TABS.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-1 cursor-pointer flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 transition", active && "scale-110")} />
              {label}
            </Link>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            "flex flex-1 cursor-pointer flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition",
            isMoreActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <MoreHorizontal className={cn("h-5 w-5 transition", isMoreActive && "scale-110")} />
          More
        </button>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-safe">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30" />
          <SheetHeader>
            <SheetTitle className="text-sm">More</SheetTitle>
          </SheetHeader>
          <div className="mt-3 grid grid-cols-3 gap-3 pb-6">
            {MORE_ITEMS.map(({ to, label, icon: Icon }) => {
              const active = pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 transition",
                    active ? "border-primary bg-primary/5" : "hover:border-primary/40"
                  )}
                >
                  <Icon className={cn("h-6 w-6", active ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-xs font-medium", active ? "text-primary" : "text-muted-foreground")}>{label}</span>
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
