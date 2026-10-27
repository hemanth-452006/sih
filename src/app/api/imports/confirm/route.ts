import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { createStudent } from "@/lib/db-store";
import { recordAuditEvent } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "COLLEGE_ADMIN")) {
      return NextResponse.json({ error: "Forbidden: Import privileges required" }, { status: 403 });
    }

    const body = await req.json();
    const { validRows, fileName } = body;

    if (!Array.isArray(validRows) || validRows.length === 0) {
      return NextResponse.json({ error: "No valid rows to import" }, { status: 400 });
    }

    let importedCount = 0;
    const generatedAlertsCount = 0;

    for (const row of validRows) {
      const data = row.data;
      createStudent(
        {
          internalId: data.internalId,
          apaarId: data.apaarId || undefined,
          firstName: data.firstName,
          lastName: data.lastName || "",
          dateOfBirth: data.dateOfBirth,
          gender: data.gender || "Other",
          email: data.email || `${data.internalId.toLowerCase()}@student.inst.edu.in`,
          phone: data.phone || "+91 99999 00000",
          guardianName: data.guardianName || "Guardian",
          guardianPhone: data.guardianPhone || "+91 99999 00001",
          address: data.address || "Campus Address",
          institutionId: data.institutionId || session.institutionId || "inst-dit-001",
          institutionName: data.institutionName || session.institutionName || "Delhi Institute of Technology",
          institutionCode: data.institutionCode || "AICTE-ND-001",
          departmentId: data.departmentId || "dept-cse",
          departmentName: data.departmentName || "Computer Science & Engineering",
          courseId: data.courseId || "course-btech-cse",
          courseName: data.courseName || "B.Tech in Computer Science and Engineering",
          academicYear: data.academicYear || "2024-2025",
          admissionYear: data.admissionYear || 2024,
          semester: data.semester || 1,
          enrollmentStatus: "ACTIVE",
          verificationStatus: "PENDING_VERIFICATION",
          isArchived: false,
          hasDocument: true,
          documentType: "Bulk Institutional Upload Batch",
        },
        {
          email: session.email,
          role: session.role,
          name: session.name,
        }
      );
      importedCount++;
    }

    recordAuditEvent({
      actorEmail: session.email,
      actorRole: session.role,
      actorName: session.name,
      action: "IMPORT",
      resource: "IMPORT",
      institutionId: session.institutionId,
      institutionName: session.institutionName,
      details: `Bulk Import Completed: Successfully imported ${importedCount} student records from file "${fileName || "spreadsheet.csv"}".`,
    });

    return NextResponse.json({
      success: true,
      importedCount,
      alertsTriggered: generatedAlertsCount,
      message: `Successfully imported ${importedCount} student records.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Import execution failed" }, { status: 500 });
  }
}
