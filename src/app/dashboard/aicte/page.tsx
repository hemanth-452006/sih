"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  MapPin,
  FileCheck,
  Download,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/utils";

export default function AicteDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState("ALL");
  const [recentAudits, setRecentAudits] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [metricRes, auditRes] = await Promise.all([
          fetch("/api/analytics/aicte"),
          fetch("/api/audit-logs"),
        ]);
        const mData = await metricRes.json();
        const aData = await auditRes.json();

        setMetrics(mData);
        setRecentAudits(aData.logs ? aData.logs.slice(0, 5) : []);
      } catch (err) {
        console.error("Failed to fetch AICTE metrics", err);
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
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              AICTE Central Approval &amp; Verification Bureau
            </h1>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
              HQ Dashboard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Nationwide aggregation, cross-institutional conflict detection, and approved intake monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/reports">
            <Button variant="outline" size="sm" className="text-xs">
              <Download className="h-3.5 w-3.5 mr-1" />
              Export National Report
            </Button>
          </Link>
          <Link href="/dashboard/duplicates">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              Review Conflicts ({metrics.duplicateAlertsCount})
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics (Calculated dynamically from DB) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Colleges</span>
              <Building2 className="h-4 w-4 text-blue-700" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{metrics.totalInstitutions}</div>
            <div className="text-[10px] text-emerald-600 font-medium">
              {metrics.approvedInstitutions} Approved / {metrics.pendingInstitutions} Pending
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Total Enrolled</span>
              <Users className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{metrics.totalStudents}</div>
            <div className="text-[10px] text-slate-500">Active Records</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Verified APAAR</span>
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-700">{metrics.verifiedCount}</div>
            <div className="text-[10px] text-blue-600 font-medium">
              {Math.round((metrics.verifiedCount / (metrics.totalStudents || 1)) * 100)}% Verification Rate
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Pending Review</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">{metrics.pendingVerification}</div>
            <div className="text-[10px] text-amber-600 font-medium">Awaiting Officer Action</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Duplicates / Conflicts</span>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">{metrics.duplicateAlertsCount}</div>
            <div className="text-[10px] text-red-600 font-medium">Dual Enrolment Alerts</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Intake Breaches</span>
              <BarChart3 className="h-4 w-4 text-purple-700" />
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {metrics.institutionsExceedingIntake}
            </div>
            <div className="text-[10px] text-purple-700 font-medium">Capacity Overflow</div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Regulatory Alert Banner if any intake or duplicate breach */}
      {metrics.institutionsExceedingIntake > 0 && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-xs text-purple-900 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="h-5 w-5 text-purple-700 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Sanctioned Intake Capacity Discrepancy Detected:</span>
              <p className="mt-0.5 text-purple-800">
                Delhi Institute of Technology (Autonomous) has recorded 62 admissions in B.Tech CSE against AICTE approved capacity of 60 seats (Over-Intake of +2 seats).
              </p>
            </div>
          </div>
          <Link href="/dashboard/intake">
            <Button size="sm" variant="outline" className="border-purple-300 text-purple-900 hover:bg-purple-100 text-xs shrink-0">
              View Intake Audits
            </Button>
          </Link>
        </div>
      )}

      {/* Analytics Breakdown: State-wise Distribution + Course Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State Enrolment Distribution */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-700" />
                State-Wise Student Enrolment Distribution
              </CardTitle>
              <span className="text-[11px] text-slate-500 font-normal">Active Institutions</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {metrics.stateDistribution?.map((item: any, idx: number) => {
              const maxVal = Math.max(...metrics.stateDistribution.map((s: any) => s.count), 1);
              const pct = Math.round((item.count / maxVal) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.state}</span>
                    <span className="font-bold text-slate-900">{item.count} Students</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Course-Wise Academic Distribution */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-700" />
                Programme &amp; Course Enrolment Share
              </CardTitle>
              <span className="text-[11px] text-slate-500 font-normal">Approved Degrees</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {metrics.courseDistribution?.map((item: any, idx: number) => {
              const total = metrics.totalStudents || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-[280px]">
                      {item.course}
                    </span>
                    <span className="font-bold text-slate-900">{item.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Compliance & Audit Activity */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-slate-700" />
            Recent Administrative &amp; Verification Events
          </CardTitle>
          <Link href="/dashboard/audit" className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-semibold">
            View All Audit Logs <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="divide-y divide-slate-100">
            {recentAudits.map((audit) => (
              <div key={audit.id} className="py-2.5 flex items-start justify-between text-xs gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{audit.actorName}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                      {audit.action}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">{audit.outcome}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{audit.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                  {new Date(audit.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
