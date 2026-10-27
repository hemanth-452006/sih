import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { getAllStudents, getAllInstitutions } from "@/lib/db-store";
import { validateApaarFormat } from "@/lib/apaar-security";
import { checkDuplicateRecord } from "@/lib/duplicate-detector";
import { RowValidationResult, StudentRecord } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "COLLEGE_ADMIN")) {
      return NextResponse.json({ error: "Forbidden: Only administrators can import records" }, { status: 403 });
    }

    const body = await req.json();
    const { rows, columnMapping, institutionId: reqInstId } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No data rows provided" }, { status: 400 });
    }

    const institutionId = session.role === "SUPER_ADMIN" ? reqInstId || session.institutionId : session.institutionId;
    const existingStudents = getAllStudents({ includeArchived: true });
    const institutions = getAllInstitutions();
    const currentInst = institutions.find((i) => i.id === institutionId) || institutions[0];

    const validationResults: RowValidationResult[] = [];
    let validCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    let conflictCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const rawRow = rows[i];
      const rowNum = i + 1;
      const errors: { field: string; message: string }[] = [];

      // Map raw columns to canonical fields
      const studentData: Partial<StudentRecord> = {
        internalId: (rawRow[columnMapping?.internalId || "RollNumber"] || rawRow["InternalID"] || "").trim(),
        apaarId: (rawRow[columnMapping?.apaarId || "APAAR_ID"] || rawRow["APAAR"] || "").trim(),
        firstName: (rawRow[columnMapping?.firstName || "FirstName"] || "").trim(),
        lastName: (rawRow[columnMapping?.lastName || "LastName"] || "").trim(),
        dateOfBirth: (rawRow[columnMapping?.dateOfBirth || "DOB"] || "").trim(),
        gender: (rawRow[columnMapping?.gender || "Gender"] || "Other").trim(),
        email: (rawRow[columnMapping?.email || "Email"] || "").trim(),
        phone: (rawRow[columnMapping?.phone || "Phone"] || "").trim(),
        departmentName: (rawRow[columnMapping?.department || "Department"] || "Computer Science & Engineering").trim(),
        courseName: (rawRow[columnMapping?.course || "Course"] || "B.Tech in Computer Science and Engineering").trim(),
        academicYear: (rawRow[columnMapping?.academicYear || "AcademicYear"] || "2024-2025").trim(),
        admissionYear: parseInt(rawRow[columnMapping?.admissionYear || "AdmissionYear"] || "2024", 10),
        semester: parseInt(rawRow[columnMapping?.semester || "Semester"] || "1", 10),
        institutionId: currentInst.id,
        institutionName: currentInst.name,
        institutionCode: currentInst.code,
        enrollmentStatus: "ACTIVE",
      };

      // 1. Required Field Validations
      if (!studentData.internalId) {
        errors.push({ field: "internalId", message: "Internal Student Roll/ID is required" });
      }
      if (!studentData.firstName) {
        errors.push({ field: "firstName", message: "First name is required" });
      }
      if (!studentData.dateOfBirth) {
        errors.push({ field: "dateOfBirth", message: "Date of Birth (YYYY-MM-DD) is required" });
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(studentData.dateOfBirth)) {
        errors.push({ field: "dateOfBirth", message: "Invalid Date format. Must be YYYY-MM-DD" });
      }

      if (studentData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentData.email)) {
        errors.push({ field: "email", message: "Invalid email address syntax" });
      }

      // 2. APAAR Format Validation
      if (studentData.apaarId) {
        const apaarCheck = validateApaarFormat(studentData.apaarId);
        if (!apaarCheck.isValid) {
          errors.push({ field: "apaarId", message: apaarCheck.error || "Invalid APAAR format" });
        }
      }

      // 3. Duplicate Detection against existing DB
      let isDuplicate = false;
      let duplicateDetails: string | undefined = undefined;
      let isConflict = false;
      let conflictDetails: string | undefined = undefined;

      const dupMatches = checkDuplicateRecord(studentData, existingStudents);
      if (dupMatches.length > 0) {
        const conflictMatch = dupMatches.find((m) => m.matchType === "CROSS_INSTITUTION_CONFLICT");
        if (conflictMatch) {
          isConflict = true;
          conflictDetails = conflictMatch.reason;
          conflictCount++;
        } else {
          isDuplicate = true;
          duplicateDetails = dupMatches[0].reason;
          duplicateCount++;
        }
      }

      // Also check against earlier rows in the current batch
      const duplicateInBatch = validationResults.find(
        (prev) =>
          prev.data.internalId === studentData.internalId ||
          (studentData.apaarId && prev.data.apaarId === studentData.apaarId)
      );

      if (duplicateInBatch) {
        isDuplicate = true;
        duplicateDetails = `Duplicate within this spreadsheet batch: Matches row #${duplicateInBatch.rowNumber}`;
        duplicateCount++;
      }

      const isValid = errors.length === 0 && !isDuplicate && !isConflict;
      if (isValid) validCount++;
      else errorCount++;

      validationResults.push({
        rowNumber: rowNum,
        data: studentData,
        isValid,
        errors,
        isDuplicate,
        duplicateDetails,
        isConflict,
        conflictDetails,
      });
    }

    return NextResponse.json({
      summary: {
        totalRows: rows.length,
        validCount,
        errorCount,
        duplicateCount,
        conflictCount,
        canImport: validCount > 0,
      },
      results: validationResults,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Validation failed" }, { status: 500 });
  }
}
