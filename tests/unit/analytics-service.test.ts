import { describe, it, expect } from "vitest";
import { calculateDateRanges } from "@/lib/analytics/service";

describe("Analytics Date Ranges & Historical Window Calculations", () => {
  it("calculates 7-day range with an equal 7-day preceding comparison window", () => {
    const { currentStart, currentEnd, previousStart, previousEnd, interval } =
      calculateDateRanges("7d");

    const currentDurationMs = currentEnd.getTime() - currentStart.getTime();
    const previousDurationMs = previousEnd.getTime() - previousStart.getTime();

    expect(interval).toBe("day");
    // Ensure both windows have identical length (7 days = 604,800,000 ms)
    expect(currentDurationMs).toBe(7 * 24 * 60 * 60 * 1000);
    expect(previousDurationMs).toBe(currentDurationMs);
    expect(previousEnd.getTime()).toBe(currentStart.getTime());
  });

  it("calculates 30-day range with an equal 30-day preceding comparison window", () => {
    const { currentStart, currentEnd, previousStart, previousEnd, interval } =
      calculateDateRanges("30d");

    const currentDurationMs = currentEnd.getTime() - currentStart.getTime();
    const previousDurationMs = previousEnd.getTime() - previousStart.getTime();

    expect(interval).toBe("day");
    expect(currentDurationMs).toBe(30 * 24 * 60 * 60 * 1000);
    expect(previousDurationMs).toBe(currentDurationMs);
  });

  it("calculates today range with hourly aggregation interval", () => {
    const { currentStart, interval } = calculateDateRanges("today");
    expect(interval).toBe("hour");
    expect(currentStart.getHours()).toBe(0);
    expect(currentStart.getMinutes()).toBe(0);
  });

  it("calculates custom range and sets appropriate interval", () => {
    const start = "2026-10-01T00:00:00.000Z";
    const end = "2026-10-15T00:00:00.000Z";
    const { currentStart, currentEnd, interval } = calculateDateRanges("custom", start, end);

    expect(currentStart.toISOString()).toBe(start);
    expect(currentEnd.toISOString()).toBe(end);
    expect(interval).toBe("day");
  });
});
