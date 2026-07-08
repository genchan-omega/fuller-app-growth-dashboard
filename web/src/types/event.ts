export type EventLog = {
  id: string;
  user_id: string;
  event_name: string;
  screen_name: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
  device: string | null;
  app_version: string | null;
  created_at: string;
};