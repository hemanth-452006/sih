import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { getIntakeData, updateApprovedIntake } from "@/lib/db-store";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const requestedInst = searchParams.get("institutionId");

    const institutionId = session.role === "SUPER_ADMIN" ? (requestedInst || undefined) : session.institutionId;
    const data = getIntakeData(institutionId);

    return NextResponse.json({ intakeStats: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getCurrentSession();
    // Only AICTE Super Admin can configure and modify approved intake limits
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only AICTE Super Administrators are authorized to modify approved intake limits" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { courseId, academicYear, approvedCount } = body;

    if (!courseId || !academicYear || typeof approvedCount !== "number" || approvedCount <= 0) {
      return NextResponse.json({ error: "Invalid intake configuration parameters" }, { status: 400 });
    }

    const success = updateApprovedIntake(courseId, academicYear, approvedCount, {
      email: session.email,
      role: session.role,
      name: session.name,
    });

    if (!success) {
      return NextResponse.json({ error: "Intake record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Approved intake updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
