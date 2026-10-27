"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Building2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Lock,
  User,
  History,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { maskApaarId, formatApaarId } from "@/lib/apaar-security";
import { StudentRecord, DuplicateAlert } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [duplicateAlerts, setDuplicateAlerts] = useState<DuplicateAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnmasked, setShowUnmasked] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadStudent() {
      try {
        const [stuRes, dupRes] = await Promise.all([
          fetch(`/api/students/${id}`),
          fetch("/api/duplicates"),
        ]);
        const stuData = await stuRes.json();
        const dupData = await dupRes.json();

        setStudent(stuData.student || null);
        if (dupData.alerts) {
          const relevant = dupData.alerts.filter(
            (a: DuplicateAlert) => a.student1Id === id || a.student2Id === id
          );
          setDuplicateAlerts(relevant);
        }
      } catch (err) {
        console.error("Failed to load student", err);
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, [id]);

  const handleDecision = async (decision: "VERIFIED" | "REJECTED" | "NEEDS_CORRECTION") => {
    setSubmitting(true);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/students/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          notes: reviewNotes || `Decision recorded as ${decision} by authorized officer.`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit decision");

      setStudent(data.student);
      setActionSuccess(`Status successfully updated to ${decision}.`);
      setReviewNotes("");
    } catch (err: any) {
      alert(err.message || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-48 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-16 space-y-3">
        <AlertCircle className="h-10 w-10 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Student Record Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested student record does not exist or access is restricted by institutional boundary rules.
        </p>
        <Link href="/dashboard/students">
          <Button variant="outline" size="sm">
            Back to Student Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/students"
          className="inline-flex items-center text-xs font-semibold text-blue-700 hover:underline gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Directory
        </Link>
      </div>

      {/* Main Student Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-800 text-xl font-bold shrink-0">
            {student.firstName[0]}
            {student.lastName[0] || ""}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">{student.fullName}</h1>
              <StatusBadge status={student.verificationStatus} />
              <StatusBadge status={student.enrollmentStatus} />
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span>Roll ID: <strong className="text-slate-800">{student.internalId}</strong></span>
              <span>•</span>
              <span>
                APAAR:{" "}
                <strong className="text-slate-800 font-bold">
                  {showUnmasked ? (student.apaarId ? formatApaarId(student.apaarId) : "N/A") : maskApaarId(student.apaarId)}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setShowUnmasked(!showUnmasked)}
                className="text-blue-700 hover:underline text-[11px] font-sans ml-1"
              >
                {showUnmasked ? "(Mask)" : "(Reveal)"}
              </button>
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-0.5">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              <span>{student.institutionName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/verification">
            <Button size="sm" variant="outline" className="text-xs">
              <FileCheck className="h-3.5 w-3.5 mr-1" />
              Verification Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Success Alert */}
      {actionSuccess && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Duplicate / Conflict Notice if applicable */}
      {duplicateAlerts.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-red-900">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span>Active Duplicate / Conflict Alert Flagged on this Identity:</span>
          </div>
          {duplicateAlerts.map((alert) => (
            <div key={alert.id} className="text-xs text-red-800 bg-white/70 p-3 rounded border border-red-100 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>Match Classification: {alert.matchType} ({alert.confidence}% Confidence)</span>
                <span className="font-mono text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded">
                  Status: {alert.status}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">{alert.reason}</p>
              <div className="pt-1 text-[11px] text-slate-700">
                <strong>Recommended Next Action:</strong> {alert.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Academic & Personal Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">
                Academic Programme Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Enrolled Course / Degree</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                  {student.courseName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Department</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                  {student.departmentName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Admission Batch &amp; Academic Year</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {student.academicYear} (Admission: {student.admissionYear})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Semester</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  Semester {student.semester}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">
                Demographic &amp; Contact Records
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Date of Birth</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {student.dateOfBirth?.split("T")[0] || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Gender</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {student.gender}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Official Institutional Email</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {student.email}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Student Mobile</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {student.phone}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Guardian / Parent Name</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {student.guardianName || "Not Recorded"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Guardian Phone</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {student.guardianPhone || "Not Recorded"}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block">Residential Address</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {student.address || "Campus Hostel Address"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Verification Notes / History */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="h-4 w-4 text-slate-600" />
                Verification Notes &amp; Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Verification Status Note</span>
                  <span className="font-mono">{new Date(student.updatedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-700 font-medium">
                  {student.verificationNotes || "No verification remarks recorded yet. Ready for officer review."}
                </p>
              </div>

              <div className="text-[11px] text-slate-500">
                Supporting Documentation:{" "}
                <span className="font-semibold text-slate-800">
                  {student.hasDocument ? (student.documentType || "Secondary Certificate Verified") : "Missing Board Certificate"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Verification Officer Action Panel */}
        <div className="space-y-6">
          <Card className="border-blue-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-blue-100 bg-blue-50/50">
              <CardTitle className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-blue-700" />
                Officer Decision Workspace
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Verification Remarks &amp; Audit Comment *
                </label>
                <textarea
                  rows={3}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Record justification, cross-reference marksheet numbers, or specify required corrections..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>

              <div className="space-y-2 pt-1">
                <Button
                  onClick={() => handleDecision("VERIFIED")}
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Approve &amp; Mark Verified
                </Button>

                <Button
                  onClick={() => handleDecision("NEEDS_CORRECTION")}
                  disabled={submitting}
                  variant="outline"
                  className="w-full border-orange-300 text-orange-800 hover:bg-orange-50 text-xs font-semibold"
                >
                  <AlertTriangle className="h-3.5 w-3.5 mr-1 text-orange-600" />
                  Request Data Correction
                </Button>

                <Button
                  onClick={() => handleDecision("REJECTED")}
                  disabled={submitting}
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold"
                >
                  Reject Record
                </Button>
              </div>

              <div className="text-[10px] text-slate-400 text-center leading-tight">
                All decisions create an immutable entry in the compliance audit ledger.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
