import { describe, it, expect } from "vitest";
import { formatDate, getCountdown } from "../lib/utils";

describe("Utils", () => {
  describe("formatDate", () => {
    it("formats date strings correctly", () => {
      expect(formatDate("2026-05-10")).toBe("May 10, 2026");
    });
    
    it("handles Date objects", () => {
      const date = new Date(2026, 4, 10); // May is 4
      expect(formatDate(date)).toBe("May 10, 2026");
    });
  });

  describe("getCountdown", () => {
    it("returns 'Passed' for past dates", () => {
      const pastDate = new Date(Date.now() - 100000).toISOString();
      expect(getCountdown(pastDate)).toBe("Passed");
    });

    it("returns days and hours for future dates", () => {
      const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString();
      expect(getCountdown(futureDate)).toContain("2d");
    });

    it("returns hours and minutes for dates within 24h", () => {
      const soonDate = new Date(Date.now() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString();
      const countdown = getCountdown(soonDate);
      expect(countdown).toContain("5h");
      expect(countdown).toContain("m");
    });
  });
});
