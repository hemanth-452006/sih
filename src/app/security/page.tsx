import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Lock, ShieldCheck, Key, EyeOff, FileSpreadsheet, Server, UserCheck } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />

      <main className="flex-1 py-12 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 mb-3">
            <Lock className="h-3.5 w-3.5" />
            Security &amp; Data Privacy Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Government-Grade Data Protection
          </h1>
          <p className="mt-3 text-sm text-slate-600 max-w-2xl mx-auto">
            Architected in strict alignment with the Indian Digital Personal Data Protection (DPDP) Act 2023 and National Cyber Security Guidelines.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-blue-800 font-bold text-sm">
              <Key className="h-4 w-4" />
              1. Keyed HMAC Fingerprinting for Sensitive Identifiers
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard unsalted hashes (MD5, SHA-1, or raw SHA-256) of 12-digit numeric identifiers are vulnerable to precomputed rainbow table attacks due to low entropy space. The APAAR Verify platform exclusively employs a <strong>keyed HMAC-SHA256 fingerprinting scheme</strong> using an isolated cryptographic salt stored outside database volumes. Plaintext APAAR numbers are never indexed or exposed in database query logs.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm">
              <EyeOff className="h-4 w-4" />
              2. Sensitive Identifier Masking by Default
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              In student tables, dashboards, and exported previews, APAAR IDs are masked by default displaying only the last 4 digits (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">••••-••••-1098</code>). Full identifiers are accessible strictly to authorized verification officers on an authenticated, need-to-know basis.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-purple-800 font-bold text-sm">
              <Server className="h-4 w-4" />
              3. Server-Enforced Institution-Level Data Isolation
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Data isolation is enforced strictly on the server backend within API controllers and database query scopes. A college administrator or faculty member from Institution A cannot query, inspect, or modify student records belonging to Institution B even if they tamper with URL route parameters or API payload identifiers.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-amber-800 font-bold text-sm">
              <FileSpreadsheet className="h-4 w-4" />
              4. CSV Formula Injection Defense (CWE-1236)
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Exported spreadsheets and student reports pass through an automated CSV injection sanitizer. Any student record cell containing characters frequently used in DDE spreadsheet exploits (such as <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">=, +, -, @, \t, \r</code>) is prepended with a neutralizing single quotation mark before rendering.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-indigo-800 font-bold text-sm">
              <ShieldCheck className="h-4 w-4" />
              5. Tamper-Evident Immutable Audit Ledger
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every significant operation—user authentication, student record creation, spreadsheet batch imports, verification approvals, and status transitions—is recorded in a permanent audit log capturing actor identity, role, timestamp, affected resource, and outcome status. Standard users are cryptographically barred from editing or pruning audit records.
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
