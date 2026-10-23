import { describe, expect, it } from "vitest";
import { canCancel, checkEligibility, isSlotTaken, isValidFacilityCode } from "@/lib/rules";

const H = 3600 * 1000;

describe("CampusConnect rules", () => {
  it("3:00 PM is always taken", () => expect(isSlotTaken("jordan", "2026-11-01", "3:00 PM", [])).toBe(true));
  it("prevents double booking", () => {
    const b = [{ tutorId: "jordan", date: "2026-11-01", time: "10:00 AM", status: "confirmed" as const }];
    expect(isSlotTaken("jordan", "2026-11-01", "10:00 AM", b)).toBe(true);
    expect(isSlotTaken("maya", "2026-11-01", "10:00 AM", b)).toBe(false);
  });
  it("blocks cancellation within 24 hours", () => {
    expect(canCancel(1000 + 23 * H, 1000)).toBe(false);
    expect(canCancel(1000 + 25 * H, 1000)).toBe(true);
  });
  it("accepts only LIB-2026 / GYM-2026", () => {
    expect(isValidFacilityCode("library", " lib-2026 ")).toBe(true);
    expect(isValidFacilityCode("fitness", "LIB-2026")).toBe(false);
  });
  it("denies restricted student at fitness center only", () => {
    expect(checkEligibility("fitness", true).ok).toBe(false);
    expect(checkEligibility("library", true).ok).toBe(true);
  });
});
