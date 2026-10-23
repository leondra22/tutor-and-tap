import { useSyncExternalStore } from "react";
import {
  availableAlternatives,
  canCancel,
  checkEligibility,
  isSlotTaken,
  isValidFacilityCode,
  slotTimestamp,
  toDateKey,
} from "./rules";

export const STUDENT = { name: "Alex Morgan", id: "DEMO-000123", program: "BSc Software Engineering (fictional)" };

export const TUTORS = [
  { id: "jordan", name: "Jordan Lee", subject: "Python", course: "CS 101 · Intro to Programming", location: "Hartwell Library, Room 2A" },
  { id: "maya", name: "Maya Patel", subject: "Statistics", course: "STAT 210 · Applied Statistics", location: "Learning Commons, Table 4" },
  { id: "taylor", name: "Taylor Brooks", subject: "Software Design", course: "SE 330 · Software Design", location: "Engineering Hall 114" },
] as const;

export const FACILITIES = [
  { id: "library", name: "Library Study Room 3B", place: "Hartwell Library, Level 3", hint: "Code on the door panel" },
  { id: "fitness", name: "Northside Fitness Center", place: "Recreation Complex", hint: "Code at the front desk" },
] as const;

export type Booking = {
  id: string; ref: string; tutorId: string; date: string; time: string; startsAt: number;
  status: "confirmed" | "cancelled"; createdAt: number; demoSeed?: boolean;
};
export type Notif = { id: string; title: string; body: string; at: number; audience: "Student" | "Tutor"; read: boolean };
export type CheckIn = { id: string; ref: string; facilityId: string; at: number };
type State = { bookings: Booking[]; notifications: Notif[]; checkins: CheckIn[]; restricted: boolean };

const KEY = "campusconnect:v1";
const EMPTY: State = { bookings: [], notifications: [], checkins: [], restricted: false };
let state: State | null = null;
const listeners = new Set<() => void>();

const uid = () => Math.random().toString(36).slice(2, 10);
const ref = (p: string) => `${p}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function seed(): State {
  const soon = new Date(Date.now() + 6 * 3600 * 1000);
  soon.setMinutes(0, 0, 0);
  const h = soon.getHours();
  const time = `${((h + 11) % 12) + 1}:00 ${h >= 12 ? "PM" : "AM"}`;
  return {
    ...EMPTY,
    bookings: [{
      id: uid(), ref: ref("TS"), tutorId: "maya", date: toDateKey(soon), time, startsAt: soon.getTime(),
      status: "confirmed", createdAt: Date.now(), demoSeed: true,
    }],
    notifications: [{ id: uid(), title: "Welcome to CampusConnect", body: "You're exploring demo mode with fictional data.", at: Date.now(), audience: "Student", read: false }],
  };
}

function load(): State {
  if (state) return state;
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? (JSON.parse(raw) as State) : seed();
  } catch {
    state = seed();
  }
  persist();
  return state;
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable: keep in memory */ }
}
function set(fn: (s: State) => State) {
  state = fn(load());
  persist();
  listeners.forEach((l) => l());
}
export function useStore() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, load, () => EMPTY);
}

function notify(s: State, items: Omit<Notif, "id" | "at" | "read">[]): Notif[] {
  return [...items.map((n) => ({ ...n, id: uid(), at: Date.now(), read: false })), ...s.notifications];
}

/* ===== Simulated backend services (DEMO ONLY — no real systems are contacted) ===== */

export const AvailabilityService = {
  check(tutorId: string, date: string, time: string) {
    const b = load().bookings;
    if (isSlotTaken(tutorId, date, time, b)) return { ok: false as const, alternatives: availableAlternatives(tutorId, date, b) };
    return { ok: true as const };
  },
};

export async function createTutoringSession(tutorId: string, date: string, time: string): Promise<Booking> {
  await wait(900);
  const avail = AvailabilityService.check(tutorId, date, time);
  if (!avail.ok) throw new Error("That time was just taken. Please pick another available time.");
  const tutor = TUTORS.find((t) => t.id === tutorId)!;
  const booking: Booking = { id: uid(), ref: ref("TS"), tutorId, date, time, startsAt: slotTimestamp(date, time), status: "confirmed", createdAt: Date.now() };
  set((s) => ({
    ...s,
    bookings: [booking, ...s.bookings],
    notifications: notify(s, [
      { audience: "Student", title: "Tutoring confirmed", body: `${tutor.subject} with ${tutor.name} on ${date} at ${time}. Ref ${booking.ref}.` },
      { audience: "Tutor", title: `New session for ${tutor.name}`, body: `${STUDENT.name} booked ${date} at ${time} (simulated tutor notice).` },
    ]),
  }));
  return booking;
}

export async function cancelBooking(id: string) {
  await wait(600);
  const b = load().bookings.find((x) => x.id === id);
  if (!b || b.status !== "confirmed") throw new Error("This booking can no longer be cancelled.");
  if (!canCancel(b.startsAt, Date.now())) throw new Error("Sessions starting within 24 hours can't be cancelled.");
  const tutor = TUTORS.find((t) => t.id === b.tutorId)!;
  set((s) => ({
    ...s,
    bookings: s.bookings.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x)),
    notifications: notify(s, [
      { audience: "Student", title: "Booking cancelled", body: `Your ${tutor.subject} session on ${b.date} at ${b.time} was cancelled.` },
      { audience: "Tutor", title: `Session cancelled for ${tutor.name}`, body: `${STUDENT.name} cancelled ${b.date} at ${b.time}.` },
    ]),
  }));
}

export type CheckInResult =
  | { ok: true; checkin: CheckIn }
  | { ok: false; kind: "invalid_code" | "denied"; message: string };

export async function facilityCheckIn(facilityId: string, code: string): Promise<CheckInResult> {
  await wait(800);
  if (!code.trim()) return { ok: false, kind: "invalid_code", message: "Please enter the facility code." };
  if (!isValidFacilityCode(facilityId, code))
    return { ok: false, kind: "invalid_code", message: "That code doesn't match this facility. Check the code posted at the entrance and try again." };
  const elig = checkEligibility(facilityId, load().restricted); // simulated EnrollmentSystem
  if (!elig.ok) return { ok: false, kind: "denied", message: elig.reason };
  const checkin: CheckIn = { id: uid(), ref: ref("CI"), facilityId, at: Date.now() };
  const f = FACILITIES.find((x) => x.id === facilityId)!;
  set((s) => ({
    ...s,
    checkins: [checkin, ...s.checkins],
    notifications: notify(s, [{ audience: "Student", title: "Checked in", body: `${f.name} · Ref ${checkin.ref}` }]),
  }));
  return { ok: true, checkin };
}

export const setRestricted = (v: boolean) => set((s) => ({ ...s, restricted: v }));
export const markAllRead = () => set((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
export const resetDemo = () => { state = seed(); persist(); listeners.forEach((l) => l()); };

export const fmtDate = (d: string) =>
  new Date(slotTimestamp(d, "12:00 PM")).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
export const fmtStamp = (t: number) =>
  new Date(t).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
