"use client";

import { useState } from "react";
import {
  Download,
  ScrollText,
  FileSpreadsheet,
  Users,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const reportList = [
    {
      id: "STUDENT_ENROLMENT",
      title: "Student Enrolment Master Report",
      description: "Complete institutional cohort list including masked APAAR IDs, roll numbers, admission years, and current academic status.",
      icon: Users,
      color: "text-blue-700 bg-blue-100",
      filename: "Student_Enrolment_Report.csv",
    },
    {
      id: "DUPLICATES",
      title: "Duplicate & Dual-Enrolment Conflict Report",
      description: "Audit export of all detected cross-institutional duplicate flags, exact APAAR matches, confidence metrics, and resolution logs.",
      icon: AlertTriangle,
      color: "text-amber-700 bg-amber-100",
      filename: "Duplicate_Alerts_Report.csv",
    },
    {
      id: "INTAKE_UTILIZATION",
      title: "Approved Intake Capacity Utilization Report",
      description: "Regulatory breakdown of officially sanctioned AICTE quotas versus actual enrolled students, remaining vacancy, and over-quota alerts.",
      icon: BarChart3,
      color: "text-purple-700 bg-purple-100",
      filename: "Intake_Utilization_Report.csv",
    },
    {
      id: "AUDIT_LOGS",
      title: "Compliance & Security Audit Trail Export",
      description: "Immutable security log of all login events, student modifications, verification decisions, and batch imports with actor timestamps.",
      icon: ShieldCheck,
      color: "text-emerald-700 bg-emerald-100",
      filename: "Compliance_Audit_Log.csv",
    },
  ];

  const handleDownload = async (reportId: string, defaultFilename: string) => {
    setDownloading(reportId);
    try {
      const res = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType: reportId }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = defaultFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Failed to export report");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Compliance Reports &amp; Analytics Export
          </h1>
          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
            Export Center
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate and download authorized regulatory CSV datasets with automatic formula injection protection (CWE-1236).
        </p>
      </div>

      {/* Safety Notice */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            All exported CSV files are sanitized to neutralize spreadsheet formula execution risks and mask sensitive student identifiers.
          </span>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportList.map((rep) => {
          const Icon = rep.icon;
          const isBusy = downloading === rep.id;
          return (
            <Card key={rep.id} className="border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg ${rep.color} shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      {rep.title}
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {rep.description}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px] truncate max-w-[200px]">
                  {rep.filename}
                </span>
                <Button
                  size="sm"
                  disabled={isBusy}
                  onClick={() => handleDownload(rep.id, rep.filename)}
                  className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  {isBusy ? "Generating..." : "Download CSV"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
