import { NextResponse } from "next/server";
import { z } from "zod";

import { supabase } from "@/lib/supabase";

const eventSchema = z.object({
  user_id: z.string().min(1),
  event_name: z.string().min(1),
  screen_name: z.string().nullable().optional(),
  target_id: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  device: z.string().default("android"),
  app_version: z.string().default("1.0.0"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("events").insert({
      user_id: parsed.data.user_id,
      event_name: parsed.data.event_name,
      screen_name: parsed.data.screen_name ?? null,
      target_id: parsed.data.target_id ?? null,
      metadata: parsed.data.metadata ?? {},
      device: parsed.data.device,
      app_version: parsed.data.app_version,
    });

    if (error) {
      return NextResponse.json(
        {
          error: "Failed to insert event",
          message: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 },
    );
  }
}