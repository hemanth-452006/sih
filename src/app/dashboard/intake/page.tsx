"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Edit2,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { IntakeCalculation } from "@/lib/intake-monitor";

export default function IntakePage() {
  const [intakeStats, setIntakeStats] = useState<IntakeCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedIntake, setSelectedIntake] = useState<IntakeCalculation | null>(null);
  const [newApprovedCount, setNewApprovedCount] = useState<number>(60);
  const [submitting, setSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const loadIntake = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/intake");
      const data = await res.json();
      setIntakeStats(data.intakeStats || []);
    } catch (err) {
      console.error("Failed to load intake data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntake();
  }, []);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntake) return;
    setSubmitting(true);
    setUpdateSuccess(null);

    try {
      const res = await fetch("/api/intake", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedIntake.courseId,
          academicYear: selectedIntake.academicYear,
          approvedCount: Number(newApprovedCount),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update approved intake");

      setUpdateSuccess(`Approved intake for ${selectedIntake.courseName} updated to ${newApprovedCount} seats.`);
      setEditModalOpen(false);
      loadIntake();
    } catch (err: any) {
      alert(err.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (intake: IntakeCalculation) => {
    setSelectedIntake(intake);
    setNewApprovedCount(intake.approvedCount);
    setEditModalOpen(true);
  };

  const totalSanctioned = intakeStats.reduce((sum, i) => sum + i.approvedCount, 0);
  const totalEnrolled = intakeStats.reduce((sum, i) => sum + i.currentEnrolled, 0);
  const exceededCount = intakeStats.filter((i) => i.isExceeded).length;

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Approved Intake Capacity &amp; Compliance Monitor
            </h1>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
              AICTE Sanctioned Quotas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit recorded student admissions against statutory AICTE-approved seat quotas by course and academic year.
          </p>
        </div>
      </div>

      {/* Regulatory Notice Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900">Statutory Notice:</span>
          <p className="mt-0.5 leading-relaxed">
            Alerts generated in this section represent data-based discrepancy flags. A college cannot be concluded to have violated regulations solely from a raw database count without formal hearing and state directorate confirmation.
          </p>
        </div>
      </div>

      {updateSuccess && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{updateSuccess}</span>
        </div>
      )}

      {/* Aggregate Intake Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500">Total Sanctioned Quota Seats</div>
            <div className="text-2xl font-bold text-slate-900">{totalSanctioned} Seats</div>
            <div className="text-[10px] text-slate-500">Across All Monitored Programmes</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500">Current Recorded Admissions</div>
            <div className="text-2xl font-bold text-blue-700">{totalEnrolled} Students</div>
            <div className="text-[10px] text-blue-600 font-medium">
              {Math.round((totalEnrolled / (totalSanctioned || 1)) * 100)}% Overall Seat Utilization
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500">Capacity Overflow Alerts</div>
            <div className="text-2xl font-bold text-red-600">
              {exceededCount > 0 ? `${exceededCount} Over-Intake Course` : "Zero Breaches"}
            </div>
            <div className="text-[10px] text-red-600 font-medium">
              {exceededCount > 0 ? "Requires Institutional Reconciliation" : "All Quotas Compliant"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course-by-Course Intake Breakdown Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900">
          Course-Wise Intake Utilization Breakdown (Academic Year 2024-2025)
        </h2>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            Calculating intake quotas against active student admissions...
          </div>
        ) : (
          intakeStats.map((item) => {
            const pct = Math.min(item.utilizationPercentage, 100);
            return (
              <Card
                key={`${item.courseId}-${item.academicYear}`}
                className={`border shadow-xs ${
                  item.isExceeded
                    ? "border-red-300 bg-red-50/20"
                    : "border-slate-200 bg-white"
                }`}
              >
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      {item.courseName}
                    </CardTitle>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Department: <strong>{item.departmentName}</strong> | Academic Year: <strong>{item.academicYear}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(item)}
                      className="text-xs h-8"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      Configure Quota
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Approved Sanctioned Quota</span>
                      <span className="text-base font-bold text-slate-900 block mt-0.5">
                        {item.approvedCount} Seats
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Recorded Admitted</span>
                      <span className={`text-base font-bold block mt-0.5 ${item.isExceeded ? "text-red-700" : "text-blue-700"}`}>
                        {item.currentEnrolled} Students
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Available Remaining Capacity</span>
                      <span className="text-base font-bold text-emerald-700 block mt-0.5">
                        {item.availableCapacity} Vacant Seats
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Seat Utilization</span>
                      <span className="text-base font-bold text-slate-900 block mt-0.5">
                        {item.utilizationPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Occupancy Progress</span>
                      <span className="font-semibold text-slate-800">{item.utilizationPercentage}% Filled</span>
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.isExceeded
                            ? "bg-red-600"
                            : pct >= 90
                            ? "bg-amber-500"
                            : "bg-blue-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {item.alertMessage && (
                    <div className="rounded-lg bg-red-50 p-3 text-xs text-red-800 border border-red-200 flex items-start gap-2 font-medium">
                      <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{item.alertMessage}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Approved Quota Modal Dialog */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure AICTE Sanctioned Intake Quota</DialogTitle>
          </DialogHeader>

          {selectedIntake && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4 pt-2">
              <div className="text-xs text-slate-600 space-y-1">
                <div>Programme: <strong className="text-slate-900">{selectedIntake.courseName}</strong></div>
                <div>Academic Year: <strong className="text-slate-900">{selectedIntake.academicYear}</strong></div>
                <div>Currently Enrolled: <strong className="text-blue-700">{selectedIntake.currentEnrolled} Students</strong></div>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-900">
                  New Approved Intake Quota (Number of Seats) *
                </label>
                <Input
                  type="number"
                  required
                  min={1}
                  max={500}
                  value={newApprovedCount}
                  onChange={(e) => setNewApprovedCount(Number(e.target.value))}
                />
                <span className="text-[11px] text-slate-400">
                  Only AICTE Central Administrators are authorized to update statutory quotas.
                </span>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-blue-700 hover:bg-blue-800 text-white"
                >
                  {submitting ? "Saving..." : "Save Approved Quota"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
