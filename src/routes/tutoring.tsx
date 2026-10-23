import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Alert, AppShell } from "@/components/AppShell";
import { meta } from "@/lib/meta";
import { SLOTS, ALWAYS_TAKEN, isSlotTaken, toDateKey } from "@/lib/rules";
import { AvailabilityService, createTutoringSession, fmtDate, TUTORS, useStore, type Booking } from "@/lib/store";

export const Route = createFileRoute("/tutoring")({
  head: () => meta("Book tutoring", "Choose a tutor, pick an available time and confirm your tutoring session."),
  component: Tutoring,
});

type Step = 1 | 2 | 3 | 4;

function Tutoring() {
  const navigate = useNavigate();
  const { bookings } = useStore();
  const [step, setStep] = useState<Step>(1);
  const [tutorId, setTutorId] = useState<string>();
  const [days] = useState(() => Array.from({ length: 5 }, (_, i) => toDateKey(new Date(Date.now() + (i + 2) * 86400000))));
  const [date, setDate] = useState<string>();
  const [time, setTime] = useState<string>();
  const [error, setError] = useState<{ msg: string; alts: string[] }>();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Booking>();
  const tutor = TUTORS.find((t) => t.id === tutorId);

  const back = () => (step === 1 || step === 4 ? navigate({ to: "/home" }) : setStep((s) => (s - 1) as Step));
  const titles = { 1: "Choose a tutor", 2: "Choose date & time", 3: "Review appointment", 4: "Booking confirmed" };

  function pickTime(t: string) {
    setTime(t);
    if (!tutorId || !date) return;
    const r = AvailabilityService.check(tutorId, date, t); // check published availability
    setError(r.ok ? undefined : { msg: `${t} is already taken for ${fmtDate(date)}.`, alts: r.alternatives });
  }

  async function confirm() {
    if (!tutorId || !date || !time) return;
    setBusy(true);
    setError(undefined);
    try {
      setDone(await createTutoringSession(tutorId, date, time));
      setStep(4);
    } catch (e) {
      setError({ msg: (e as Error).message, alts: [] });
      setStep(2);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title={titles[step]} step={step < 4 ? `Step ${step} of 3` : "Done"} back={back}>
      {step === 1 && (
        <ul className="space-y-3">
          {TUTORS.map((t) => (
            <li key={t.id}>
              <button type="button" className="card flex w-full items-center gap-4 text-left hover:border-accent"
                onClick={() => { setTutorId(t.id); setDate(undefined); setTime(undefined); setError(undefined); setStep(2); }}>
                <span className="grid h-12 w-12 place-items-center rounded-full bg-primary font-bold text-primary-foreground" aria-hidden>
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </span>
                <span>
                  <span className="block font-display text-lg font-bold">{t.name}</span>
                  <span className="block text-sm font-semibold text-accent">{t.subject}</span>
                  <span className="block text-sm text-muted-foreground">{t.course}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {step === 2 && tutor && (
        <div className="space-y-5">
          <p className="text-muted-foreground">Tutor: <strong className="text-foreground">{tutor.name}</strong> · {tutor.subject}</p>
          <fieldset>
            <legend className="mb-2 font-bold">Date</legend>
            <div className="grid grid-cols-3 gap-2">
              {days.map((d) => (
                <button key={d} type="button" className="choice" aria-pressed={date === d}
                  onClick={() => { setDate(d); setTime(undefined); setError(undefined); }}>{fmtDate(d)}</button>
              ))}
            </div>
          </fieldset>
          {date && (
            <fieldset>
              <legend className="mb-2 font-bold">Time</legend>
              <div className="grid grid-cols-2 gap-2">
                {SLOTS.map((s) => {
                  const taken = isSlotTaken(tutor.id, date, s, bookings);
                  return (
                    <button key={s} type="button" aria-pressed={time === s}
                      className={`choice ${taken ? "choice-taken" : ""}`} onClick={() => pickTime(s)}>
                      {s}{taken ? " (Taken)" : ""}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Tip: try {ALWAYS_TAKEN} (Taken) to see the error state.</p>
            </fieldset>
          )}
          {error && (
            <Alert tone="error" title="Time unavailable">
              <p>{error.msg}</p>
              {error.alts.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="w-full">Available instead:</span>
                  {error.alts.map((a) => <button key={a} type="button" className="choice" onClick={() => pickTime(a)}>{a}</button>)}
                </div>
              )}
            </Alert>
          )}
          <button type="button" className="btn btn-primary w-full" disabled={!date || !time || !!error} onClick={() => setStep(3)}>
            Continue to review
          </button>
        </div>
      )}

      {step === 3 && tutor && date && time && (
        <div className="space-y-4">
          <dl className="card divide-y">
            {[["Tutor", tutor.name], ["Course", tutor.course], ["Location", tutor.location], ["Date", fmtDate(date)], ["Time", time]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
            ))}
          </dl>
          <button type="button" className="btn btn-primary w-full" onClick={confirm} disabled={busy} aria-busy={busy}>
            {busy ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Confirming…</> : "Confirm booking"}
          </button>
          <button type="button" className="btn btn-outline w-full" onClick={() => setStep(2)} disabled={busy}>Change time</button>
        </div>
      )}

      {step === 4 && done && tutor && (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-success" aria-hidden />
          <Alert tone="success" title="Your session is booked">
            {tutor.subject} with {tutor.name} · {fmtDate(done.date)} at {done.time}<br />{tutor.location}<br />Reference <strong>{done.ref}</strong>
          </Alert>
          <p className="text-sm text-muted-foreground">You and your tutor were notified in the app.</p>
          <Link to="/bookings" className="btn btn-primary w-full">View my bookings</Link>
          <Link to="/notifications" className="btn btn-outline w-full">See notifications</Link>
        </div>
      )}
    </AppShell>
  );
}
