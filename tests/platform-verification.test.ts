import { validateApaarFormat, generateApaarFingerprint, maskApaarId, sanitizeForCsvExport } from "../src/lib/apaar-security";
import { checkDuplicateRecord, calculateSimilarity, calculateLevenshteinDistance } from "../src/lib/duplicate-detector";
import { calculateIntakeStatus } from "../src/lib/intake-monitor";
import { StudentRecord, ApprovedIntake } from "../src/lib/types";

// ─── 1. Security & APAAR Cryptographic Tests ─────────────────────────

console.log("=== RUNNING APAAR VERIFY PLATFORM AUTOMATED TEST SUITE ===\n");

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failedCount++;
  }
}

// Test 1: APAAR Format Validation
const validCheck = validateApaarFormat("9000-0000-1001");
assert(validCheck.isValid && validCheck.normalized === "900000001001", "Valid 12-digit APAAR format accepted and normalized");

const invalidShort = validateApaarFormat("12345");
assert(!invalidShort.isValid, "Malformed short APAAR ID rejected");

const invalidRepeating = validateApaarFormat("1111-1111-1111");
assert(!invalidRepeating.isValid, "Degenerate repeating sequence rejected");

// Test 2: Masking
const masked = maskApaarId("9000-0000-1001");
assert(masked === "••••-••••-1001", "Sensitive identifier masked to last 4 digits");

// Test 3: Keyed HMAC Fingerprinting
const hmac1 = generateApaarFingerprint("9000-0000-1001");
const hmac2 = generateApaarFingerprint("900000001001");
assert(hmac1 === hmac2 && hmac1.length === 64, "Keyed HMAC-SHA256 fingerprint is deterministic and normalized");

// Test 4: CSV Formula Injection Protection
const rawFormula = "=cmd|' /C calc'!A0";
const sanitized = sanitizeForCsvExport(rawFormula);
assert(sanitized.startsWith("'="), "Formula injection neutralized with single-quote prefix");

// ─── 2. Duplicate Detection Engine Tests ──────────────────────────────

const existingDatabase: StudentRecord[] = [
  {
    id: "stu-1",
    internalId: "DIT-2024-001",
    apaarId: "9000-0000-1001",
    apaarIdHash: generateApaarFingerprint("9000-0000-1001"),
    firstName: "Rahul",
    lastName: "Sharma",
    fullName: "Rahul Sharma",
    dateOfBirth: "2005-04-12",
    gender: "Male",
    email: "rahul@dit.edu.in",
    phone: "+91 98765 43210",
    guardianName: "Sunil Sharma",
    guardianPhone: "+91 98765 43211",
    address: "New Delhi",
    institutionId: "inst-dit-001",
    institutionName: "Delhi Institute of Technology",
    institutionCode: "AICTE-ND-001",
    departmentId: "dept-cse",
    departmentName: "Computer Science",
    courseId: "course-cse",
    courseName: "B.Tech CSE",
    academicYear: "2024-2025",
    admissionYear: 2024,
    semester: 1,
    enrollmentStatus: "ACTIVE",
    verificationStatus: "VERIFIED",
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hasDocument: true,
  },
];

// Test 5: Exact Duplicate Match
const candidateExact: Partial<StudentRecord> = {
  internalId: "DIT-2024-999",
  apaarId: "9000-0000-1001", // Matches stu-1
  firstName: "Rahul",
  lastName: "Sharma",
  institutionId: "inst-dit-001",
  enrollmentStatus: "ACTIVE",
};
const dupExact = checkDuplicateRecord(candidateExact, existingDatabase);
assert(
  dupExact.length > 0 && dupExact[0].matchType === "EXACT_APAAR",
  "Exact 12-digit APAAR duplication detected with 100% confidence"
);

// Test 6: Cross-Institution Dual-Enrollment Conflict
const candidateCrossInst: Partial<StudentRecord> = {
  internalId: "BCE-2024-777",
  apaarId: "9000-0000-1001", // Same APAAR ID but different college!
  firstName: "Rahul",
  lastName: "Sharma",
  institutionId: "inst-bce-002", // Different institution!
  institutionName: "Bengaluru College of Engineering",
  enrollmentStatus: "ACTIVE",
};
const conflictDups = checkDuplicateRecord(candidateCrossInst, existingDatabase);
assert(
  conflictDups.some((d) => d.matchType === "CROSS_INSTITUTION_CONFLICT"),
  "Cross-institution dual full-time enrolment conflict flagged"
);

// Test 7: Fuzzy Name Similarity
const simScore = calculateSimilarity("Kavya Natarajan", "Kavyaa Natarajan");
assert(simScore > 0.9, `Fuzzy spelling similarity scored high: ${(simScore * 100).toFixed(1)}%`);

// ─── 3. Approved Intake Monitoring Tests ──────────────────────────────

const configuredIntakes: ApprovedIntake[] = [
  {
    id: "intake-1",
    institutionId: "inst-dit-001",
    courseId: "course-cse",
    courseName: "B.Tech CSE",
    departmentName: "Computer Science",
    academicYear: "2024-2025",
    approvedCount: 1, // Only 1 seat allowed
    currentEnrolled: 0,
    availableCapacity: 0,
    utilizationPercentage: 0,
    isExceeded: false,
    exceededBy: 0,
  },
];

// 1 student enrolled against 1 approved seat
const calcNormal = calculateIntakeStatus(configuredIntakes, existingDatabase, "inst-dit-001");
assert(
  calcNormal[0].currentEnrolled === 1 && calcNormal[0].utilizationPercentage === 100 && !calcNormal[0].isExceeded,
  "Intake capacity correctly calculated at 100% capacity"
);

// Add a 2nd student to trigger intake quota overflow alert
const databaseWithOverIntake: StudentRecord[] = [
  ...existingDatabase,
  {
    ...existingDatabase[0],
    id: "stu-2",
    internalId: "DIT-2024-002",
    apaarId: "9000-0000-1002",
  },
];
const calcOverflow = calculateIntakeStatus(configuredIntakes, databaseWithOverIntake, "inst-dit-001");
assert(
  calcOverflow[0].isExceeded && calcOverflow[0].exceededBy === 1 && calcOverflow[0].status === "OVER_INTAKE_ALERT",
  "Admissions exceeding approved quota automatically trigger OVER_INTAKE_ALERT"
);

console.log(`\n=== TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED ===\n`);

if (failedCount > 0) {
  process.exit(1);
}
