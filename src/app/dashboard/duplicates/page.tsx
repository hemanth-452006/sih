"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Building2,
  Users,
  Search,
  ArrowRight,
  Filter,
  Check,
  RotateCcw,
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
import { DuplicateAlert } from "@/lib/types";

export default function DuplicatesPage() {
  const [alerts, setAlerts] = useState<DuplicateAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [selectedAlert, setSelectedAlert] = useState<DuplicateAlert | null>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionType, setResolutionType] = useState<"CONFIRMED" | "DISMISSED" | "MERGED">("CONFIRMED");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/duplicates?${params.toString()}`);
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error("Failed to load alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter]);

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/duplicates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertId: selectedAlert.id,
          resolution: resolutionType,
          notes: resolutionNotes || `Alert marked as ${resolutionType} by administrator.`,
        }),
      });

      if (!res.ok) throw new Error("Failed to resolve alert");

      setResolveModalOpen(false);
      setSelectedAlert(null);
      setResolutionNotes("");
      fetchAlerts();
    } catch (err: any) {
      alert(err.message || "Failed to resolve alert");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Duplicate Detection &amp; Dual-Enrolment Console
            </h1>
            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">
              AICTE Regulatory Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify exact APAAR duplications, spelling candidates, and cross-institution dual-enrolment conflicts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="PENDING">Active Pending Alerts</option>
            <option value="CONFIRMED">Confirmed Duplicates</option>
            <option value="DISMISSED">Dismissed Alerts</option>
            <option value="MERGED">Merged Records</option>
            <option value="">All Statuses</option>
          </select>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900">Regulatory Safeguard Mandate:</span>
          <p className="mt-0.5 leading-relaxed">
            The system treats approximate name similarity matches as candidate reviews, not definitive proof of fraud. Automatic merges are disabled to prevent accidental erasure of valid separate identities with similar names.
          </p>
        </div>
      </div>

      {/* Duplicate Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            Scanning institutional database for duplicate patterns...
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
            No duplicate or conflict alerts found under the current filter.
          </div>
        ) : (
          alerts.map((alert) => {
            const isConflict = alert.matchType === "CROSS_INSTITUTION_CONFLICT";
            return (
              <Card
                key={alert.id}
                className={`border shadow-xs transition-all ${
                  isConflict
                    ? "border-red-300 bg-red-50/20"
                    : "border-slate-200 bg-white"
                }`}
              >
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isConflict
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {alert.matchType.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      Match Confidence: <strong>{alert.confidence}%</strong>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Alert #{alert.id})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={alert.status} />
                    {alert.status === "PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedAlert(alert);
                          setResolveModalOpen(true);
                        }}
                        className="bg-blue-700 hover:bg-blue-800 text-white text-xs h-7 px-3"
                      >
                        Resolve Alert
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {/* Side-by-side comparison of Student 1 and Student 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Record 1 */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Primary Record A</span>
                        <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-bold">
                          {alert.student1InternalId}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">{alert.student1Name}</div>
                      <div className="text-slate-600 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{alert.student1Institution}</span>
                      </div>
                      <div className="pt-1">
                        <Link
                          href={`/dashboard/students/${alert.student1Id}`}
                          className="text-blue-700 hover:underline text-[11px] font-semibold"
                        >
                          View Student Record →
                        </Link>
                      </div>
                    </div>

                    {/* Record 2 */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Matched Candidate Record B</span>
                        <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-bold">
                          {alert.student2InternalId}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">{alert.student2Name}</div>
                      <div className="text-slate-600 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{alert.student2Institution}</span>
                      </div>
                      <div className="pt-1">
                        <Link
                          href={`/dashboard/students/${alert.student2Id}`}
                          className="text-blue-700 hover:underline text-[11px] font-semibold"
                        >
                          View Matched Record →
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Reason & Recommended Action */}
                  <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                    <div>
                      <span className="font-bold text-slate-800">Alert Reason: </span>
                      <span className="text-slate-700">{alert.reason}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">Recommended Regulatory Action: </span>
                      <span className="text-slate-700">{alert.recommendedAction}</span>
                    </div>
                    {alert.matchingFields && (
                      <div className="text-[11px] text-slate-500 pt-1">
                        Matching Fields: {alert.matchingFields.join(", ")}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Resolve Alert Modal Dialog */}
      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Resolve Duplicate / Conflict Alert</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleResolveSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-900">Select Resolution Action *</label>
              <select
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={resolutionType}
                onChange={(e: any) => setResolutionType(e.target.value)}
              >
                <option value="CONFIRMED">
                  Confirmed Duplicate / Dual Enrolment (Issue Violation Notice)
                </option>
                <option value="DISMISSED">
                  Dismiss Alert (Distinct Individual / Legitimate Case)
                </option>
                <option value="MERGED">
                  Merge Records (Combine duplicate institutional entries)
                </option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-900">
                Resolution Notes &amp; Evidence Justification *
              </label>
              <textarea
                rows={3}
                required
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="State basis of resolution, verified certificates, parent affidavits, or nodal officer directions..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResolveModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                {submitting ? "Recording Resolution..." : "Save Resolution to Ledger"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
