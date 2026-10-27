import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { getAuditLogs } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "COLLEGE_ADMIN")) {
      return NextResponse.json({ error: "Forbidden: Audit logs are restricted to administrators" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const action = searchParams.get("action") || undefined;
    const resource = searchParams.get("resource") || undefined;

    const institutionId = session.role === "SUPER_ADMIN" ? undefined : session.institutionId;

    const logs = getAuditLogs({
      institutionId,
      action,
      resource,
      search,
    });

    return NextResponse.json({ total: logs.length, logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
