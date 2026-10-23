import { NextResponse } from "next/server";
import { createPublicClient } from "@/utils/supabase/public";

// UptimeRobot / Monitoring health check endpoint.
// Uses cookie-free public client so it never invokes cookie parsing.
// Returns DB connectivity status, query latency, and disables all caching.
export async function GET() {
  const start = performance.now();

  try {
    const supabase = createPublicClient();
    const { error } = await supabase.from("faculties").select("id").limit(1);
    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      console.error("Health check database query failed:", error);
      return NextResponse.json(
        { status: "unhealthy" },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    return NextResponse.json(
      {
        status: "ok",
        db: "ok",
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: unknown) {
    console.error("Health check failed:", err);
    return NextResponse.json(
      { status: "unhealthy" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
