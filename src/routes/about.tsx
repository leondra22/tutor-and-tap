import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { meta } from "@/lib/meta";
import { resetDemo, STUDENT } from "@/lib/store";

export const Route = createFileRoute("/about")({
  head: () => meta("About this demo", "How CampusConnect's simulated backend and sequence flows work."),
  component: About,
});

const trace = {
  "Tutoring booking": [
    "Student chooses tutor, date and time",
    "App checks published availability (simulated AvailabilityService)",
    "Student selects and confirms",
    "Create TutoringSession (saved in this browser)",
    "Create Notification for student and tutor",
    "Show confirmation",
  ],
  "Facility check-in": [
    "Student enters code or simulates QR scan",
    "Validate Facility and access code",
    "Verify eligibility via simulated EnrollmentSystem",
    "Save FacilityCheckIn (saved in this browser)",
    "Show confirmation with reference",
  ],
};

function About() {
  return (
    <AppShell title="About this demo" back="/home">
      <div className="space-y-4">
        <div className="alert alert-info">
          <p className="font-bold">Everything here is simulated</p>
          <p className="mt-1 text-sm">
            All people, courses, facilities and codes are fictional. "{STUDENT.name}" is a demo student. There is no real
            university system, enrollment lookup, QR scanner or messaging. Demo logic runs in your browser and data is stored in
            your browser's local storage.
          </p>
        </div>
        {Object.entries(trace).map(([name, steps]) => (
          <section key={name} className="card">
            <h2 className="font-display text-lg font-bold">{name} — sequence trace</h2>
            <ol className="mt-2 space-y-2">
              {steps.map((s, i) => (
                <li key={s} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span><span>{s}</span></li>
              ))}
            </ol>
          </section>
        ))}
        <section className="card text-sm">
          <h2 className="font-display text-lg font-bold">Demo rules</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>3:00 PM is always shown as taken to demonstrate the unavailable-time error.</li>
            <li>A slot already booked can't be booked twice.</li>
            <li>Cancellations within 24 hours of the session are blocked (a seeded demo booking shows this).</li>
            <li>Codes: LIB-2026 (library), GYM-2026 (fitness). Wrong codes create no record.</li>
            <li>The "restricted demo student" toggle on the fitness center simulates an access hold.</li>
          </ul>
        </section>
        <button type="button" className="btn btn-outline w-full" onClick={() => { if (confirm("Reset all demo data?")) resetDemo(); }}>Reset demo data</button>
      </div>
    </AppShell>
  );
}
