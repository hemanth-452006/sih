"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  Search,
  ExternalLink,
  Edit2,
  Ban,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Institution } from "@/lib/types";

export default function InstitutionsRegistryPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusActionMsg, setStatusActionMsg] = useState<string | null>(null);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/institutions");
      const data = await res.json();
      setInstitutions(data.institutions || []);
    } catch (err) {
      console.error("Failed to load institutions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleStatusChange = async (
    instId: string,
    status: "APPROVED" | "SUSPENDED" | "REJECTED",
    reason: string
  ) => {
    try {
      const res = await fetch("/api/institutions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionId: instId, status, reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      setStatusActionMsg(`Institution status successfully updated to ${status}.`);
      fetchInstitutions();
    } catch (err: any) {
      alert(err.message || "Failed to update institution");
    }
  };

  const filtered = institutions.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.code.toLowerCase().includes(search.toLowerCase()) ||
      i.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              AICTE National Institutional Registry
            </h1>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
              Super Admin Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit registered colleges, review onboarding access requests, and manage active regulatory approval status.
          </p>
        </div>
      </div>

      {statusActionMsg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{statusActionMsg}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
        <Search className="h-4 w-4 text-slate-400 ml-2" />
        <input
          placeholder="Filter by institution name, permanent AICTE code, or state..."
          className="w-full text-xs bg-transparent focus:outline-none text-slate-900"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Institutions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[140px]">AICTE Code</TableHead>
              <TableHead>Institution Name</TableHead>
              <TableHead>State &amp; District</TableHead>
              <TableHead>Nodal Email / Phone</TableHead>
              <TableHead>Approval Status</TableHead>
              <TableHead className="text-right">Administrative Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-500">
                  Loading institutional registry...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-500">
                  No institutions found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((inst) => (
                <TableRow key={inst.id}>
                  <TableCell className="font-mono text-xs font-bold text-blue-700">
                    {inst.code}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900 text-xs">{inst.name}</div>
                    <div className="text-[10px] text-slate-500">{inst.website || "No URL"}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {inst.district ? `${inst.district}, ` : ""}
                    <strong>{inst.state}</strong>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    <div>{inst.email}</div>
                    <div className="text-[10px] text-slate-400">{inst.phone || "-"}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={inst.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {inst.status === "PENDING" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(inst.id, "APPROVED", "Approved by Central AICTE Bureau")}
                          className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px]"
                        >
                          Approve Access
                        </Button>
                      )}
                      {inst.status === "APPROVED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(inst.id, "SUSPENDED", "Temporarily suspended pending inquiry")}
                          className="h-7 px-2 text-amber-700 border-amber-300 hover:bg-amber-50 text-[11px]"
                          title="Suspend College Access"
                        >
                          <Ban className="h-3 w-3 mr-1" />
                          Suspend
                        </Button>
                      )}
                      {inst.status === "SUSPENDED" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(inst.id, "APPROVED", "Reactivated after compliance resolution")}
                          className="h-7 px-2.5 bg-blue-700 hover:bg-blue-800 text-white text-[11px]"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Total Registered Colleges: {institutions.length}</span>
          <span>AICTE Governance Mode</span>
        </div>
      </div>
    </div>
  );
}
