"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Plus,
  BarChart3,
  ArrowRight,
  ShieldAlert,
  Building,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CollegeDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/analytics/college");
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to load college metrics", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* College Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Institutional Academic Administration
            </h1>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              AICTE-ND-001
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Delhi Institute of Technology (Autonomous) — Academic Record Management &amp; Intake Audit
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/dashboard/students">
            <Button size="sm" variant="outline" className="text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Student
            </Button>
          </Link>
          <Link href="/dashboard/imports">
            <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white text-xs">
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
              Import Excel / CSV
            </Button>
          </Link>
        </div>
      </div>

      {/* College Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Total Students</span>
              <Users className="h-4 w-4 text-slate-700" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{metrics.totalStudents}</div>
            <div className="text-[10px] text-slate-500">Recorded Admitted</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Verified APAAR</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700">{metrics.verified}</div>
            <div className="text-[10px] text-emerald-600 font-medium">
              {Math.round((metrics.verified / (metrics.totalStudents || 1)) * 100)}% Verified
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Pending Review</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">{metrics.pending}</div>
            <div className="text-[10px] text-amber-600 font-medium">In Verification Queue</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Needs Correction</span>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-700">{metrics.needsCorrection}</div>
            <div className="text-[10px] text-orange-600 font-medium">Discrepancy Flags</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Dual Enrolment Alerts</span>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">{metrics.conflicts}</div>
            <div className="text-[10px] text-red-600 font-medium">Cross-Institution Conflict</div>
          </CardContent>
        </Card>
      </div>

      {/* Intake Capacity Section for College */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-700" />
              Sanctioned Intake Capacity vs Current Admissions
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison against approved AICTE quota limits (Academic Year 2024-2025)
            </p>
          </div>
          <Link href="/dashboard/intake">
            <Button variant="ghost" size="sm" className="text-xs text-blue-700 font-semibold">
              Manage Quotas <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {metrics.intakeStats?.map((intake: any) => {
            const pct = Math.min(intake.utilizationPercentage, 100);
            return (
              <div key={intake.courseId} className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <div>
                    <span className="font-bold text-slate-900">{intake.courseName}</span>
                    <span className="text-slate-500 ml-1.5 font-normal">({intake.departmentName})</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <span className={intake.isExceeded ? "text-red-700 font-bold" : "text-slate-700"}>
                      {intake.currentEnrolled} / {intake.approvedCount} Seats ({intake.utilizationPercentage}%)
                    </span>
                    {intake.isExceeded && (
                      <span className="bg-red-100 text-red-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
                        OVER INTAKE (+{intake.exceededBy})
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      intake.isExceeded
                        ? "bg-red-600"
                        : pct >= 90
                        ? "bg-amber-500"
                        : "bg-blue-600"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {intake.alertMessage && (
                  <div className="text-[11px] text-red-700 font-medium pt-0.5 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    <span>{intake.alertMessage}</span>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/verification" className="block group">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all space-y-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
              Verification Queue
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inspect pending student records, verify board certificates, and issue official validation decisions.
            </p>
          </div>
        </Link>

        <Link href="/dashboard/duplicates" className="block group">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all space-y-2">
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
              Duplicate &amp; Conflict Alerts
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review cross-institution dual-enrolment flags and exact APAAR matches within the department.
            </p>
          </div>
        </Link>

        <Link href="/dashboard/imports" className="block group">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-all space-y-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Spreadsheet Ingestion Wizard
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Import new batches of freshman records from Excel or CSV with automatic syntax and duplicate checks.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
