import { EventNameChart } from "@/components/dashboard/event-name-chart";
import { FunnelAnalysis } from "@/components/dashboard/funnel-analysis";
import { ImprovementBoard } from "@/components/dashboard/improvement-board";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  getEventCount,
  getEventNameChartData,
  getFunnelSummary,
  getImprovementIdeas,
  getTotalEventCount,
  getUniqueUserCount,
} from "@/lib/analytics";
import { supabase } from "@/lib/supabase";
import type { EventLog } from "@/types/event";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const events = (data ?? []) as EventLog[];

  const totalEventCount = getTotalEventCount(events);
  const uniqueUserCount = getUniqueUserCount(events);
  const detailViewCount = getEventCount(events, "recipe_detail_view");
  const favoriteAddCount = getEventCount(events, "favorite_add");
  const eventNameChartData = getEventNameChartData(events);
  const funnelSummary = getFunnelSummary(events);
  const improvementIdeas = getImprovementIdeas(events, funnelSummary);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-500">
            App Growth Dashboard
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Mini Recipe Growth Analytics
          </h1>
          <p className="mt-2 text-slate-600">
            Androidアプリから送信されたイベントログをもとに、利用状況・ファネル・改善施策を整理します。
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            <p className="font-bold">Failed to load events</p>
            <p className="mt-1">
              Supabaseからイベントを取得できなかったため、空データとしてダッシュボードを表示しています。
            </p>
            <p className="mt-1 font-mono text-xs">{error.message}</p>
          </div>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Events"
            value={totalEventCount}
            description="取得したイベントログの総数"
          />
          <KpiCard
            title="Unique Users"
            value={uniqueUserCount}
            description="イベントを発生させたユーザー数"
          />
          <KpiCard
            title="Detail Views"
            value={detailViewCount}
            description="レシピ詳細画面の閲覧数"
          />
          <KpiCard
            title="Favorites"
            value={favoriteAddCount}
            description="お気に入り登録イベント数"
          />
        </section>

        <section className="mb-6">
          <EventNameChart data={eventNameChartData} />
        </section>

        <div className="mb-6">
          <FunnelAnalysis summary={funnelSummary} />
        </div>

        <div className="mb-6">
          <ImprovementBoard ideas={improvementIdeas} />
        </div>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900">
              Recent Events
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              直近のイベントログを新しい順に表示します。
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Screen</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Device</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(event.created_at).toLocaleString("ja-JP")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">
                      {event.user_id}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {event.event_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {event.screen_name ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {event.target_id ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {event.device ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {events.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No events found.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
