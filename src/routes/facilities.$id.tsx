import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, Loader2, QrCode, ShieldX } from "lucide-react";
import { useState } from "react";
import { Alert, AppShell } from "@/components/AppShell";
import { meta } from "@/lib/meta";
import { FACILITY_CODES } from "@/lib/rules";
import { FACILITIES, facilityCheckIn, fmtStamp, setRestricted, useStore, type CheckInResult } from "@/lib/store";

export const Route = createFileRoute("/facilities/$id")({
  loader: ({ params }) => {
    const f = FACILITIES.find((x) => x.id === params.id);
    if (!f) throw notFound();
    return { facility: f };
  },
  head: ({ loaderData }) => meta(loaderData ? `Check in: ${loaderData.facility.name}` : "Facility", "Enter or scan a facility code to check in."),
  component: CheckIn,
});

function CheckIn() {
  const { facility } = Route.useLoaderData();
  const { restricted } = useStore();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<CheckInResult>();

  async function submit(value = code) {
    setBusy(true);
    setResult(undefined);
    setResult(await facilityCheckIn(facility.id, value));
    setBusy(false);
  }
  function simulateScan() {
    setScanning(true);
    setTimeout(() => { const c = FACILITY_CODES[facility.id]; setCode(c); setScanning(false); void submit(c); }, 1300);
  }

  if (result?.ok) {
    return (
      <AppShell title="Checked in" step="Step 3 of 3 · Confirmation" back="/facilities">
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-success" aria-hidden />
          <Alert tone="success" title={`Welcome to ${facility.name}`}>
            {fmtStamp(result.checkin.at)}<br />Confirmation reference <strong>{result.checkin.ref}</strong>
          </Alert>
          <Link to="/facilities" className="btn btn-primary w-full">View check-in history</Link>
          <Link to="/home" className="btn btn-outline w-full">Back to home</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={facility.name} step="Step 2 of 3 · Enter or scan code" back="/facilities">
      <div className="space-y-4">
        <p className="text-muted-foreground">{facility.place} · {facility.hint}. Demo code: <strong className="text-foreground">{FACILITY_CODES[facility.id]}</strong></p>

        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
          <label htmlFor="code" className="block font-bold">Facility code</label>
          <input id="code" className="field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. LIB-2026"
            autoComplete="off" aria-invalid={result?.ok === false && result.kind === "invalid_code"} aria-describedby="code-err" />
          <button type="submit" className="btn btn-primary w-full" disabled={busy || scanning}>
            {busy ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Validating & checking eligibility…</> : "Check in"}
          </button>
        </form>

        <div className="flex items-center gap-3 text-sm text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
        {scanning ? (
          <div className="scan-box" role="status" aria-live="polite"><span className="scan-line" /><span className="font-semibold text-primary">Scanning QR (simulated)…</span></div>
        ) : (
          <button type="button" className="btn btn-outline w-full" onClick={simulateScan} disabled={busy}><QrCode aria-hidden /> Simulate QR scan</button>
        )}

        <div id="code-err">
          {result && !result.ok && result.kind === "invalid_code" && (
            <Alert tone="error" title="Code not recognized">{result.message} No check-in was recorded.</Alert>
          )}
          {result && !result.ok && result.kind === "denied" && (
            <div className="alert alert-error" role="alert">
              <p className="flex items-center gap-2 font-bold"><ShieldX aria-hidden /> Access denied</p>
              <p className="mt-1 text-sm">{result.message}</p>
              <p className="mt-2 text-sm font-semibold">Next steps:</p>
              <ol className="ml-5 list-decimal text-sm">
                <li>Contact the (fictional) Student Services desk to resolve the hold.</li>
                <li>Try the Library Study Room, which has no hold.</li>
                <li>Or turn off the restricted demo toggle below to retry.</li>
              </ol>
            </div>
          )}
        </div>

        {facility.id === "fitness" && (
          <label className="card flex min-h-[56px] cursor-pointer items-center justify-between gap-3">
            <span><span className="block font-semibold">Simulate restricted demo student</span><span className="text-sm text-muted-foreground">Fakes a recreation access hold in the simulated enrollment system</span></span>
            <input type="checkbox" className="h-6 w-6 accent-primary" checked={restricted} onChange={(e) => { setRestricted(e.target.checked); setResult(undefined); }} />
          </label>
        )}
      </div>
    </AppShell>
  );
}
