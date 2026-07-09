import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EventNameChart } from "@/components/dashboard/event-name-chart";

describe("EventNameChart", () => {
  it("renders an empty state without mounting Recharts when data is empty", () => {
    render(<EventNameChart data={[]} />);

    expect(screen.getByText("イベント種別データがありません。"))
      .toBeInTheDocument();
  });
});
