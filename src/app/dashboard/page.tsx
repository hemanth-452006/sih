import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "SUPER_ADMIN") {
    redirect("/dashboard/aicte");
  } else if (session.role === "COLLEGE_ADMIN") {
    redirect("/dashboard/college");
  } else if (session.role === "FACULTY") {
    redirect("/dashboard/verification");
  } else if (session.role === "STUDENT") {
    redirect("/dashboard/student-portal");
  }

  redirect("/dashboard/students");
}
