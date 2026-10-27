import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { getAllStudents, getDuplicateAlerts, getIntakeData, getAllInstitutions } from "@/lib/db-store";
import { getAuditLogs, recordAuditEvent } from "@/lib/audit";
import { sanitizeForCsvExport, maskApaarId } from "@/lib/apaar-security";

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "COLLEGE_ADMIN")) {
      return NextResponse.json({ error: "Forbidden: Export privileges required" }, { status: 403 });
    }

    const body = await req.json();
    const { reportType } = body;

    let headers: string[] = [];
    let rows: string[][] = [];
    let fileName = `report-${Date.now()}.csv`;

    const institutionId = session.role === "SUPER_ADMIN" ? undefined : session.institutionId;

    if (reportType === "STUDENT_ENROLMENT" || !reportType) {
      fileName = `Student_Enrolment_Report_${Date.now()}.csv`;
      headers = [
        "Internal ID",
        "APAAR ID (Masked)",
        "Student Name",
        "Gender",
        "Date of Birth",
        "Institution",
        "Department",
        "Course",
        "Academic Year",
        "Enrollment Status",
        "Verification Status",
      ];

      const students = getAllStudents({ institutionId });
      rows = students.map((s) => [
        sanitizeForCsvExport(s.internalId),
        sanitizeForCsvExport(maskApaarId(s.apaarId)),
        sanitizeForCsvExport(s.fullName),
        sanitizeForCsvExport(s.gender),
        sanitizeForCsvExport(s.dateOfBirth),
        sanitizeForCsvExport(s.institutionName),
        sanitizeForCsvExport(s.departmentName),
        sanitizeForCsvExport(s.courseName),
        sanitizeForCsvExport(s.academicYear),
        sanitizeForCsvExport(s.enrollmentStatus),
        sanitizeForCsvExport(s.verificationStatus),
      ]);
    } else if (reportType === "DUPLICATES") {
      fileName = `Duplicate_Alerts_Report_${Date.now()}.csv`;
      headers = [
        "Alert ID",
        "Match Type",
        "Confidence (%)",
        "Student 1 ID",
        "Student 1 Name",
        "Institution 1",
        "Student 2 ID",
        "Student 2 Name",
        "Institution 2",
        "Reason",
        "Status",
      ];

      const alerts = getDuplicateAlerts({ institutionId });
      rows = alerts.map((a) => [
        sanitizeForCsvExport(a.id),
        sanitizeForCsvExport(a.matchType),
        sanitizeForCsvExport(a.confidence.toString()),
        sanitizeForCsvExport(a.student1InternalId),
        sanitizeForCsvExport(a.student1Name),
        sanitizeForCsvExport(a.student1Institution),
        sanitizeForCsvExport(a.student2InternalId),
        sanitizeForCsvExport(a.student2Name),
        sanitizeForCsvExport(a.student2Institution),
        sanitizeForCsvExport(a.reason),
        sanitizeForCsvExport(a.status),
      ]);
    } else if (reportType === "INTAKE_UTILIZATION") {
      fileName = `Intake_Utilization_Report_${Date.now()}.csv`;
      headers = [
        "Course Name",
        "Department",
        "Academic Year",
        "Approved Intake Quota",
        "Current Recorded Admissions",
        "Available Capacity",
        "Utilization (%)",
        "Intake Exceeded?",
        "Status",
      ];

      const intakeData = getIntakeData(institutionId);
      rows = intakeData.map((i) => [
        sanitizeForCsvExport(i.courseName),
        sanitizeForCsvExport(i.departmentName),
        sanitizeForCsvExport(i.academicYear),
        sanitizeForCsvExport(i.approvedCount.toString()),
        sanitizeForCsvExport(i.currentEnrolled.toString()),
        sanitizeForCsvExport(i.availableCapacity.toString()),
        sanitizeForCsvExport(`${i.utilizationPercentage}%`),
        sanitizeForCsvExport(i.isExceeded ? `YES (+${i.exceededBy})` : "NO"),
        sanitizeForCsvExport(i.status),
      ]);
    } else if (reportType === "AUDIT_LOGS") {
      fileName = `Compliance_Audit_Log_${Date.now()}.csv`;
      headers = [
        "Timestamp (UTC)",
        "Actor Name",
        "Actor Email",
        "Role",
        "Action",
        "Resource",
        "Resource ID",
        "Outcome",
        "Details",
      ];

      const logs = getAuditLogs({ institutionId });
      rows = logs.map((l) => [
        sanitizeForCsvExport(l.timestamp),
        sanitizeForCsvExport(l.actorName),
        sanitizeForCsvExport(l.actorEmail),
        sanitizeForCsvExport(l.actorRole),
        sanitizeForCsvExport(l.action),
        sanitizeForCsvExport(l.resource),
        sanitizeForCsvExport(l.resourceId || ""),
        sanitizeForCsvExport(l.outcome),
        sanitizeForCsvExport(l.details),
      ]);
    }

    // Generate CSV string
    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\r\n");

    recordAuditEvent({
      actorEmail: session.email,
      actorRole: session.role,
      actorName: session.name,
      action: "EXPORT",
      resource: "STUDENT",
      institutionId: session.institutionId,
      details: `Generated CSV export report [${reportType || "STUDENT_ENROLMENT"}]. Total records exported: ${rows.length}.`,
    });

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
