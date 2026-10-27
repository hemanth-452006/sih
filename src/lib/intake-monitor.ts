import { ApprovedIntake, StudentRecord } from "./types";

export interface IntakeCalculation {
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
  status: "NORMAL" | "NEAR_CAPACITY" | "CAPACITY_FULL" | "OVER_INTAKE_ALERT";
  alertMessage?: string;
}

/**
 * Calculates live intake statistics from student records against configured approved quotas
 */
export function calculateIntakeStatus(
  configuredIntakes: ApprovedIntake[],
  students: StudentRecord[],
  institutionId?: string
): IntakeCalculation[] {
  return configuredIntakes
    .filter((intake) => !institutionId || intake.institutionId === institutionId)
    .map((intake) => {
      // Count active students in this course and academic admission year
      const enrolledStudents = students.filter((s) => {
        const matchInst = s.institutionId === intake.institutionId;
        const matchCourse = s.courseId === intake.courseId;
        const matchYear = s.academicYear === intake.academicYear || String(s.admissionYear) === intake.academicYear.split("-")[0];
        const isActive = s.enrollmentStatus === "ACTIVE";
        return matchInst && matchCourse && matchYear && isActive && !s.isArchived;
      });

      const currentEnrolled = enrolledStudents.length;
      const approvedCount = intake.approvedCount;
      const availableCapacity = Math.max(0, approvedCount - currentEnrolled);
      const utilizationPercentage = approvedCount > 0 ? Math.round((currentEnrolled / approvedCount) * 100) : 0;
      const isExceeded = currentEnrolled > approvedCount;
      const exceededBy = isExceeded ? currentEnrolled - approvedCount : 0;

      let status: "NORMAL" | "NEAR_CAPACITY" | "CAPACITY_FULL" | "OVER_INTAKE_ALERT" = "NORMAL";
      let alertMessage: string | undefined = undefined;

      if (isExceeded) {
        status = "OVER_INTAKE_ALERT";
        alertMessage = `Intake Quota Exceeded: Recorded admissions (${currentEnrolled}) exceed AICTE approved capacity (${approvedCount}) by ${exceededBy} seats. (Data Discrepancy Alert: Pending official institution verification).`;
      } else if (utilizationPercentage === 100) {
        status = "CAPACITY_FULL";
        alertMessage = "Sanctioned intake capacity is 100% filled.";
      } else if (utilizationPercentage >= 90) {
        status = "NEAR_CAPACITY";
        alertMessage = `Seat occupancy at ${utilizationPercentage}%. Only ${availableCapacity} seat(s) remaining.`;
      }

      return {
        courseId: intake.courseId,
        courseName: intake.courseName,
        departmentName: intake.departmentName,
        academicYear: intake.academicYear,
        approvedCount,
        currentEnrolled,
        availableCapacity,
        utilizationPercentage,
        isExceeded,
        exceededBy,
        status,
        alertMessage,
      };
    });
}
