import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Dumbbell, Library } from "lucide-react";
import { AppShell, Empty } from "@/components/AppShell";
import { meta } from "@/lib/meta";
import { FACILITIES, fmtStamp, useStore } from "@/lib/store";

export const Route = createFileRoute("/facilities/")({
  head: () => meta("Facilities", "Check in to the library study room or fitness center."),
  component: Facilities,
});

function Facilities() {
  const { checkins } = useStore();
  return (
    <AppShell title="Facilities" step="Step 1 of 3 · Choose facility" back="/home">
      <div className="space-y-3">
        {FACILITIES.map((f) => {
          const Icon = f.id === "library" ? Library : Dumbbell;
          return (
            <Link key={f.id} to="/facilities/$id" params={{ id: f.id }} className="card flex items-center gap-4 hover:border-accent">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary"><Icon aria-hidden /></span>
              <span className="flex-1"><span className="block font-display text-lg font-bold">{f.name}</span><span className="text-sm text-muted-foreground">{f.place}</span></span>
              <ChevronRight className="text-muted-foreground" aria-hidden />
            </Link>
          );
        })}
        <h2 className="pt-4 font-display text-lg font-bold">Check-in history</h2>
        {checkins.length === 0 ? (
          <Empty title="No check-ins yet">Choose a facility above to check in.</Empty>
        ) : (
          <ul className="space-y-2">
            {checkins.map((c) => (
              <li key={c.id} className="card py-3">
                <p className="font-semibold">{FACILITIES.find((f) => f.id === c.facilityId)?.name}</p>
                <p className="text-sm text-muted-foreground">{fmtStamp(c.at)} · Ref {c.ref}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
