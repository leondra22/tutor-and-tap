import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Empty } from "@/components/AppShell";
import { meta } from "@/lib/meta";
import { fmtStamp, markAllRead, useStore } from "@/lib/store";

export const Route = createFileRoute("/notifications")({
  head: () => meta("Notifications", "In-app notifications for bookings, cancellations and check-ins."),
  component: Notifications,
});

function Notifications() {
  const { notifications } = useStore();
  return (
    <AppShell title="Notifications" back="/home">
      {notifications.length === 0 ? (
        <Empty title="You're all caught up">New booking and check-in updates will appear here.</Empty>
      ) : (
        <div className="space-y-3">
          <button type="button" className="btn btn-outline w-full" onClick={markAllRead}>Mark all as read</button>
          <ul className="space-y-2" aria-live="polite">
            {notifications.map((n) => (
              <li key={n.id} className={`card ${n.read ? "" : "border-l-4 border-l-accent"}`}>
                <div className="flex justify-between gap-2">
                  <p className="font-bold">{n.title}</p>
                  <span className="rounded-full bg-secondary px-2 text-xs font-bold leading-6 text-primary">{n.audience}</span>
                </div>
                <p className="text-sm">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{fmtStamp(n.at)}{n.read ? "" : " · New"}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppShell>
  );
}
