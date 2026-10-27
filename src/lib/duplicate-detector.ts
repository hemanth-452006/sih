import { StudentRecord, DuplicateAlert, DuplicateMatchType } from "./types";
import { validateApaarFormat } from "./apaar-security";

// Levenshtein distance calculation
export function calculateLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  const lenA = a.length;
  const lenB = b.length;

  for (let i = 0; i <= lenA; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= lenB; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[lenA][lenB];
}

// String similarity metric (0 to 1)
export function calculateSimilarity(s1: string, s2: string): number {
  const norm1 = s1.trim().toLowerCase();
  const norm2 = s2.trim().toLowerCase();
  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;

  const maxLen = Math.max(norm1.length, norm2.length);
  const distance = calculateLevenshteinDistance(norm1, norm2);
  return 1 - distance / maxLen;
}

export interface DuplicateDetectionResult {
  hasDuplicate: boolean;
  matchType?: DuplicateMatchType;
  confidence: number;
  matchingFields: string[];
  reason: string;
  recommendedAction: string;
  matchedStudent?: StudentRecord;
  isCrossInstitution: boolean;
}

/**
 * Compares candidate student against a database of existing students
 */
export function checkDuplicateRecord(
  candidate: Partial<StudentRecord>,
  existingStudents: StudentRecord[]
): DuplicateDetectionResult[] {
  const results: DuplicateDetectionResult[] = [];

  const candidateApaarNorm = candidate.apaarId
    ? validateApaarFormat(candidate.apaarId).normalized
    : "";

  const candidateInternalId = candidate.internalId?.trim().toUpperCase() || "";
  const candidateFullName = `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim().toLowerCase();
  const candidateDob = candidate.dateOfBirth?.split("T")[0] || "";

  for (const existing of existingStudents) {
    // Ignore comparing against self
    if (candidate.id && existing.id === candidate.id) continue;

    const existingApaarNorm = existing.apaarId
      ? validateApaarFormat(existing.apaarId).normalized
      : "";
    const existingInternalId = existing.internalId.trim().toUpperCase();
    const existingFullName = `${existing.firstName} ${existing.lastName}`.trim().toLowerCase();
    const existingDob = existing.dateOfBirth?.split("T")[0] || "";

    const isDifferentInstitution = Boolean(candidate.institutionId && existing.institutionId !== candidate.institutionId);

    // 1. EXACT APAAR MATCH
    if (candidateApaarNorm && existingApaarNorm && candidateApaarNorm === existingApaarNorm) {
      if (isDifferentInstitution && existing.enrollmentStatus === "ACTIVE" && candidate.enrollmentStatus === "ACTIVE") {
        results.push({
          hasDuplicate: true,
          matchType: "CROSS_INSTITUTION_CONFLICT",
          confidence: 99.9,
          matchingFields: ["apaarId", "nationalId"],
          reason: `Cross-Institution Enrolment Conflict: Student APAAR ID ${candidate.apaarId} is concurrently registered in active status at "${existing.institutionName}" (${existing.courseName}). Dual full-time enrollment breaches standard AICTE regulatory norms.`,
          recommendedAction: "Escalate to AICTE State Nodal Officer & Request Enrolment Clearance Certificate (ECC).",
          matchedStudent: existing,
          isCrossInstitution: true,
        });
      } else {
        results.push({
          hasDuplicate: true,
          matchType: "EXACT_APAAR",
          confidence: 100,
          matchingFields: ["apaarId"],
          reason: `Exact APAAR ID Match: The 12-digit APAAR ID matches existing student "${existing.firstName} ${existing.lastName}" (${existing.internalId}).`,
          recommendedAction: "Verify if this is a re-admission, duplicate entry, or transfer record before approval.",
          matchedStudent: existing,
          isCrossInstitution: isDifferentInstitution,
        });
      }
      continue;
    }

    // 2. EXACT INTERNAL INSTITUTIONAL ID MATCH (Within Same Institution)
    if (!isDifferentInstitution && candidateInternalId && candidateInternalId === existingInternalId) {
      results.push({
        hasDuplicate: true,
        matchType: "EXACT_INTERNAL_ID",
        confidence: 100,
        matchingFields: ["internalId"],
        reason: `Duplicate Internal Student ID: Roll / Registration number "${candidateInternalId}" already assigned to "${existing.firstName} ${existing.lastName}".`,
        recommendedAction: "Assign a unique institutional Roll / Enrolment ID.",
        matchedStudent: existing,
        isCrossInstitution: false,
      });
      continue;
    }

    // 3. EXACT NAME + DATE OF BIRTH COMPARISON
    const isSameDob = candidateDob && existingDob && candidateDob === existingDob;
    const nameSim = calculateSimilarity(candidateFullName, existingFullName);

    if (isSameDob && nameSim >= 0.9) {
      const matchType: DuplicateMatchType = isDifferentInstitution ? "CROSS_INSTITUTION_CONFLICT" : "NAME_DOB";
      results.push({
        hasDuplicate: true,
        matchType,
        confidence: Math.round(nameSim * 95),
        matchingFields: ["fullName", "dateOfBirth"],
        reason: isDifferentInstitution
          ? `Potential Cross-Institutional Enrolment: High identity match on full name ("${existing.firstName} ${existing.lastName}") and identical Date of Birth (${existingDob}) at another institution ("${existing.institutionName}").`
          : `Identity Match: Identical Date of Birth and high name match with existing record "${existing.firstName} ${existing.lastName}".`,
        recommendedAction: "Requires manual inspection by Verification Officer against original 10th/12th Marks Sheet.",
        matchedStudent: existing,
        isCrossInstitution: isDifferentInstitution,
      });
      continue;
    }

    // 4. FUZZY NAME SIMILARITY (Within same institution and course/year)
    if (
      !isDifferentInstitution &&
      candidate.departmentId === existing.departmentId &&
      nameSim >= 0.85 &&
      nameSim < 1.0
    ) {
      results.push({
        hasDuplicate: true,
        matchType: "FUZZY_NAME",
        confidence: Math.round(nameSim * 100),
        matchingFields: ["nameSimilarity"],
        reason: `Potential Spelling Variation: Candidate name "${candidate.firstName} ${candidate.lastName}" is ${(nameSim * 100).toFixed(1)}% similar to "${existing.firstName} ${existing.lastName}".`,
        recommendedAction: "Candidate for verification review. Do not merge automatically without identity proof.",
        matchedStudent: existing,
        isCrossInstitution: false,
      });
    }
  }

  return results;
}
