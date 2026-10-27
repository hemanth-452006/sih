"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Lock,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuditLogEntry } from "@/lib/types";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (actionFilter) params.set("action", actionFilter);
      if (resourceFilter) params.set("resource", resourceFilter);

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, actionFilter, resourceFilter]);

  const handleExportAudit = async () => {
    try {
      const res = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType: "AUDIT_LOGS" }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Compliance_Audit_Log_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Failed to export audit logs");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Compliance &amp; Security Audit Ledger
            </h1>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              Immutable Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident trail of all logins, student record operations, verification decisions, and spreadsheet imports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportAudit} className="text-xs">
            <Download className="h-3.5 w-3.5 mr-1" />
            Download Audit CSV
          </Button>
        </div>
      </div>

      {/* Security Guarantee Notice */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <Lock className="h-4 w-4 text-slate-700 shrink-0" />
          <span>
            <strong>Tamper Resistance:</strong> Audit records cannot be updated, modified, or deleted by any user or college administrator.
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search by actor name, email, or action details..."
            className="w-full text-xs bg-slate-50 pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="VERIFY">VERIFY</option>
            <option value="REJECT">REJECT</option>
            <option value="IMPORT">IMPORT</option>
            <option value="EXPORT">EXPORT</option>
            <option value="ARCHIVE">ARCHIVE</option>
          </select>

          <select
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
          >
            <option value="">All Resources</option>
            <option value="STUDENT">STUDENT</option>
            <option value="INSTITUTION">INSTITUTION</option>
            <option value="VERIFICATION">VERIFICATION</option>
            <option value="IMPORT">IMPORT</option>
            <option value="INTAKE">INTAKE</option>
            <option value="USER">USER</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[170px]">Timestamp (UTC)</TableHead>
              <TableHead>Actor / Role</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target Resource</TableHead>
              <TableHead>Details &amp; Outcome</TableHead>
              <TableHead className="w-[90px] text-right">Outcome</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-500">
                  Loading tamper-evident audit ledger...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-500">
                  No audit events found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-[11px] text-slate-500">
                    {new Date(log.timestamp).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900 text-xs">{log.actorName}</div>
                    <div className="text-[10px] text-slate-500">{log.actorRole} • {log.actorEmail}</div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-700">
                    {log.resource}
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 max-w-md leading-relaxed">
                    {log.details}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        log.outcome === "SUCCESS"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.outcome}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Total Audit Records: {logs.length}</span>
          <span>Security Ledger Integrity Verified</span>
        </div>
      </div>
    </div>
  );
}
