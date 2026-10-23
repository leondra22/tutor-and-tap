import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/")({
  head: () => meta("Welcome", "CampusConnect demo app — continue as a fictional demo student, no signup."),
  component: Welcome,
});

function Welcome() {
  return (
    <div className="app-stage">
      <div className="app-frame hero-gradient justify-between p-6">
        <span className="demo-badge self-end">Demo mode: fictional data</span>
        <div>
          <GraduationCap className="mb-4 h-16 w-16 text-accent" aria-hidden />
          <h1 className="font-display text-5xl font-extrabold leading-tight">CampusConnect</h1>
          <p className="mt-3 text-lg opacity-90">Book tutoring and check in to campus facilities — all in one place.</p>
        </div>
        <div className="space-y-3">
          <Link to="/home" className="btn btn-accent w-full text-lg">Continue as Demo Student</Link>
          <p className="text-center text-sm opacity-80">Signed in as Alex Morgan (fictional). No account needed.</p>
          <Link to="/about" className="btn w-full underline">About this demo</Link>
        </div>
      </div>
    </div>
  );
}
