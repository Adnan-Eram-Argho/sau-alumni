import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// UptimeRobot er jonno — DB niche ache kina
export async function GET() {
    try {
        const supabase = await createClient();
        const { error } = await supabase.from("faculties").select("id").limit(1);

        if (error) {
            return NextResponse.json(
                { status: "unhealthy", db: "error" },
                { status: 500 }
            );
        }

        return NextResponse.json({ status: "ok", db: "ok" });
    } catch {
        return NextResponse.json(
            { status: "unhealthy", db: "error" },
            { status: 500 }
        );
    }
}