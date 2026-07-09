import { formatPercent, type FunnelSummary } from "@/lib/analytics";

type FunnelAnalysisProps = {
  summary: FunnelSummary;
};

export function FunnelAnalysis({ summary }: FunnelAnalysisProps) {
  const maxCount = Math.max(...summary.steps.map((step) => step.count), 1);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Funnel Analysis
          </p>
          <h2 className="text-xl font-bold text-slate-950">
            レシピ閲覧からお気に入り登録まで
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Androidアプリの送信イベントをユーザー単位で時系列に並べ、順番に到達した人数を集計します。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <SummaryStat label="開始" value={`${summary.startUsers}人`} />
          <SummaryStat label="完了" value={`${summary.completionUsers}人`} />
          <SummaryStat
            label="全体CVR"
            value={formatPercent(summary.overallConversionRate)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {summary.steps.map((step) => {
          const width = Math.max((step.count / maxCount) * 100, 2);

          return (
            <div key={step.id} className="grid gap-3 lg:grid-cols-[160px_1fr_220px] lg:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {step.order}
                  </span>
                  <p className="font-semibold text-slate-900">{step.label}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {step.eventName}
                </p>
              </div>

              <div>
                <div className="h-9 rounded-md bg-slate-100">
                  <div
                    className="flex h-9 items-center rounded-md bg-emerald-500 px-3 text-sm font-semibold text-white"
                    style={{ width: `${width}%` }}
                  >
                    {step.count}人
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {step.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <Metric label="前段比" value={formatPercent(step.conversionFromPrevious)} />
                <Metric label="開始比" value={formatPercent(step.conversionFromStart)} />
                <Metric
                  label="離脱"
                  value={`${step.dropOffFromPrevious}人`}
                  tone={step.dropOffFromPrevious > 0 ? "warn" : "default"}
                />
              </div>
            </div>
          );
        })}
      </div>

      {summary.biggestDropOff && (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          最大の離脱は
          <span className="font-bold">
            {" "}
            {summary.biggestDropOff.label}
          </span>
          への遷移で、前段から
          <span className="font-bold">
            {" "}
            {summary.biggestDropOff.dropOffFromPrevious}人
          </span>
          が離脱しています。
        </div>
      )}
    </section>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-24 rounded-md border border-slate-200 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-950">{value}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warn";
}) {
  return (
    <div className="rounded-md bg-slate-50 px-2 py-2">
      <p className="text-slate-500">{label}</p>
      <p
        className={
          tone === "warn"
            ? "font-bold text-amber-700"
            : "font-bold text-slate-900"
        }
      >
        {value}
      </p>
    </div>
  );
}
