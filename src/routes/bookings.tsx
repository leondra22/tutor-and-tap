import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Alert, AppShell, Empty } from "@/components/AppShell";
import { meta } from "@/lib/meta";
import { canCancel } from "@/lib/rules";
import { cancelBooking, fmtDate, TUTORS, useStore, type Booking } from "@/lib/store";

export const Route = createFileRoute("/bookings")({
  head: () => meta("My bookings", "View and cancel your tutoring sessions."),
  component: Bookings,
});

function Bookings() {
  const { bookings } = useStore();
  const [target, setTarget] = useState<Booking>();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string }>();
  const sorted = [...bookings].sort((a, b) => a.startsAt - b.startsAt);
  const blocked = target && !canCancel(target.startsAt, Date.now());

  async function doCancel() {
    if (!target) return;
    setBusy(true);
    try {
      await cancelBooking(target.id);
      setMsg({ tone: "success", text: "Booking cancelled. Your tutor has been notified." });
    } catch (e) {
      setMsg({ tone: "error", text: (e as Error).message });
    } finally {
      setBusy(false);
      setTarget(undefined);
    }
  }

  return (
    <AppShell title="My bookings" back="/home">
      <div className="space-y-3">
        {msg && <Alert tone={msg.tone} title={msg.tone === "success" ? "Cancelled" : "Couldn't cancel"}>{msg.text}</Alert>}
        {sorted.length === 0 && (
          <Empty title="No bookings yet">
            <Link to="/tutoring" className="btn btn-primary mt-3">Find tutoring</Link>
          </Empty>
        )}
        {sorted.map((b) => {
          const t = TUTORS.find((x) => x.id === b.tutorId)!;
          return (
            <article key={b.id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-bold">{t.subject} · {t.name}</h2>
                  <p className="text-sm">{fmtDate(b.date)} at {b.time}</p>
                  <p className="text-sm text-muted-foreground">{t.location} · Ref {b.ref}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${b.status === "confirmed" ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"}`}>
                  {b.status === "confirmed" ? "Confirmed" : "Cancelled"}
                </span>
              </div>
              {b.demoSeed && b.status === "confirmed" && <p className="mt-2 text-xs text-warning">Demo booking: starts within 24 hours.</p>}
              {b.status === "confirmed" && (
                <button type="button" className="btn btn-outline mt-3 w-full" onClick={() => { setMsg(undefined); setTarget(b); }}>Cancel booking</button>
              )}
            </article>
          );
        })}
      </div>

      {target && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-foreground/50 sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
          <div className="w-full max-w-[30rem] rounded-t-2xl bg-card p-5 sm:rounded-2xl">
            {blocked ? (
              <>
                <h2 id="dlg-title" className="font-display text-xl font-bold">Can't cancel this session</h2>
                <Alert tone="warn" title="24-hour cancellation policy">
                  Sessions can only be cancelled at least 24 hours before they start. Please contact your tutor directly or attend as planned.
                </Alert>
                <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => setTarget(undefined)} autoFocus>Back to bookings</button>
              </>
            ) : (
              <>
                <h2 id="dlg-title" className="font-display text-xl font-bold">Cancel this booking?</h2>
                <Alert tone="warn" title="This can't be undone">The time slot will be released and your tutor will be notified.</Alert>
                <div className="mt-4 grid gap-2">
                  <button type="button" className="btn btn-danger" onClick={doCancel} disabled={busy}>
                    {busy ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Cancelling…</> : "Yes, cancel booking"}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setTarget(undefined)} disabled={busy} autoFocus>Keep booking</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
