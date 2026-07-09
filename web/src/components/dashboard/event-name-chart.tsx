"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { EventNameChartData } from "@/lib/analytics";

type EventNameChartProps = {
  data: EventNameChartData[];
};

export function EventNameChart({ data }: EventNameChartProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">
          Events by Type
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          イベント種別ごとの発生回数を表示します。
        </p>
      </div>

      {data.length > 0 ? (
        <div className="h-80 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="eventName"
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-80 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
          イベント種別データがありません。
        </div>
      )}
    </div>
  );
}
