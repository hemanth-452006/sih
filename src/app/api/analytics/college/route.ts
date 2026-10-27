import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { getCollegeMetrics } from "@/lib/db-store";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const requestedInst = searchParams.get("institutionId");

    // Enforce data isolation: only SUPER_ADMIN can inspect arbitrary institutions
    const institutionId = session.role === "SUPER_ADMIN" ? (requestedInst || session.institutionId || "inst-dit-001") : session.institutionId || "inst-dit-001";

    const metrics = getCollegeMetrics(institutionId);
    return NextResponse.json(metrics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
