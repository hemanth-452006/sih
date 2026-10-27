"use client";

import { useState, useEffect } from "react";
import {
  User,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Download,
  Building2,
  FileText,
  Clock,
  Send,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskApaarId, formatApaarId } from "@/lib/apaar-security";
import { CorrectionRequest, StudentRecord } from "@/lib/types";

export default function StudentPortalPage() {
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [correctionRequests, setCorrectionRequests] = useState<CorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApaar, setShowApaar] = useState(false);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [fieldToCorrect, setFieldToCorrect] = useState("guardianPhone");
  const [requestedValue, setRequestedValue] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      if (data.students && data.students.length > 0) {
        setStudent(data.students[0]);
      }

      const corRes = await fetch("/api/corrections");
      const corData = await corRes.json();
      setCorrectionRequests(corData.requests || []);
    } catch (err) {
      console.error("Failed to load student portal", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setSubmitting(true);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          field: fieldToCorrect,
          currentValue: (student as any)[fieldToCorrect] || "",
          requestedValue,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setSuccessMsg("Correction request submitted to the institutional verification officer.");
      setCorrectionModalOpen(false);
      setRequestedValue("");
      setReason("");
      loadStudentData();
    } catch (err: any) {
      alert(err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !student) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-60 bg-slate-200 rounded animate-pulse" />
        <div className="h-56 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Student Academic Profile &amp; APAAR Card
            </h1>
            <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
              Self-Service Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            View verified academic enrolment, track verification requests, and manage personal records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setCorrectionModalOpen(true)}
            className="bg-blue-700 hover:bg-blue-800 text-white text-xs"
          >
            <Send className="h-3.5 w-3.5 mr-1" />
            Request Record Correction
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Virtual APAAR Identity Card */}
      <div className="max-w-xl mx-auto rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl relative overflow-hidden border border-blue-400/20">
        {/* Subtle Ashoka / Emblem motif */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold tracking-wider text-slate-200 uppercase">
                AICTE — Government of India
              </div>
              <div className="text-[11px] text-blue-200 font-medium">
                National Student Academic Identifier Card
              </div>
            </div>
          </div>
          <StatusBadge status={student.verificationStatus} />
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-extrabold text-white">{student.fullName}</div>
              <div className="text-xs text-blue-200 font-medium">{student.courseName}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{student.institutionName}</div>
            </div>
            <div className="h-14 w-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xl text-amber-300">
              {student.firstName[0]}
              {student.lastName[0]}
            </div>
          </div>

          {/* APAAR ID Display with Masking toggle */}
          <div className="bg-black/30 p-3 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Permanent Academic Account Registry (APAAR ID)
              </div>
              <div className="font-mono text-base font-bold text-amber-300 tracking-wider">
                {showApaar ? (student.apaarId ? formatApaarId(student.apaarId) : "N/A") : maskApaarId(student.apaarId)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowApaar(!showApaar)}
              className="text-xs text-blue-200 hover:text-white flex items-center gap-1 cursor-pointer bg-white/10 px-2.5 py-1 rounded-md"
            >
              {showApaar ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span>{showApaar ? "Mask" : "Reveal"}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
            <div>
              <span className="text-[10px] text-slate-400 block">Roll / Institutional ID</span>
              <span className="font-mono font-bold text-white">{student.internalId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Academic Year / Sem</span>
              <span className="font-semibold text-white">{student.academicYear} (Sem {student.semester})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Correction Requests & Consent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Correction Requests */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-700" />
              My Record-Correction Requests
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCorrectionModalOpen(true)}
              className="text-xs text-blue-700 font-semibold"
            >
              + New Request
            </Button>
          </CardHeader>
          <CardContent className="pt-3">
            {correctionRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No correction requests filed. All records currently synchronized.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {correctionRequests.map((req) => (
                  <div key={req.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 capitalize">
                        Field: {req.field.replace(/([A-Z])/g, " $1")}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>
                    <div className="text-slate-600">
                      Requested: <strong className="text-slate-800">{req.requestedValue}</strong> (From: {req.currentValue || "Empty"})
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Reason: {req.reason}
                    </p>
                    {req.reviewNotes && (
                      <div className="bg-slate-50 p-2 rounded text-[11px] text-slate-700 mt-1">
                        <strong>Officer Remark:</strong> {req.reviewNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* DPDP Consent & Data Sharing Record */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-700" />
              Data Sharing &amp; DPDP Consent Registry
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>AICTE Academic Registry Consent</span>
                <span className="text-emerald-700 text-[10px] font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                  ACTIVE
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Consent granted for academic validation and national credit transfer across ABC (Academic Bank of Credits).
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>DigiLocker NAD Credential Sharing</span>
                <span className="text-emerald-700 text-[10px] font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                  PERMITTED
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Authorized access to secondary school board marksheet for institutional verification.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Record Correction Modal Dialog */}
      <Dialog open={correctionModalOpen} onOpenChange={setCorrectionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Academic Record-Correction Request</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCorrectionSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5 text-xs">
              <Label htmlFor="field">Discrepant Record Field *</Label>
              <select
                id="field"
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={fieldToCorrect}
                onChange={(e) => setFieldToCorrect(e.target.value)}
              >
                <option value="guardianPhone">Guardian Contact Phone</option>
                <option value="guardianName">Guardian / Parent Full Name</option>
                <option value="dateOfBirth">Date of Birth</option>
                <option value="address">Permanent Address</option>
                <option value="phone">Student Mobile Phone</option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <Label htmlFor="requestedVal">Correct / Updated Value *</Label>
              <Input
                id="requestedVal"
                required
                placeholder="Enter corrected value as per official certificate..."
                value={requestedValue}
                onChange={(e) => setRequestedValue(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <Label htmlFor="reason">Reason &amp; Certificate Reference *</Label>
              <textarea
                id="reason"
                rows={3}
                required
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="State basis of correction, board marksheet serial number, or legal gazette notification..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCorrectionModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                {submitting ? "Submitting..." : "Submit to Verification Officer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
