import { ClientOnly, Link, useRouter } from "@tanstack/react-router";
import { Bell, Building2, CalendarCheck, ChevronLeft, Home } from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";

type Props = { title: string; step?: string; back?: string | (() => void); hideTabs?: boolean; children: ReactNode };

export function AppShell({ title, step, back, hideTabs, children }: Props) {
  const router = useRouter();
  const onBack = typeof back === "function" ? back : back ? () => router.navigate({ to: back }) : undefined;
  return (
    <div className="app-stage">
      <div className="app-frame">
        <header className="app-header">
          <div className="flex items-center gap-2">
            {onBack && (
              <button type="button" onClick={onBack} className="icon-btn" aria-label="Go back">
                <ChevronLeft className="h-6 w-6" aria-hidden />
              </button>
            )}
            <div className="min-w-0 flex-1">
              {step && <p className="text-xs font-semibold uppercase tracking-wider text-accent">{step}</p>}
              <h1 className="truncate font-display text-xl font-bold">{title}</h1>
            </div>
            <span className="demo-badge">Demo mode: fictional data</span>
          </div>
        </header>
        <main className="flex-1 px-4 pb-6 pt-4">
          <ClientOnly fallback={<p className="text-muted-foreground">Loading…</p>}>{children}</ClientOnly>
        </main>
        {!hideTabs && <Tabs />}
      </div>
    </div>
  );
}

function Tabs() {
  const { notifications } = useStore();
  const unread = notifications.filter((n) => !n.read).length;
  const items = [
    { to: "/home", label: "Home", icon: Home },
    { to: "/bookings", label: "Bookings", icon: CalendarCheck },
    { to: "/facilities", label: "Facilities", icon: Building2 },
    { to: "/notifications", label: "Notifications", icon: Bell },
  ] as const;
  return (
    <nav className="tabbar" aria-label="Main">
      {items.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} className="tab" activeProps={{ className: "tab tab-active", "aria-current": "page" }}>
          <span className="relative">
            <Icon className="h-6 w-6" aria-hidden />
            {to === "/notifications" && unread > 0 && (
              <ClientOnly>
                <span className="notif-dot" aria-label={`${unread} unread`}>{unread}</span>
              </ClientOnly>
            )}
          </span>
          <span className="text-[11px] font-semibold">{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function Alert({ tone, title, children }: { tone: "error" | "success" | "info" | "warn"; title: string; children?: ReactNode }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} aria-live="polite" className={`alert alert-${tone}`}>
      <p className="font-bold">{title}</p>
      {children && <div className="mt-1 text-sm">{children}</div>}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card text-center">
      <p className="font-display text-lg font-bold">{title}</p>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
