"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Users,
  FileCheck,
  AlertTriangle,
  BarChart3,
  FileSpreadsheet,
  Building2,
  ScrollText,
  UserCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { UserSession } from "@/lib/session";
import { Button } from "./ui/button";

interface DashboardNavProps {
  session: UserSession;
  children: React.ReactNode;
}

export function DashboardNav({ session, children }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const role = session.role;

  const handleRoleSwitch = async (newRole: string) => {
    setSwitching(true);
    try {
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleSwitch: newRole }),
      });
      router.refresh();

      if (newRole === "SUPER_ADMIN") router.push("/dashboard/aicte");
      else if (newRole === "COLLEGE_ADMIN") router.push("/dashboard/college");
      else if (newRole === "FACULTY") router.push("/dashboard/verification");
      else if (newRole === "STUDENT") router.push("/dashboard/student-portal");
      else router.push("/dashboard");
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // Define navigation items with permitted roles
  const navItems = [
    {
      label: "AICTE Overview",
      href: "/dashboard/aicte",
      icon: LayoutDashboard,
      roles: ["SUPER_ADMIN"],
      badge: "Central",
    },
    {
      label: "College Dashboard",
      href: "/dashboard/college",
      icon: LayoutDashboard,
      roles: ["COLLEGE_ADMIN", "FACULTY"],
      badge: "College",
    },
    {
      label: "Student Portal",
      href: "/dashboard/student-portal",
      icon: UserCircle,
      roles: ["STUDENT"],
      badge: "Self",
    },
    {
      label: "Student Directory",
      href: "/dashboard/students",
      icon: Users,
      roles: ["SUPER_ADMIN", "COLLEGE_ADMIN", "FACULTY"],
    },
    {
      label: "APAAR Verification",
      href: "/dashboard/verification",
      icon: FileCheck,
      roles: ["SUPER_ADMIN", "COLLEGE_ADMIN", "FACULTY"],
      badge: "Officer",
    },
    {
      label: "Duplicate Engine",
      href: "/dashboard/duplicates",
      icon: AlertTriangle,
      roles: ["SUPER_ADMIN", "COLLEGE_ADMIN", "FACULTY"],
      highlight: true,
    },
    {
      label: "Intake Capacity",
      href: "/dashboard/intake",
      icon: BarChart3,
      roles: ["SUPER_ADMIN", "COLLEGE_ADMIN"],
    },
    {
      label: "Bulk Excel Wizard",
      href: "/dashboard/imports",
      icon: FileSpreadsheet,
      roles: ["SUPER_ADMIN", "COLLEGE_ADMIN"],
    },
    {
      label: "Reports & Analytics",
      href: "/dashboard/reports",
      icon: ScrollText,
      roles: ["SUPER_ADMIN", "COLLEGE_ADMIN"],
    },
    {
      label: "Institutions Registry",
      href: "/dashboard/institutions",
      icon: Building2,
      roles: ["SUPER_ADMIN"],
      badge: "AICTE Only",
    },
    {
      label: "Compliance Audit Logs",
      href: "/dashboard/audit",
      icon: ShieldCheck,
      roles: ["SUPER_ADMIN", "COLLEGE_ADMIN"],
    },
  ];

  const permittedItems = navItems.filter((item) => item.roles.includes(role));

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: "bg-blue-100 text-blue-800 border-blue-200",
    COLLEGE_ADMIN: "bg-emerald-100 text-emerald-800 border-emerald-200",
    FACULTY: "bg-amber-100 text-amber-800 border-amber-200",
    STUDENT: "bg-purple-100 text-purple-800 border-purple-200",
  };

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "AICTE Super Admin",
    COLLEGE_ADMIN: "College Administrator",
    FACULTY: "Verification Officer",
    STUDENT: "Student Account",
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Evaluator Quick Role Switcher Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs text-white">
        <div className="mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-300 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Demo Persona Switcher:
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              (Switch roles instantly to test server-side permissions)
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleRoleSwitch("SUPER_ADMIN")}
              disabled={switching}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                role === "SUPER_ADMIN"
                  ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              AICTE Admin
            </button>
            <button
              onClick={() => handleRoleSwitch("COLLEGE_ADMIN")}
              disabled={switching}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                role === "COLLEGE_ADMIN"
                  ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              College Admin (DIT)
            </button>
            <button
              onClick={() => handleRoleSwitch("FACULTY")}
              disabled={switching}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                role === "FACULTY"
                  ? "bg-amber-600 text-white shadow-sm ring-1 ring-amber-400"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Verification Officer
            </button>
            <button
              onClick={() => handleRoleSwitch("STUDENT")}
              disabled={switching}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                role === "STUDENT"
                  ? "bg-purple-600 text-white shadow-sm ring-1 ring-purple-400"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Student (Rahul)
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-900 text-white shadow-xs">
              <Shield className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-base leading-none">
                  APAAR <span className="text-blue-700">Verify</span>
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-semibold">
                  Dashboard
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                AICTE Regulatory Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Current User Session Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-right">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>{session.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                  roleColors[role] || "bg-slate-100"
                }`}
              >
                {roleLabels[role] || role}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[220px]">
              {session.institutionName || session.departmentName || session.email}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-xs text-slate-600 hover:text-red-700 hover:bg-red-50"
            title="Sign out"
          >
            <LogOut className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Workspace Body: Sidebar + Page Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-white p-4 space-y-6 shrink-0">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Workspace Navigation
            </div>
            <nav className="space-y-1">
              {permittedItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-800 font-bold shadow-xs border border-blue-100"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? "text-blue-700" : "text-slate-500"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1 px-3">
            <div className="flex items-center justify-between text-slate-600">
              <span>Environment:</span>
              <span className="font-semibold text-emerald-700">SIH-2026 Demo</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Data Isolation:</span>
              <span className="font-semibold text-blue-700">Active</span>
            </div>
            <div className="pt-2">
              <Link href="/" className="inline-flex items-center gap-1 text-blue-700 hover:underline">
                Public Landing Page <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <div className="relative w-72 max-w-[80%] bg-white p-4 flex flex-col space-y-4 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-900 text-sm">Navigation Menu</span>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              <nav className="space-y-1">
                {permittedItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium ${
                        isActive
                          ? "bg-blue-50 text-blue-800 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
