export type Role = "SUPER_ADMIN" | "COLLEGE_ADMIN" | "FACULTY" | "STUDENT";

export type EnrollmentStatus = "ACTIVE" | "INACTIVE" | "GRADUATED" | "DROPPED" | "TRANSFERRED";

export type VerificationStatus =
  | "NOT_SUBMITTED"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED"
  | "NEEDS_CORRECTION"
  | "CONFLICT_DETECTED";

export type DuplicateMatchType =
  | "EXACT_APAAR"
  | "EXACT_INTERNAL_ID"
  | "NAME_DOB"
  | "FUZZY_NAME"
  | "CROSS_INSTITUTION_CONFLICT";

export interface StudentRecord {
  id: string;
  internalId: string;
  apaarId: string; // Stored securely/masked in displays
  apaarIdHash: string; // HMAC fingerprint for search
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: "Male" | "Female" | "Other";
  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  institutionId: string;
  institutionName: string;
  institutionCode: string;
  departmentId: string;
  departmentName: string;
  courseId: string;
  courseName: string;
  academicYear: string;
  admissionYear: number;
  semester: number;
  enrollmentStatus: EnrollmentStatus;
  verificationStatus: VerificationStatus;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  hasDocument: boolean;
  documentType?: string;
  verificationNotes?: string;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  state: string;
  district: string;
  address: string;
  website: string;
  email: string;
  phone: string;
  status: "APPROVED" | "PENDING" | "SUSPENDED" | "REJECTED";
  approvedAt?: string;
  suspendedAt?: string;
  rejectionReason?: string;
  departments: Department[];
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  institutionId: string;
  courses: Course[];
}

export interface Course {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  duration: number; // years
  level: "UG" | "PG" | "DIPLOMA" | "PHD";
}

export interface ApprovedIntake {
  id: string;
  institutionId: string;
  courseId: string;
  courseName: string;
  departmentName: string;
  academicYear: string;
  approvedCount: number;
  currentEnrolled: number;
  availableCapacity: number;
  utilizationPercentage: number;
  isExceeded: boolean;
  exceededBy: number;
}

export interface DuplicateAlert {
  id: string;
  student1Id: string;
  student1Name: string;
  student1InternalId: string;
  student1Institution: string;
  student1Status: string;
  student2Id: string;
  student2Name: string;
  student2InternalId: string;
  student2Institution: string;
  student2Status: string;
  matchType: DuplicateMatchType;
  confidence: number; // 0 - 100%
  matchingFields: string[];
  reason: string;
  recommendedAction: string;
  status: "PENDING" | "CONFIRMED" | "DISMISSED" | "MERGED";
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

export interface VerificationRequestItem {
  id: string;
  studentId: string;
  studentName: string;
  internalId: string;
  apaarIdMasked: string;
  institutionName: string;
  courseName: string;
  requestedAt: string;
  status: VerificationStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  localValidationResults: {
    formatCheck: boolean;
    duplicateCheck: boolean;
    intakeCompliance: boolean;
    documentIntegrity: boolean;
    flags: string[];
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: Role;
  actorName: string;
  action: "LOGIN" | "LOGOUT" | "CREATE" | "UPDATE" | "ARCHIVE" | "RESTORE" | "VERIFY" | "REJECT" | "IMPORT" | "EXPORT" | "SUSPEND" | "APPROVE";
  resource: "STUDENT" | "INSTITUTION" | "VERIFICATION" | "IMPORT" | "INTAKE" | "USER";
  resourceId?: string;
  institutionId?: string;
  institutionName?: string;
  details: string;
  outcome: "SUCCESS" | "FAILURE" | "DENIED";
  ipAddress: string;
}

export interface CorrectionRequest {
  id: string;
  studentId: string;
  studentName: string;
  field: string;
  currentValue: string;
  requestedValue: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedBy: string;
  requestedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: string;
}

export interface ImportPreviewRow {
  rowNumber: number;
  data: Record<string, string>;
  isValid: boolean;
  errors: { field: string; message: string }[];
  isDuplicate: boolean;
  duplicateReason?: string;
  duplicateDetails?: string;
  isConflict?: boolean;
  conflictDetails?: string;
}

export interface RowValidationResult {
  rowNumber: number;
  data: Record<string, unknown>;
  isValid: boolean;
  errors: { field: string; message: string }[];
  isDuplicate: boolean;
  duplicateDetails?: string;
  isConflict: boolean;
  conflictDetails?: string;
}

export interface ImportJobSummary {
  id: string;
  fileName: string;
  fileSize: number;
  totalRows: number;
  validRows: number;
  errorRows: number;
  duplicateRows: number;
  importedRows: number;
  status: "VALIDATING" | "VALIDATED" | "COMPLETED" | "FAILED";
  createdAt: string;
  completedAt?: string;
}
