import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FunnelAnalysis } from "@/components/dashboard/funnel-analysis";
import { getFunnelSummary } from "@/lib/analytics";
import type { EventLog } from "@/types/event";

const events: EventLog[] = [
  {
    id: "1",
    user_id: "u1",
    event_name: "app_open",
    screen_name: "home",
    target_id: null,
    metadata: {},
    device: "android",
    app_version: "1.0.0",
    created_at: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "2",
    user_id: "u1",
    event_name: "recipe_list_view",
    screen_name: "recipe_list",
    target_id: null,
    metadata: {},
    device: "android",
    app_version: "1.0.0",
    created_at: "2026-07-01T09:01:00.000Z",
  },
  {
    id: "3",
    user_id: "u2",
    event_name: "app_open",
    screen_name: "home",
    target_id: null,
    metadata: {},
    device: "android",
    app_version: "1.0.0",
    created_at: "2026-07-01T10:00:00.000Z",
  },
];

describe("FunnelAnalysis", () => {
  it("renders funnel labels and summary metrics", () => {
    render(<FunnelAnalysis summary={getFunnelSummary(events)} />);

    expect(screen.getByRole("heading", {
      name: "レシピ閲覧からお気に入り登録まで",
    })).toBeInTheDocument();
    expect(screen.getByText("開始")).toBeInTheDocument();
    expect(screen.getAllByText("2人")).toHaveLength(2);
    expect(screen.getAllByText("一覧閲覧")).toHaveLength(2);
    expect(screen.getByText("favorite_add")).toBeInTheDocument();
  });
});
