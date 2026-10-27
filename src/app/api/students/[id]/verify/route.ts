import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { submitVerificationDecision, getStudentById } from "@/lib/db-store";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "COLLEGE_ADMIN" && session.role !== "FACULTY")) {
      return NextResponse.json({ error: "Forbidden: Only authorized verification officers may submit decisions" }, { status: 403 });
    }

    const current = getStudentById(id);
    if (!current) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Isolation check
    if (session.role !== "SUPER_ADMIN" && current.institutionId !== session.institutionId) {
      return NextResponse.json({ error: "Forbidden: Cannot verify records of other institutions" }, { status: 403 });
    }

    const body = await req.json();
    const { decision, notes } = body;

    if (!decision || !["VERIFIED", "REJECTED", "NEEDS_CORRECTION"].includes(decision)) {
      return NextResponse.json({ error: "Invalid verification decision" }, { status: 400 });
    }

    const updated = submitVerificationDecision(id, decision, notes || "", {
      email: session.email,
      role: session.role,
      name: session.name,
    });

    return NextResponse.json({
      success: true,
      message: `Student verification status set to ${decision}`,
      student: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
