// Pure business rules for CampusConnect (demo). Kept free of storage so they can be unit-tested.

export const SLOTS = ["10:00 AM", "11:30 AM", "1:00 PM", "3:00 PM", "4:30 PM"] as const;
/** Demo: this slot is always shown as already taken in the published availability. */
export const ALWAYS_TAKEN = "3:00 PM";
export const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;

export const FACILITY_CODES: Record<string, string> = {
  library: "LIB-2026",
  fitness: "GYM-2026",
};

export type BookingLike = { tutorId: string; date: string; time: string; status: "confirmed" | "cancelled" };

export function isSlotTaken(tutorId: string, date: string, time: string, bookings: BookingLike[]) {
  if (time === ALWAYS_TAKEN) return true;
  return bookings.some((b) => b.status === "confirmed" && b.tutorId === tutorId && b.date === date && b.time === time);
}

export function availableAlternatives(tutorId: string, date: string, bookings: BookingLike[]) {
  return SLOTS.filter((s) => !isSlotTaken(tutorId, date, s, bookings));
}

export function canCancel(startsAt: number, now: number) {
  return startsAt - now >= CANCEL_WINDOW_MS;
}

export function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

export function isValidFacilityCode(facilityId: string, code: string) {
  return FACILITY_CODES[facilityId] !== undefined && FACILITY_CODES[facilityId] === normalizeCode(code);
}

/** Simulated EnrollmentSystem: fitness center requires an unrestricted student record. */
export function checkEligibility(facilityId: string, restricted: boolean): { ok: true } | { ok: false; reason: string } {
  if (facilityId === "fitness" && restricted) {
    return { ok: false, reason: "Your demo student record has a recreation access hold, so the fitness center is not available." };
  }
  return { ok: true };
}

export function slotTimestamp(date: string, time: string) {
  const [hm = "0:00", ap] = time.split(" ");
  const parts = hm.split(":").map(Number);
  let h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  const [y = 0, mo = 1, d = 1] = date.split("-").map(Number);
  return new Date(y, mo - 1, d, h, m).getTime();
}

export function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
