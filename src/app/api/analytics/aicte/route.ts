import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { getAicteMetrics } from "@/lib/db-store";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Administrator access required" }, { status: 403 });
    }

    const metrics = getAicteMetrics();
    return NextResponse.json(metrics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
