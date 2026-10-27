import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { DashboardNav } from "@/components/dashboard-nav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <DashboardNav session={session}>
        {children}
      </DashboardNav>
    </div>
  );
}
