import { NextResponse } from "next/server";
import { clearSessionFromResponse, getCurrentSession } from "@/lib/session";
import { recordAuditEvent } from "@/lib/audit";

export async function POST() {
  const session = await getCurrentSession();
  if (session) {
    recordAuditEvent({
      actorEmail: session.email,
      actorRole: session.role,
      actorName: session.name,
      action: "LOGOUT",
      resource: "USER",
      details: "User logged out of session",
    });
  }

  return clearSessionFromResponse(NextResponse.json({ success: true }));
}
