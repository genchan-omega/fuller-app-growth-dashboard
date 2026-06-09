import { EventNameChart } from "@/components/dashboard/event-name-chart";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  getEventCount,
  getEventNameChartData,
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
    .limit(100);

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl rounded-lg bg-white p-6 shadow">
          <h1 className="text-xl font-bold text-red-600">
            Failed to load events
          </h1>
          <p className="mt-2 text-sm text-slate-600">{error.message}</p>
        </div>
      </main>
    );
  }

  const events = (data ?? []) as EventLog[];

  const totalEventCount = getTotalEventCount(events);
  const uniqueUserCount = getUniqueUserCount(events);
  const detailViewCount = getEventCount(events, "recipe_detail_view");
  const favoriteAddCount = getEventCount(events, "favorite_add");
  const eventNameChartData = getEventNameChartData(events);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-500">
            App Growth Dashboard
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Event Logs</h1>
          <p className="mt-2 text-slate-600">
            Androidアプリから送信される想定のイベントログを可視化します。
          </p>
        </div>

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

        <section className="overflow-hidden rounded-xl bg-white shadow">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900">
              Recent Events
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              直近のイベントログを新しい順に表示します。
            </p>
          </div>

          <table className="w-full border-collapse text-left text-sm">
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