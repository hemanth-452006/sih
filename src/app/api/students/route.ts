import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { getAllStudents, createStudent } from "@/lib/db-store";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const departmentId = searchParams.get("departmentId") || undefined;
    const courseId = searchParams.get("courseId") || undefined;
    const academicYear = searchParams.get("academicYear") || undefined;
    const status = searchParams.get("status") || undefined;
    const verificationStatus = searchParams.get("verificationStatus") || undefined;
    const includeArchived = searchParams.get("includeArchived") === "true";

    // Enforce Institution-level Data Isolation:
    // If not SUPER_ADMIN, automatically restrict institutionId to user's assigned institution!
    let targetInstitutionId: string | undefined = undefined;

    if (session.role === "SUPER_ADMIN") {
      targetInstitutionId = searchParams.get("institutionId") || undefined;
    } else {
      targetInstitutionId = session.institutionId;
    }

    let students = getAllStudents({
      institutionId: targetInstitutionId,
      departmentId,
      courseId,
      academicYear,
      status,
      verificationStatus,
      search,
      includeArchived,
    });

    if (session.role === "STUDENT") {
      students = students.filter(
        (s) => s.email.toLowerCase() === session.email.toLowerCase() || s.id === session.studentId
      );
    }

    return NextResponse.json({
      total: students.length,
      students,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "COLLEGE_ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden: Only institutional administrators can add student records" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Ensure correct institution scope for College Admins
    if (session.role === "COLLEGE_ADMIN") {
      body.institutionId = session.institutionId || body.institutionId || "inst-dit-001";
      if (session.institutionName) {
        body.institutionName = session.institutionName;
      }
    }

    // Verify institution scope
    if (session.role !== "SUPER_ADMIN" && body.institutionId !== session.institutionId && session.institutionId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot create student records for another institution" },
        { status: 403 }
      );
    }

    const result = createStudent(body, {
      email: session.email,
      role: session.role,
      name: session.name,
    });

    return NextResponse.json(
      {
        success: true,
        student: result.student,
        duplicateAlerts: result.duplicateAlerts,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create student" }, { status: 500 });
  }
}
