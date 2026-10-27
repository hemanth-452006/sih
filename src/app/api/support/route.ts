import { NextResponse } from "next/server";
import { createSupportTicket } from "@/lib/db-store";

const categories = new Set([
  "Technical Integration / API Help",
  "Duplicate Enrolment Dispute",
  "Approved Intake Discrepancy",
  "Institution Onboarding Status",
  "Grievance Redressal",
]);

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Please provide valid support request details." }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const name = typeof input.name === "string" ? input.name.trim() : "";
    const email = typeof input.email === "string" ? input.email.trim() : "";
    const institution = typeof input.institution === "string" ? input.institution.trim() : "";
    const category = typeof input.category === "string" ? input.category : "";
    const message = typeof input.message === "string" ? input.message.trim() : "";

    if (!name || !email || !institution || !message || !categories.has(category)) {
      return NextResponse.json({ error: "Complete all fields and select a valid inquiry classification." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const ticket = createSupportTicket({ name, email, institution, category, message });
    return NextResponse.json({ success: true, ticket: { id: ticket.id, status: ticket.status, createdAt: ticket.createdAt } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not submit the support request. Please try again." }, { status: 400 });
  }
}
