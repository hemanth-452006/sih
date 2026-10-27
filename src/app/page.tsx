import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileSpreadsheet,
  Users,
  Search,
  Lock,
  ArrowRight,
  Database,
  BarChart3,
  FileCheck,
  Cpu,
} from "lucide-react";
import { getAicteMetrics } from "@/lib/db-store";

export default function HomePage() {
  const metrics = getAicteMetrics();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white py-16 sm:py-24">
          {/* Subtle Grid Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              {/* Official AICTE Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-900/40 px-3.5 py-1 text-xs font-medium text-blue-200 mb-6 backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-amber-400" />
                Smart India Hackathon 2026 — Problem Statement Implementation
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                AICTE APAAR ID-Based Student Data Management &amp; Verification Platform
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                A unified, regulatory-grade platform for AICTE-approved institutions to validate student academic records, detect cross-institution duplicate enrolments, monitor approved intake limits, and maintain an immutable audit trail.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/login">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg font-semibold px-6">
                    Launch Platform
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button size="lg" variant="outline" className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 font-semibold px-6">
                    How Verification Works
                  </Button>
                </Link>
                <Link href="/register-institution">
                  <Button size="lg" variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 font-semibold px-6">
                    <Building2 className="h-4 w-4 mr-1.5" />
                    Register College
                  </Button>
                </Link>
              </div>

              {/* Security Pill */}
              <div className="mt-8 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" /> Keyed HMAC Fingerprinting
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" /> Role-Based Access Control
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-amber-400" /> DPDP Act 2023 Compliant
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Live Metrics Grid calculated dynamically from actual records */}
        <section className="relative -mt-8 z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-slate-200 bg-white shadow-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{metrics.totalInstitutions}</div>
                  <div className="text-xs font-medium text-slate-500">Registered Institutions</div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                    {metrics.approvedInstitutions} AICTE Approved
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{metrics.totalStudents}</div>
                  <div className="text-xs font-medium text-slate-500">Total Enrolled Records</div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                    {metrics.verifiedCount} Verified APAAR IDs
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{metrics.duplicateAlertsCount}</div>
                  <div className="text-xs font-medium text-slate-500">Duplicate / Conflict Alerts</div>
                  <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                    Cross-Institution Flagged
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="rounded-xl bg-purple-50 p-3 text-purple-700">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {metrics.institutionsExceedingIntake > 0 ? `${metrics.institutionsExceedingIntake} Alert` : "Compliant"}
                  </div>
                  <div className="text-xs font-medium text-slate-500">Sanctioned Intake Breaches</div>
                  <div className="text-[10px] text-purple-600 font-medium mt-0.5">
                    Capacity Monitored
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 4 Core Pillars */}
        <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Core Architectural Capabilities
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
              Engineered for Institutional Integrity &amp; Compliance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200 hover:border-blue-300 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Duplicate &amp; Dual-Enrollment Engine
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real backend detection supporting exact 12-digit normalized APAAR matching, internal roll ID uniqueness, normalized Name + Date of Birth comparisons, and cross-institutional dual-enrolment conflict alerts.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:border-blue-300 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Sanctioned Intake Capacity Monitor
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time comparison of recorded admissions against AICTE-approved intake limits by department, course, and academic year. Automatically triggers data-discrepancy alerts when enrolment exceeds quota.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:border-blue-300 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  9-Step Bulk Spreadsheet Wizard
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Safe ingestion of CSV and Excel sheets with column mapping, schema validation, row-by-row syntax checking, duplicate pre-scanning, downloadable error reports, and transactional imports.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Workflow Diagram Section */}
        <section className="bg-slate-100/70 border-y border-slate-200 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700">
                End-to-End Verification Lifecycle
              </h2>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
                How APAAR-Based Academic Verification Works
              </p>
            </div>

            {/* Workflow steps card */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    Step 1
                  </span>
                  <h4 className="mt-3 text-sm font-bold text-slate-900">College Data Submission</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    College Administrator uploads student records via 9-step spreadsheet wizard or manual single entry.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  Masked APAAR + Board Docs
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    Step 2
                  </span>
                  <h4 className="mt-3 text-sm font-bold text-slate-900">Cryptographic Lookup</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    System hashes the 12-digit identifier using HMAC-SHA256 with an isolated external secret salt key.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  Zero Plaintext Exposure
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    Step 3
                  </span>
                  <h4 className="mt-3 text-sm font-bold text-slate-900">Cross-Institution Duplicate Scan</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Engine cross-checks internal IDs, exact APAAR, and Name+DOB against other registered institutions.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  Dual Enrolment Prevention
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    Step 4
                  </span>
                  <h4 className="mt-3 text-sm font-bold text-slate-900">Officer Verification Review</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Assigned Verification Officer inspects local validation report, marks sheets, and issues decision.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  Verified / Rejected / Correction
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Step 5
                  </span>
                  <h4 className="mt-3 text-sm font-bold text-slate-900">Immutable Audit Trail</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    All decisions, timestamps, IP metadata, and state transitions are permanently logged into audit ledger.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  Tamper-Resistant Log
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 1-Click Role Switcher Demo Box */}
        <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 p-8 text-white shadow-xl">
            <div className="max-w-2xl mb-6">
              <span className="rounded bg-amber-400/20 text-amber-300 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider">
                Interactive Hackathon Evaluator Console
              </span>
              <h3 className="text-2xl font-bold mt-2">Test All 4 User Roles in 1 Click</h3>
              <p className="text-xs text-slate-300 mt-1">
                Every role has distinct server-enforced permissions and specialized workflows. Experience the platform from each stakeholder's perspective:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/login?role=SUPER_ADMIN" className="block group">
                <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4 hover:border-blue-400 hover:bg-slate-800 transition-all">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-400 mb-1">
                    <span>Role A</span>
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    AICTE Official
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Nationwide metrics, intake breaches, state distribution, institution approvals.
                  </div>
                </div>
              </Link>

              <Link href="/login?role=COLLEGE_ADMIN" className="block group">
                <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4 hover:border-blue-400 hover:bg-slate-800 transition-all">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-1">
                    <span>Role B</span>
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    College Administrator
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Delhi Inst of Tech: Manage students, 9-step Excel wizard, intake capacity meters.
                  </div>
                </div>
              </Link>

              <Link href="/login?role=FACULTY" className="block group">
                <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4 hover:border-blue-400 hover:bg-slate-800 transition-all">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-400 mb-1">
                    <span>Role C</span>
                    <FileCheck className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    Verification Officer
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Verification workspace, cross-institution conflict inspection, approve/reject.
                  </div>
                </div>
              </Link>

              <Link href="/login?role=STUDENT" className="block group">
                <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4 hover:border-blue-400 hover:bg-slate-800 transition-all">
                  <div className="flex items-center justify-between text-xs font-semibold text-purple-400 mb-1">
                    <span>Role D</span>
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    Student Portal
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Rahul Sharma: View academic profile, masked APAAR card, submit correction request.
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
