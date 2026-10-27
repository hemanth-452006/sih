import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { getDuplicateAlerts, resolveDuplicateAlert } from "@/lib/db-store";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const institutionId = session.role === "SUPER_ADMIN" ? undefined : session.institutionId;
    const alerts = getDuplicateAlerts({ institutionId, status });

    return NextResponse.json({ total: alerts.length, alerts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "COLLEGE_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { alertId, resolution, notes } = body;

    if (!alertId || !resolution || !["CONFIRMED", "DISMISSED", "MERGED"].includes(resolution)) {
      return NextResponse.json({ error: "Invalid resolution data" }, { status: 400 });
    }

    const success = resolveDuplicateAlert(alertId, resolution, notes || "", {
      email: session.email,
      role: session.role,
      name: session.name,
    });

    if (!success) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Alert resolved as ${resolution}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
