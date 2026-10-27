import {
  StudentRecord,
  Institution,
  ApprovedIntake,
  DuplicateAlert,
  CorrectionRequest,
  AuditLogEntry,
  Role,
} from "./types";
import {
  INITIAL_INSTITUTIONS,
  INITIAL_STUDENTS,
  INITIAL_APPROVED_INTAKES,
  INITIAL_DUPLICATE_ALERTS,
  INITIAL_CORRECTION_REQUESTS,
  DEMO_USERS,
  DemoUser,
} from "./demo-data";
import { checkDuplicateRecord } from "./duplicate-detector";
import { calculateIntakeStatus } from "./intake-monitor";
import { recordAuditEvent, getAuditLogs } from "./audit";
import { generateSyntheticApaar, generateApaarFingerprint, maskApaarId } from "./apaar-security";

// Persistent global store for dev and demo runtime
interface MemoryStore {
  institutions: Institution[];
  students: StudentRecord[];
  approvedIntakes: ApprovedIntake[];
  duplicateAlerts: DuplicateAlert[];
  correctionRequests: CorrectionRequest[];
  users: DemoUser[];
  supportTickets: SupportTicket[];
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  institution: string;
  category: string;
  message: string;
  status: "OPEN";
  createdAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __APAAR_STORE__: MemoryStore | undefined;
}

function initStore(): MemoryStore {
  if (!globalThis.__APAAR_STORE__) {
    globalThis.__APAAR_STORE__ = {
      institutions: JSON.parse(JSON.stringify(INITIAL_INSTITUTIONS)),
      students: JSON.parse(JSON.stringify(INITIAL_STUDENTS)),
      approvedIntakes: JSON.parse(JSON.stringify(INITIAL_APPROVED_INTAKES)),
      duplicateAlerts: JSON.parse(JSON.stringify(INITIAL_DUPLICATE_ALERTS)),
      correctionRequests: JSON.parse(JSON.stringify(INITIAL_CORRECTION_REQUESTS)),
      users: JSON.parse(JSON.stringify(DEMO_USERS)),
      supportTickets: [],
    };
  }
  return globalThis.__APAAR_STORE__;
}

const store = initStore();

export function createSupportTicket(data: Omit<SupportTicket, "id" | "status" | "createdAt">): SupportTicket {
  const ticket: SupportTicket = {
    ...data,
    id: `TKT-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    status: "OPEN",
    createdAt: new Date().toISOString(),
  };
  store.supportTickets.unshift(ticket);
  return ticket;
}

// ─── Students Operations ──────────────────────────────────────────────

export function getAllStudents(filter?: {
  institutionId?: string;
  departmentId?: string;
  courseId?: string;
  academicYear?: string;
  status?: string;
  verificationStatus?: string;
  search?: string;
  includeArchived?: boolean;
}): StudentRecord[] {
  let list = [...store.students];

  if (!filter?.includeArchived) {
    list = list.filter((s) => !s.isArchived);
  }

  if (filter?.institutionId) {
    list = list.filter((s) => s.institutionId === filter.institutionId);
  }

  if (filter?.departmentId) {
    list = list.filter((s) => s.departmentId === filter.departmentId);
  }

  if (filter?.courseId) {
    list = list.filter((s) => s.courseId === filter.courseId);
  }

  if (filter?.academicYear) {
    list = list.filter((s) => s.academicYear === filter.academicYear);
  }

  if (filter?.status) {
    list = list.filter((s) => s.enrollmentStatus === filter.status);
  }

  if (filter?.verificationStatus) {
    list = list.filter((s) => s.verificationStatus === filter.verificationStatus);
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.internalId.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.apaarId && s.apaarId.includes(q))
    );
  }

  return list;
}

export function getStudentById(id: string): StudentRecord | undefined {
  return store.students.find((s) => s.id === id);
}

export function createStudent(
  data: Omit<StudentRecord, "id" | "fullName" | "apaarIdHash" | "createdAt" | "updatedAt">,
  actor: { email: string; role: Role; name: string }
): { student: StudentRecord; duplicateAlerts: DuplicateAlert[] } {
  const id = `stu-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const apaarIdHash = data.apaarId ? generateApaarFingerprint(data.apaarId) : "";

  const newStudent: StudentRecord = {
    ...data,
    id,
    fullName,
    apaarId: data.apaarId || "",
    guardianName: data.guardianName || "",
    guardianPhone: data.guardianPhone || "",
    address: data.address || "",
    isArchived: data.isArchived ?? false,
    hasDocument: data.hasDocument ?? false,
    apaarIdHash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Run duplicate detection before saving
  const dupCheck = checkDuplicateRecord(newStudent, store.students);

  const generatedAlerts: DuplicateAlert[] = [];
  if (dupCheck.length > 0) {
    for (const dup of dupCheck) {
      if (dup.matchedStudent) {
        const alert: DuplicateAlert = {
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          student1Id: newStudent.id,
          student1Name: newStudent.fullName,
          student1InternalId: newStudent.internalId,
          student1Institution: newStudent.institutionName,
          student1Status: newStudent.enrollmentStatus,
          student2Id: dup.matchedStudent.id,
          student2Name: dup.matchedStudent.fullName,
          student2InternalId: dup.matchedStudent.internalId,
          student2Institution: dup.matchedStudent.institutionName,
          student2Status: dup.matchedStudent.enrollmentStatus,
          matchType: dup.matchType || "EXACT_APAAR",
          confidence: dup.confidence,
          matchingFields: dup.matchingFields,
          reason: dup.reason,
          recommendedAction: dup.recommendedAction,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        };
        store.duplicateAlerts.unshift(alert);
        generatedAlerts.push(alert);
      }
    }

    if (dupCheck.some((d) => d.matchType === "CROSS_INSTITUTION_CONFLICT")) {
      newStudent.verificationStatus = "CONFLICT_DETECTED";
    }
  }

  store.students.unshift(newStudent);

  recordAuditEvent({
    actorEmail: actor.email,
    actorRole: actor.role,
    actorName: actor.name,
    action: "CREATE",
    resource: "STUDENT",
    resourceId: newStudent.id,
    institutionId: newStudent.institutionId,
    institutionName: newStudent.institutionName,
    details: `Created student record ${newStudent.fullName} (${newStudent.internalId}). Duplicate check found ${generatedAlerts.length} alert(s).`,
  });

  return { student: newStudent, duplicateAlerts: generatedAlerts };
}

export function updateStudent(
  id: string,
  updates: Partial<StudentRecord>,
  actor: { email: string; role: Role; name: string }
): StudentRecord | null {
  const index = store.students.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const current = store.students[index];
  const updated: StudentRecord = {
    ...current,
    ...updates,
    fullName:
      updates.firstName || updates.lastName
        ? `${updates.firstName ?? current.firstName} ${updates.lastName ?? current.lastName}`.trim()
        : current.fullName,
    updatedAt: new Date().toISOString(),
  };

  store.students[index] = updated;

  recordAuditEvent({
    actorEmail: actor.email,
    actorRole: actor.role,
    actorName: actor.name,
    action: "UPDATE",
    resource: "STUDENT",
    resourceId: id,
    institutionId: updated.institutionId,
    institutionName: updated.institutionName,
    details: `Updated student record ${updated.fullName} (${updated.internalId}). Changed fields: ${Object.keys(updates).join(", ")}.`,
  });

  return updated;
}

export function archiveStudent(
  id: string,
  actor: { email: string; role: Role; name: string }
): boolean {
  const student = store.students.find((s) => s.id === id);
  if (!student) return false;

  student.isArchived = true;
  student.updatedAt = new Date().toISOString();

  recordAuditEvent({
    actorEmail: actor.email,
    actorRole: actor.role,
    actorName: actor.name,
    action: "ARCHIVE",
    resource: "STUDENT",
    resourceId: id,
    institutionId: student.institutionId,
    institutionName: student.institutionName,
    details: `Archived student record ${student.fullName} (${student.internalId}).`,
  });

  return true;
}

export function restoreStudent(
  id: string,
  actor: { email: string; role: Role; name: string }
): boolean {
  const student = store.students.find((s) => s.id === id);
  if (!student) return false;

  student.isArchived = false;
  student.updatedAt = new Date().toISOString();

  recordAuditEvent({
    actorEmail: actor.email,
    actorRole: actor.role,
    actorName: actor.name,
    action: "RESTORE",
    resource: "STUDENT",
    resourceId: id,
    institutionId: student.institutionId,
    institutionName: student.institutionName,
    details: `Restored archived student record ${student.fullName} (${student.internalId}).`,
  });

  return true;
}

// ─── Verification Operations ──────────────────────────────────────────

export function submitVerificationDecision(
  studentId: string,
  decision: "VERIFIED" | "REJECTED" | "NEEDS_CORRECTION",
  notes: string,
  actor: { email: string; role: Role; name: string }
): StudentRecord | null {
  const student = store.students.find((s) => s.id === studentId);
  if (!student) return null;

  student.verificationStatus = decision;
  student.verificationNotes = notes;
  student.updatedAt = new Date().toISOString();

  recordAuditEvent({
    actorEmail: actor.email,
    actorRole: actor.role,
    actorName: actor.name,
    action: decision === "VERIFIED" ? "VERIFY" : "REJECT",
    resource: "VERIFICATION",
    resourceId: studentId,
    institutionId: student.institutionId,
    institutionName: student.institutionName,
    details: `Verification decision recorded for ${student.fullName} (${student.internalId}): [${decision}]. Notes: ${notes}`,
  });

  return student;
}

// ─── Duplicate Alerts Operations ──────────────────────────────────────

export function getDuplicateAlerts(filter?: {
  institutionId?: string;
  status?: string;
}): DuplicateAlert[] {
  let list = [...store.duplicateAlerts];
  if (filter?.status) {
    list = list.filter((a) => a.status === filter.status);
  }
  if (filter?.institutionId) {
    const institutionStudentIds = new Set(
      store.students
        .filter((s) => s.institutionId === filter.institutionId)
        .map((s) => s.id)
    );
    list = list.filter(
      (a) => institutionStudentIds.has(a.student1Id) || institutionStudentIds.has(a.student2Id)
    );
  }
  return list;
}

export function resolveDuplicateAlert(
  alertId: string,
  resolution: "CONFIRMED" | "DISMISSED" | "MERGED",
  notes: string,
  actor: { email: string; role: Role; name: string }
): boolean {
  const alert = store.duplicateAlerts.find((a) => a.id === alertId);
  if (!alert) return false;

  alert.status = resolution;
  alert.resolvedAt = new Date().toISOString();
  alert.resolvedBy = actor.name;
  alert.notes = notes;

  recordAuditEvent({
    actorEmail: actor.email,
    actorRole: actor.role,
    actorName: actor.name,
    action: "UPDATE",
    resource: "STUDENT",
    resourceId: alertId,
    details: `Resolved duplicate alert (${alertId}) as ${resolution}. Notes: ${notes}`,
  });

  return true;
}

// ─── Intake Operations ────────────────────────────────────────────────

export function getIntakeData(institutionId?: string) {
  return calculateIntakeStatus(store.approvedIntakes, store.students, institutionId);
}

export function updateApprovedIntake(
  courseId: string,
  academicYear: string,
  approvedCount: number,
  actor: { email: string; role: Role; name: string }
): boolean {
  const intake = store.approvedIntakes.find(
    (i) => i.courseId === courseId && i.academicYear === academicYear
  );
  if (!intake) return false;

  const oldCount = intake.approvedCount;
  intake.approvedCount = approvedCount;

  recordAuditEvent({
    actorEmail: actor.email,
    actorRole: actor.role,
    actorName: actor.name,
    action: "UPDATE",
    resource: "INTAKE",
    institutionId: intake.institutionId,
    details: `Updated approved intake for ${intake.courseName} (${academicYear}) from ${oldCount} to ${approvedCount} seats.`,
  });

  return true;
}

// ─── Institution Registry Operations ──────────────────────────────────

export function getAllInstitutions(): Institution[] {
  return store.institutions;
}

export function updateInstitutionStatus(
  institutionId: string,
  status: "APPROVED" | "SUSPENDED" | "REJECTED",
  reason: string,
  actor: { email: string; role: Role; name: string }
): boolean {
  const inst = store.institutions.find((i) => i.id === institutionId);
  if (!inst) return false;

  inst.status = status;
  if (status === "APPROVED") inst.approvedAt = new Date().toISOString();
  if (status === "SUSPENDED") inst.suspendedAt = new Date().toISOString();
  if (status === "REJECTED") inst.rejectionReason = reason;

  recordAuditEvent({
    actorEmail: actor.email,
    actorRole: actor.role,
    actorName: actor.name,
    action: status === "APPROVED" ? "APPROVE" : "SUSPEND",
    resource: "INSTITUTION",
    resourceId: institutionId,
    institutionId: institutionId,
    institutionName: inst.name,
    details: `Institution status updated to ${status}. Reason / Notes: ${reason}`,
  });

  return true;
}

// ─── Correction Requests ──────────────────────────────────────────────

export function getAllCorrectionRequests(filter?: {
  studentId?: string;
  status?: string;
}): CorrectionRequest[] {
  let list = [...store.correctionRequests];
  if (filter?.studentId) list = list.filter((c) => c.studentId === filter.studentId);
  if (filter?.status) list = list.filter((c) => c.status === filter.status);
  return list;
}

export function createCorrectionRequest(
  data: Omit<CorrectionRequest, "id" | "status" | "requestedAt">
): CorrectionRequest {
  const req: CorrectionRequest = {
    ...data,
    id: `cor-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    status: "PENDING",
    requestedAt: new Date().toISOString(),
  };

  store.correctionRequests.unshift(req);
  return req;
}

export function reviewCorrectionRequest(
  id: string,
  status: "APPROVED" | "REJECTED",
  reviewNotes: string,
  actor: { email: string; role: Role; name: string }
): boolean {
  const req = store.correctionRequests.find((c) => c.id === id);
  if (!req) return false;

  req.status = status;
  req.reviewedBy = actor.name;
  req.reviewNotes = reviewNotes;
  req.reviewedAt = new Date().toISOString();

  // If approved, update student record automatically
  if (status === "APPROVED") {
    const student = store.students.find((s) => s.id === req.studentId);
    if (student) {
      (student as any)[req.field] = req.requestedValue;
      student.updatedAt = new Date().toISOString();
    }
  }

  recordAuditEvent({
    actorEmail: actor.email,
    actorRole: actor.role,
    actorName: actor.name,
    action: "UPDATE",
    resource: "STUDENT",
    resourceId: req.studentId,
    details: `Correction request (${id}) ${status} for ${req.studentName} on field [${req.field}].`,
  });

  return true;
}

// ─── Analytics Aggregations ───────────────────────────────────────────

export function getAicteMetrics() {
  const totalInstitutions = store.institutions.length;
  const approvedInstitutions = store.institutions.filter((i) => i.status === "APPROVED").length;
  const pendingInstitutions = store.institutions.filter((i) => i.status === "PENDING").length;

  const allActiveStudents = store.students.filter((s) => !s.isArchived);
  const totalStudents = allActiveStudents.length;
  const verifiedCount = allActiveStudents.filter((s) => s.verificationStatus === "VERIFIED").length;
  const pendingVerification = allActiveStudents.filter(
    (s) => s.verificationStatus === "PENDING_VERIFICATION" || s.verificationStatus === "NOT_SUBMITTED"
  ).length;
  const rejectedCount = allActiveStudents.filter((s) => s.verificationStatus === "REJECTED").length;
  const needsCorrectionCount = allActiveStudents.filter(
    (s) => s.verificationStatus === "NEEDS_CORRECTION"
  ).length;
  const conflictCount = allActiveStudents.filter(
    (s) => s.verificationStatus === "CONFLICT_DETECTED"
  ).length;

  const intakeStats = getIntakeData();
  const institutionsExceedingIntake = intakeStats.filter((i) => i.isExceeded).length;
  const duplicateAlertsCount = store.duplicateAlerts.filter((a) => a.status === "PENDING").length;

  // State-wise distribution
  const stateDistribution: Record<string, number> = {};
  for (const inst of store.institutions) {
    const count = allActiveStudents.filter((s) => s.institutionId === inst.id).length;
    stateDistribution[inst.state] = (stateDistribution[inst.state] || 0) + count;
  }

  // Course distribution
  const courseDistribution: Record<string, number> = {};
  for (const s of allActiveStudents) {
    courseDistribution[s.courseName] = (courseDistribution[s.courseName] || 0) + 1;
  }

  return {
    totalInstitutions,
    approvedInstitutions,
    pendingInstitutions,
    totalStudents,
    verifiedCount,
    pendingVerification,
    rejectedCount,
    needsCorrectionCount,
    conflictCount,
    duplicateAlertsCount,
    institutionsExceedingIntake,
    stateDistribution: Object.entries(stateDistribution).map(([state, count]) => ({ state, count })),
    courseDistribution: Object.entries(courseDistribution).map(([course, count]) => ({
      course,
      count,
    })),
  };
}

export function getCollegeMetrics(institutionId: string) {
  const students = store.students.filter((s) => s.institutionId === institutionId && !s.isArchived);
  const totalStudents = students.length;
  const verified = students.filter((s) => s.verificationStatus === "VERIFIED").length;
  const pending = students.filter(
    (s) => s.verificationStatus === "PENDING_VERIFICATION" || s.verificationStatus === "NOT_SUBMITTED"
  ).length;
  const needsCorrection = students.filter((s) => s.verificationStatus === "NEEDS_CORRECTION").length;
  const conflicts = students.filter((s) => s.verificationStatus === "CONFLICT_DETECTED").length;
  const rejected = students.filter((s) => s.verificationStatus === "REJECTED").length;

  const intakeStats = getIntakeData(institutionId);
  const totalApprovedCapacity = intakeStats.reduce((sum, i) => sum + i.approvedCount, 0);
  const totalEnrolled = intakeStats.reduce((sum, i) => sum + i.currentEnrolled, 0);
  const intakeExceeded = intakeStats.some((i) => i.isExceeded);

  const deptCounts: Record<string, number> = {};
  for (const s of students) {
    deptCounts[s.departmentName] = (deptCounts[s.departmentName] || 0) + 1;
  }

  return {
    totalStudents,
    verified,
    pending,
    needsCorrection,
    conflicts,
    rejected,
    intakeStats,
    totalApprovedCapacity,
    totalEnrolled,
    intakeExceeded,
    departmentDistribution: Object.entries(deptCounts).map(([dept, count]) => ({ dept, count })),
  };
}
