import { NextResponse } from "next/server";
import { DEMO_USERS } from "@/lib/demo-data";
import { attachSessionCookie } from "@/lib/session";
import { recordAuditEvent } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, roleSwitch } = body;

    if (roleSwitch) {
      const demoUser = DEMO_USERS.find((u) => u.role === roleSwitch);
      if (demoUser) {
        recordAuditEvent({
          actorEmail: demoUser.email,
          actorRole: demoUser.role,
          actorName: demoUser.name,
          action: "LOGIN",
          resource: "USER",
          details: `User logged in via demo role switcher as ${demoUser.role}`,
        });
        return attachSessionCookie(NextResponse.json({ success: true, user: demoUser }), demoUser);
      }
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const matchedUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!matchedUser) {
      recordAuditEvent({
        actorEmail: email,
        actorRole: "STUDENT",
        actorName: "Anonymous",
        action: "LOGIN",
        resource: "USER",
        outcome: "FAILURE",
        details: `Failed login attempt for email: ${email}`,
      });
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    recordAuditEvent({
      actorEmail: matchedUser.email,
      actorRole: matchedUser.role,
      actorName: matchedUser.name,
      action: "LOGIN",
      resource: "USER",
      details: `User logged in successfully as ${matchedUser.role}`,
    });

    return attachSessionCookie(NextResponse.json({ success: true, user: matchedUser }), matchedUser);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
