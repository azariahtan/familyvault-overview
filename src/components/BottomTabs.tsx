import { Link } from "@tanstack/react-router";
import {
  Home,
  Building2,
  Shield,
  TrendingUp,
  Landmark,
  PiggyBank,
  Heart,
  Package,
  Settings as SettingsIcon,
} from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/property", label: "Property", icon: Building2 },
  { to: "/insurance", label: "Insurance", icon: Shield },
  { to: "/investments", label: "Invest", icon: TrendingUp },
  { to: "/loans", label: "Loans", icon: Landmark },
  { to: "/savings", label: "Savings", icon: PiggyBank },
  { to: "/health", label: "Health", icon: Heart },
  { to: "/inventory", label: "Inventory", icon: Package },
] as const;

export function BottomTabs() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <ul className="mx-auto grid max-w-3xl grid-cols-9">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                activeOptions={{ exact: t.to === "/" }}
                className="flex flex-col items-center gap-0.5 py-2 text-[10px] text-muted-foreground transition-colors data-[status=active]:text-primary"
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{t.label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            to="/settings"
            className="flex flex-col items-center gap-0.5 py-2 text-[10px] text-muted-foreground transition-colors data-[status=active]:text-primary"
          >
            <SettingsIcon className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
