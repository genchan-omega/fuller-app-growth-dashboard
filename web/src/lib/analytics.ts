import type { EventLog } from "@/types/event";

export type EventNameChartData = {
  eventName: string;
  count: number;
};

export type FunnelStepDefinition = {
  id: string;
  label: string;
  eventName: string;
  description: string;
};

export type FunnelStepResult = FunnelStepDefinition & {
  order: number;
  count: number;
  conversionFromPrevious: number;
  conversionFromStart: number;
  dropOffFromPrevious: number;
  dropOffRateFromPrevious: number;
};

export type FunnelSummary = {
  steps: FunnelStepResult[];
  totalUsers: number;
  startUsers: number;
  completionUsers: number;
  overallConversionRate: number;
  biggestDropOff: FunnelStepResult | null;
};

export type ImprovementLane = "now" | "next" | "later";

export type ImprovementPriority = "High" | "Medium" | "Low";

export type ImprovementIdea = {
  id: string;
  lane: ImprovementLane;
  priority: ImprovementPriority;
  title: string;
  metric: string;
  hypothesis: string;
  action: string;
};

export const RECIPE_FUNNEL_STEPS: FunnelStepDefinition[] = [
  {
    id: "open",
    label: "アプリ起動",
    eventName: "app_open",
    description: "アプリを開いたユーザー",
  },
  {
    id: "list",
    label: "一覧閲覧",
    eventName: "recipe_list_view",
    description: "レシピ一覧を見たユーザー",
  },
  {
    id: "detail",
    label: "詳細閲覧",
    eventName: "recipe_detail_view",
    description: "レシピ詳細まで進んだユーザー",
  },
  {
    id: "favorite",
    label: "お気に入り",
    eventName: "favorite_add",
    description: "お気に入り登録まで完了したユーザー",
  },
];

export function getTotalEventCount(events: EventLog[]) {
  return events.length;
}

export function getUniqueUserCount(events: EventLog[]) {
  return new Set(events.map((event) => event.user_id)).size;
}

export function getEventCount(events: EventLog[], eventName: string) {
  return events.filter((event) => event.event_name === eventName).length;
}

export function getEventUniqueUserCount(events: EventLog[], eventName: string) {
  return new Set(
    events
      .filter((event) => event.event_name === eventName)
      .map((event) => event.user_id),
  ).size;
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

export function getFunnelSummary(
  events: EventLog[],
  steps: FunnelStepDefinition[] = RECIPE_FUNNEL_STEPS,
): FunnelSummary {
  const totalUsers = getUniqueUserCount(events);
  const userEvents = groupEventsByUser(events);
  const completedUsersByStep = steps.map(() => new Set<string>());

  for (const [userId, userEventList] of userEvents.entries()) {
    let cursor = -1;

    for (const [stepIndex, step] of steps.entries()) {
      const nextIndex = userEventList.findIndex(
        (event, eventIndex) =>
          eventIndex > cursor && event.event_name === step.eventName,
      );

      if (nextIndex === -1) {
        break;
      }

      completedUsersByStep[stepIndex].add(userId);
      cursor = nextIndex;
    }
  }

  const startUsers = completedUsersByStep[0]?.size ?? 0;

  const stepResults = steps.map((step, index) => {
    const count = completedUsersByStep[index].size;
    const previousCount =
      index === 0 ? count : completedUsersByStep[index - 1].size;
    const dropOffFromPrevious = Math.max(previousCount - count, 0);

    return {
      ...step,
      order: index + 1,
      count,
      conversionFromPrevious:
        index === 0 ? 100 : toPercent(count, previousCount),
      conversionFromStart: toPercent(count, startUsers),
      dropOffFromPrevious,
      dropOffRateFromPrevious:
        index === 0 ? 0 : toPercent(dropOffFromPrevious, previousCount),
    };
  });

  const completionUsers = stepResults.at(-1)?.count ?? 0;
  const biggestDropOff = stepResults
    .slice(1)
    .reduce<FunnelStepResult | null>((current, step) => {
      if (!current || step.dropOffFromPrevious > current.dropOffFromPrevious) {
        return step;
      }

      return current;
    }, null);

  return {
    steps: stepResults,
    totalUsers,
    startUsers,
    completionUsers,
    overallConversionRate: toPercent(completionUsers, startUsers),
    biggestDropOff:
      biggestDropOff && biggestDropOff.dropOffFromPrevious > 0
        ? biggestDropOff
        : null,
  };
}

export function getImprovementIdeas(
  events: EventLog[],
  funnelSummary: FunnelSummary,
): ImprovementIdea[] {
  const ideas: ImprovementIdea[] = [];
  const detailUsers = getEventUniqueUserCount(events, "recipe_detail_view");
  const favoriteUsers = getEventUniqueUserCount(events, "favorite_add");
  const searchUsers = getEventUniqueUserCount(events, "recipe_search");
  const searchEvents = getEventCount(events, "recipe_search");
  const favoriteRate = toPercent(favoriteUsers, detailUsers);

  if (funnelSummary.biggestDropOff) {
    const droppedStep = funnelSummary.biggestDropOff;
    const previousStep = funnelSummary.steps[droppedStep.order - 2];

    ideas.push({
      id: "reduce-largest-dropoff",
      lane: "now",
      priority:
        droppedStep.dropOffRateFromPrevious >= 40 ? "High" : "Medium",
      title: `${previousStep.label}から${droppedStep.label}への離脱を減らす`,
      metric: `${droppedStep.dropOffFromPrevious}人が離脱 / 前段比 ${formatPercent(droppedStep.conversionFromPrevious)}`,
      hypothesis:
        "次の行動に進む理由や導線が弱く、ユーザーが価値を理解する前に止まっている可能性があります。",
      action:
        "該当画面の主要CTAを1つに絞り、レシピの魅力が伝わるタイトル・画像・説明文のABテストを行う。",
    });
  } else {
    ideas.push({
      id: "keep-funnel-instrumented",
      lane: "now",
      priority: "Medium",
      title: "ファネル計測を維持して母数を増やす",
      metric: `開始 ${funnelSummary.startUsers}人 / 完了 ${funnelSummary.completionUsers}人`,
      hypothesis:
        "現時点のログでは大きな離脱箇所が見えにくいため、継続的な計測で判断できる母数を増やす必要があります。",
      action:
        "イベント送信を継続し、日次でファネルの開始数・完了数・離脱率を確認する。",
    });
  }

  ideas.push({
    id: "increase-favorite-conversion",
    lane: favoriteRate < 35 ? "now" : "next",
    priority: favoriteRate < 20 ? "High" : "Medium",
    title: "お気に入り登録率を改善する",
    metric: `詳細閲覧からお気に入り: ${formatPercent(favoriteRate)} (${favoriteUsers}/${detailUsers}人)`,
    hypothesis:
      "お気に入りの価値や保存後の利用シーンが伝わらず、詳細閲覧後の次アクションが弱い可能性があります。",
    action:
      "詳細画面に保存メリットの短い文言を追加し、登録ボタンの位置・色・文言を比較する。",
  });

  ideas.push({
    id: "connect-search-to-detail",
    lane: searchUsers > 0 ? "next" : "later",
    priority: searchUsers > 0 ? "Medium" : "Low",
    title: "検索から詳細閲覧への遷移を追跡する",
    metric: `検索イベント: ${searchEvents}件 / 検索ユーザー: ${searchUsers}人`,
    hypothesis:
      "検索行動はあるが、検索結果クリックを測れていないため、検索体験の良し悪しを判断しにくい状態です。",
    action:
      "`search_result_click` を追加し、検索キーワード別に詳細閲覧率を比較できるようにする。",
  });

  ideas.push({
    id: "expand-event-taxonomy",
    lane: "later",
    priority: "Low",
    title: "イベント設計をポートフォリオ向けに拡張する",
    metric: `${getEventNameChartData(events).length}種類のイベントを計測中`,
    hypothesis:
      "現在のイベントだけでは、継続利用や再訪、解除、共有などの改善余地を説明しきれません。",
    action:
      "`favorite_remove`, `recipe_share`, `app_resume`, `session_end` を追加し、施策評価の粒度を上げる。",
  });

  return ideas;
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function groupEventsByUser(events: EventLog[]) {
  const userEventMap = new Map<string, EventLog[]>();

  for (const event of events) {
    const userEvents = userEventMap.get(event.user_id) ?? [];
    userEvents.push(event);
    userEventMap.set(event.user_id, userEvents);
  }

  for (const userEvents of userEventMap.values()) {
    userEvents.sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();

      if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
        return a.created_at.localeCompare(b.created_at);
      }

      return aTime - bTime;
    });
  }

  return userEventMap;
}

function toPercent(part: number, whole: number) {
  if (whole <= 0) {
    return 0;
  }

  return Math.round((part / whole) * 1000) / 10;
}
