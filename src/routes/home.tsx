import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight, Info, QrCode } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { meta } from "@/lib/meta";
import { fmtDate, STUDENT, TUTORS, useStore } from "@/lib/store";

export const Route = createFileRoute("/home")({
  head: () => meta("Home", "Your CampusConnect dashboard: tutoring and facility check-in."),
  component: HomePage,
});

function HomePage() {
  const { bookings } = useStore();
  const next = bookings.filter((b) => b.status === "confirmed").sort((a, b) => a.startsAt - b.startsAt)[0];
  const tutor = next && TUTORS.find((t) => t.id === next.tutorId);
  return (
    <AppShell title={`Hi, ${STUDENT.name.split(" ")[0]}`}>
      <div className="space-y-4">
        <div className="card hero-gradient">
          <p className="text-sm opacity-85">Next session</p>
          {next && tutor ? (
            <p className="mt-1 font-display text-lg font-bold">{tutor.subject} with {tutor.name} · {fmtDate(next.date)}, {next.time}</p>
          ) : (
            <p className="mt-1 font-display text-lg font-bold">No upcoming sessions</p>
          )}
        </div>
        <Action to="/tutoring" icon={BookOpen} title="Find tutoring" text="Book a session with a peer tutor" />
        <Action to="/facilities" icon={QrCode} title="Facility check-in" text="Library study room or fitness center" />
        <Action to="/about" icon={Info} title="About this demo" text="How the simulated backend works" />
      </div>
    </AppShell>
  );
}

function Action({ to, icon: Icon, title, text }: { to: "/tutoring" | "/facilities" | "/about"; icon: typeof BookOpen; title: string; text: string }) {
  return (
    <Link to={to} className="card flex min-h-[72px] items-center gap-4 hover:border-accent">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary"><Icon className="h-6 w-6" aria-hidden /></span>
      <span className="flex-1"><span className="block font-display text-lg font-bold">{title}</span><span className="text-sm text-muted-foreground">{text}</span></span>
      <ChevronRight className="text-muted-foreground" aria-hidden />
    </Link>
  );
}
