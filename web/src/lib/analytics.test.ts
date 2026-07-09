import { describe, expect, it } from "vitest";

import {
  formatPercent,
  getEventNameChartData,
  getEventUniqueUserCount,
  getFunnelSummary,
  getImprovementIdeas,
} from "@/lib/analytics";
import type { EventLog } from "@/types/event";

function event(
  id: string,
  userId: string,
  eventName: string,
  createdAt: string,
): EventLog {
  return {
    id,
    user_id: userId,
    event_name: eventName,
    screen_name: null,
    target_id: null,
    metadata: {},
    device: "android",
    app_version: "1.0.0",
    created_at: createdAt,
  };
}

describe("analytics", () => {
  const events = [
    event("1", "u1", "app_open", "2026-07-01T09:00:00.000Z"),
    event("2", "u1", "recipe_list_view", "2026-07-01T09:01:00.000Z"),
    event("3", "u1", "recipe_detail_view", "2026-07-01T09:02:00.000Z"),
    event("4", "u1", "favorite_add", "2026-07-01T09:03:00.000Z"),
    event("5", "u2", "app_open", "2026-07-01T10:00:00.000Z"),
    event("6", "u2", "recipe_list_view", "2026-07-01T10:01:00.000Z"),
    event("7", "u3", "app_open", "2026-07-01T11:00:00.000Z"),
    event("8", "u3", "recipe_detail_view", "2026-07-01T11:01:00.000Z"),
    event("9", "u4", "recipe_list_view", "2026-07-01T12:00:00.000Z"),
    event("10", "u1", "recipe_search", "2026-07-01T09:04:00.000Z"),
  ];

  it("counts event names in descending frequency order", () => {
    expect(getEventNameChartData(events)).toEqual([
      { eventName: "app_open", count: 3 },
      { eventName: "recipe_list_view", count: 3 },
      { eventName: "recipe_detail_view", count: 2 },
      { eventName: "favorite_add", count: 1 },
      { eventName: "recipe_search", count: 1 },
    ]);
  });

  it("counts unique users for a single event name", () => {
    expect(getEventUniqueUserCount(events, "recipe_list_view")).toBe(3);
    expect(getEventUniqueUserCount(events, "favorite_add")).toBe(1);
  });

  it("builds an ordered user funnel and excludes out-of-order steps", () => {
    const summary = getFunnelSummary(events);

    expect(summary.totalUsers).toBe(4);
    expect(summary.startUsers).toBe(3);
    expect(summary.completionUsers).toBe(1);
    expect(summary.overallConversionRate).toBe(33.3);
    expect(summary.steps.map((step) => step.count)).toEqual([3, 2, 1, 1]);
    expect(summary.steps.map((step) => step.conversionFromPrevious)).toEqual([
      100, 66.7, 50, 100,
    ]);
    expect(summary.biggestDropOff?.id).toBe("list");
  });

  it("handles an empty funnel without division by zero", () => {
    const summary = getFunnelSummary([]);

    expect(summary.totalUsers).toBe(0);
    expect(summary.startUsers).toBe(0);
    expect(summary.completionUsers).toBe(0);
    expect(summary.overallConversionRate).toBe(0);
    expect(summary.steps.every((step) => step.count === 0)).toBe(true);
    expect(summary.biggestDropOff).toBeNull();
  });

  it("generates prioritized improvement ideas from the funnel", () => {
    const summary = getFunnelSummary(events);
    const ideas = getImprovementIdeas(events, summary);

    expect(ideas).toHaveLength(4);
    expect(ideas[0]).toMatchObject({
      id: "reduce-largest-dropoff",
      lane: "now",
      title: "アプリ起動から一覧閲覧への離脱を減らす",
    });
    expect(ideas.some((idea) => idea.id === "increase-favorite-conversion"))
      .toBe(true);
  });

  it("formats percentages with one decimal place", () => {
    expect(formatPercent(66.666)).toBe("66.7%");
    expect(formatPercent(0)).toBe("0.0%");
  });
});
