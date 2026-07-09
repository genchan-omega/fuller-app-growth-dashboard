import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ImprovementBoard } from "@/components/dashboard/improvement-board";
import type { ImprovementIdea } from "@/lib/analytics";

const ideas: ImprovementIdea[] = [
  {
    id: "a",
    lane: "now",
    priority: "High",
    title: "一覧から詳細への離脱を減らす",
    metric: "2人が離脱",
    hypothesis: "導線が弱い可能性があります。",
    action: "CTAを改善する。",
  },
  {
    id: "b",
    lane: "next",
    priority: "Medium",
    title: "検索結果クリックを追加する",
    metric: "検索1件",
    hypothesis: "検索後の行動が見えません。",
    action: "イベントを追加する。",
  },
];

describe("ImprovementBoard", () => {
  it("renders ideas grouped by lane", () => {
    render(<ImprovementBoard ideas={ideas} />);

    expect(screen.getByRole("heading", { name: "改善施策ボード" }))
      .toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Now" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Next" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Later" })).toBeInTheDocument();
    expect(screen.getByText("一覧から詳細への離脱を減らす"))
      .toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });
});
