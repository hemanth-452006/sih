import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { CheckCircle2, ShieldAlert, Cpu, ArrowRight, Layers, FileCheck, AlertCircle } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />

      <main className="flex-1 py-12 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 mb-3">
            <Cpu className="h-3.5 w-3.5" />
            Verification Engine Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            How APAAR Verification Works
          </h1>
          <p className="mt-3 text-sm text-slate-600 max-w-2xl mx-auto">
            A transparent walkthrough of data ingestion, duplicate detection, intake compliance, and officer verification review.
          </p>
        </div>

        {/* Official Integration Disclaimer Banner */}
        <div className="mb-8 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Crucial Regulatory Architecture Note:</span>
            <p>
              In accordance with AICTE &amp; National Academic Depository guidelines, locally generated validation results are explicitly labeled as <strong>"Demo Validation"</strong> or <strong>"Local Data Validation"</strong>. Production verification against the national APAAR registry requires authorized government API gateway credentials (DigiLocker / NAD / UIDAI API adapter).
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Step by step cards */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                1
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Record Ingestion &amp; Format Normalization</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The institution inputs student data either one-by-one or in bulk using the 9-step spreadsheet wizard. The engine normalizes the 12-digit APAAR ID, validates the numerical schema, strips non-digit characters, and verifies mandatory demographic fields (Name, Date of Birth, Gender, Programme).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                2
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Cryptographic HMAC Fingerprinting</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To protect sensitive student identifiers from plaintext database compromises, the raw APAAR ID is hashed using a keyed HMAC-SHA256 function with a salt kept outside database storage. All exact-match lookups operate on this deterministic fingerprint.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                3
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Multi-Layered Duplicate &amp; Conflict Scanning</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The candidate record is evaluated against four distinct detection strategies:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-100 text-xs">
                    <strong>Exact APAAR Match:</strong> 100% confidence match flags duplicate entries within same or different institutions.
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-100 text-xs">
                    <strong>Cross-Institution Dual Enrolment:</strong> Identifies active status students enrolled simultaneously in two institutions.
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-100 text-xs">
                    <strong>Name + Date of Birth Match:</strong> Compares normalized legal names and DOB to catch duplicate admissions under differing roll numbers.
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-100 text-xs">
                    <strong>Fuzzy Spelling Variation:</strong> Levenshtein similarity algorithm flags potential typographical errors for human review.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                4
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Approved Intake Capacity Comparison</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The system aggregates total currently admitted students in the course and academic year against the officially sanctioned intake approved by AICTE. If recorded admissions exceed capacity, a non-blocking warning alert is flagged for administrative review.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                5
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Verification Officer Review &amp; Decision Logging</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The authorized Verification Officer inspects the automated validation report, cross-references supporting secondary school certificates, and records an official decision (<strong>Verified</strong>, <strong>Needs Correction</strong>, or <strong>Rejected</strong>) with mandatory review notes permanently etched into the audit ledger.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
