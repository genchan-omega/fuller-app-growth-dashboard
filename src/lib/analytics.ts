import type { EventLog } from "@/types/event";

export type EventNameChartData = {
  eventName: string;
  count: number;
};

export function getTotalEventCount(events: EventLog[]) {
  return events.length;
}

export function getUniqueUserCount(events: EventLog[]) {
  return new Set(events.map((event) => event.user_id)).size;
}

export function getEventCount(events: EventLog[], eventName: string) {
  return events.filter((event) => event.event_name === eventName).length;
}

export function getEventNameChartData(
  events: EventLog[],
): EventNameChartData[] {
  const eventCountMap = new Map<string, number>();

  for (const event of events) {
    eventCountMap.set(
      event.event_name,
      (eventCountMap.get(event.event_name) ?? 0) + 1,
    );
  }

  return Array.from(eventCountMap.entries())
    .map(([eventName, count]) => ({
      eventName,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}