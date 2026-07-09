import type {
  ImprovementIdea,
  ImprovementLane,
  ImprovementPriority,
} from "@/lib/analytics";

type ImprovementBoardProps = {
  ideas: ImprovementIdea[];
};

const lanes: Array<{
  id: ImprovementLane;
  title: string;
  description: string;
}> = [
  {
    id: "now",
    title: "Now",
    description: "最初に検証する施策",
  },
  {
    id: "next",
    title: "Next",
    description: "追加計測後に試す施策",
  },
  {
    id: "later",
    title: "Later",
    description: "ポートフォリオ拡張候補",
  },
];

export function ImprovementBoard({ ideas }: ImprovementBoardProps) {
  return (
    <section>
      <div className="mb-4">
        <p className="text-sm font-medium text-slate-500">
          Improvement Board
        </p>
        <h2 className="text-xl font-bold text-slate-950">改善施策ボード</h2>
        <p className="mt-1 text-sm text-slate-600">
          ファネルとイベント種別の集計から、次に試すべき改善案を優先度付きで整理します。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {lanes.map((lane) => {
          const laneIdeas = ideas.filter((idea) => idea.lane === lane.id);

          return (
            <div key={lane.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4">
                <h3 className="font-bold text-slate-950">{lane.title}</h3>
                <p className="text-sm text-slate-500">{lane.description}</p>
              </div>

              <div className="space-y-3">
                {laneIdeas.map((idea) => (
                  <article
                    key={idea.id}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h4 className="text-sm font-bold leading-6 text-slate-950">
                        {idea.title}
                      </h4>
                      <PriorityBadge priority={idea.priority} />
                    </div>

                    <p className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                      {idea.metric}
                    </p>

                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold text-slate-900">
                          仮説:
                        </span>{" "}
                        {idea.hypothesis}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">
                          施策:
                        </span>{" "}
                        {idea.action}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PriorityBadge({ priority }: { priority: ImprovementPriority }) {
  const className =
    priority === "High"
      ? "bg-rose-100 text-rose-700"
      : priority === "Medium"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-bold ${className}`}>
      {priority}
    </span>
  );
}
