import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function HashHighlight({ id, children }: { id: string; children: ReactNode }) {
  const [hl, setHl] = useState(false);
  useEffect(() => {
    const check = () => {
      if (typeof window === "undefined") return;
      if (window.location.hash === `#${id}`) {
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
        setHl(true);
        const t = setTimeout(() => setHl(false), 2000);
        return () => clearTimeout(t);
      }
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [id]);
  return (
    <div
      id={id}
      className={cn(
        "rounded-2xl transition-all duration-500",
        hl && "ring-4 ring-yellow-400 ring-offset-2 ring-offset-background",
      )}
    >
      {children}
    </div>
  );
}
