"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Search,
  Eye,
  Building2,
  FileText,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { maskApaarId, formatApaarId } from "@/lib/apaar-security";
import { StudentRecord } from "@/lib/types";

export default function VerificationWorkspacePage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState("PENDING");

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      const list = data.students || [];
      setStudents(list);

      // Auto-select first pending record if none selected
      const firstPending = list.find((s: StudentRecord) =>
        s.verificationStatus === "PENDING_VERIFICATION" || s.verificationStatus === "NOT_SUBMITTED"
      );
      if (firstPending && !selectedStudent) {
        setSelectedStudent(firstPending);
      } else if (list.length > 0 && !selectedStudent) {
        setSelectedStudent(list[0]);
      }
    } catch (err) {
      console.error("Failed to load verification records", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleDecision = async (decision: "VERIFIED" | "REJECTED" | "NEEDS_CORRECTION") => {
    if (!selectedStudent) return;
    setSubmitting(true);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/students/${selectedStudent.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          notes: reviewNotes || `Decision marked as ${decision} in verification workspace.`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit decision");

      setActionSuccess(`Record ${selectedStudent.fullName} successfully marked as ${decision}.`);
      setReviewNotes("");

      // Update local student in list
      setStudents((prev) =>
        prev.map((s) => (s.id === selectedStudent.id ? data.student : s))
      );
      setSelectedStudent(data.student);
    } catch (err: any) {
      alert(err.message || "Failed to record decision");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (filterTab === "PENDING") {
      return s.verificationStatus === "PENDING_VERIFICATION" || s.verificationStatus === "NOT_SUBMITTED";
    }
    if (filterTab === "CONFLICTS") {
      return s.verificationStatus === "CONFLICT_DETECTED";
    }
    if (filterTab === "CORRECTION") {
      return s.verificationStatus === "NEEDS_CORRECTION";
    }
    if (filterTab === "VERIFIED") {
      return s.verificationStatus === "VERIFIED";
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              APAAR Verification Workspace
            </h1>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
              Officer Review Cell
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit validation reports, detect institutional duplicates, verify academic documents, and issue decisions.
          </p>
        </div>
      </div>

      {/* Official Integration Label Notice Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
        <AlertCircle className="h-4 w-4 text-blue-700 mt-0.5 shrink-0" />
        <div>
          <span className="font-bold">Official Verification Policy:</span> Locally generated validation results represent <strong>Local Data Validation</strong>. Official government APAAR identity verification requires integration with the National Academic Depository (NAD) gateway.
        </div>
      </div>

      {actionSuccess && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main 2-Pane Workspace: Left Queue + Right Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Verification Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Filter Tabs */}
            <div className="flex items-center border-b border-slate-100 bg-slate-50/70 p-1 text-xs font-medium">
              <button
                onClick={() => setFilterTab("PENDING")}
                className={`flex-1 py-1.5 text-center rounded-md transition-all cursor-pointer ${
                  filterTab === "PENDING"
                    ? "bg-white text-blue-800 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pending Review
              </button>
              <button
                onClick={() => setFilterTab("CONFLICTS")}
                className={`flex-1 py-1.5 text-center rounded-md transition-all cursor-pointer ${
                  filterTab === "CONFLICTS"
                    ? "bg-white text-red-800 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Conflicts
              </button>
              <button
                onClick={() => setFilterTab("CORRECTION")}
                className={`flex-1 py-1.5 text-center rounded-md transition-all cursor-pointer ${
                  filterTab === "CORRECTION"
                    ? "bg-white text-orange-800 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Corrections
              </button>
              <button
                onClick={() => setFilterTab("VERIFIED")}
                className={`flex-1 py-1.5 text-center rounded-md transition-all cursor-pointer ${
                  filterTab === "VERIFIED"
                    ? "bg-white text-emerald-800 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Verified
              </button>
            </div>

            {/* Student Queue List */}
            <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No records in this queue.
                </div>
              ) : (
                filteredStudents.map((s) => {
                  const isSelected = selectedStudent?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStudent(s)}
                      className={`p-3 text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-50/90 border-l-4 border-blue-700"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{s.fullName}</span>
                        <StatusBadge status={s.verificationStatus} />
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="font-mono">{s.internalId}</span>
                        <span>{s.academicYear}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {s.courseName}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Local Validation Report & Decision Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedStudent ? (
            <>
              {/* Validation Report Card */}
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      Local Data Validation Report
                    </span>
                    <CardTitle className="text-base font-bold text-slate-900 mt-1">
                      {selectedStudent.fullName} ({selectedStudent.internalId})
                    </CardTitle>
                  </div>
                  <Link
                    href={`/dashboard/students/${selectedStudent.id}`}
                    className="text-xs text-blue-700 hover:underline"
                  >
                    Full Profile →
                  </Link>
                </CardHeader>

                <CardContent className="pt-4 space-y-4 text-xs">
                  {/* Automated Check Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800">12-Digit APAAR Format Check:</span>
                        <p className="text-slate-500 text-[11px]">
                          Format matches national schema. Masked: {maskApaarId(selectedStudent.apaarId)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-2">
                      {selectedStudent.verificationStatus === "CONFLICT_DETECTED" ? (
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-slate-800">Duplicate Record Check:</span>
                        <p className="text-slate-500 text-[11px]">
                          {selectedStudent.verificationStatus === "CONFLICT_DETECTED"
                            ? "Cross-institution dual enrolment detected!"
                            : "No duplicate records within institution."}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800">Intake Quota Compliance:</span>
                        <p className="text-slate-500 text-[11px]">
                          {selectedStudent.departmentName} ({selectedStudent.academicYear})
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-2">
                      {selectedStudent.hasDocument ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-slate-800">Supporting Documentation:</span>
                        <p className="text-slate-500 text-[11px]">
                          {selectedStudent.hasDocument
                            ? (selectedStudent.documentType || "Class 10/12 Marksheet on file")
                            : "Missing secondary school certificate"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Previous notes */}
                  {selectedStudent.verificationNotes && (
                    <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 text-amber-900 text-xs">
                      <span className="font-bold">Prior Review Note:</span>
                      <p className="mt-0.5 text-[11px] leading-relaxed">{selectedStudent.verificationNotes}</p>
                    </div>
                  )}

                  {/* Decision Form */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <label className="font-bold text-slate-900 block">
                      Verification Officer Decision &amp; Audit Justification
                    </label>
                    <textarea
                      rows={3}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter verification rationale, verify marksheet certificate serial numbers, or describe reason for rejection..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                    />

                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        onClick={() => handleDecision("VERIFIED")}
                        disabled={submitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Approve &amp; Mark Verified
                      </Button>

                      <Button
                        onClick={() => handleDecision("NEEDS_CORRECTION")}
                        disabled={submitting}
                        variant="outline"
                        className="border-orange-300 text-orange-800 hover:bg-orange-50 text-xs font-semibold"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 mr-1 text-orange-600" />
                        Flag for Correction
                      </Button>

                      <Button
                        onClick={() => handleDecision("REJECTED")}
                        disabled={submitting}
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold"
                      >
                        Reject Record
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              Select a student from the verification queue to inspect the validation report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
