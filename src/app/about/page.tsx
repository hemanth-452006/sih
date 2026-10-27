import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Shield, BookOpen, Target, CheckCircle2, Award, Building, FileText } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />

      <main className="flex-1 py-12 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 mb-3">
            <Shield className="h-3.5 w-3.5" />
            Statutory AICTE Mandate
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            About the AICTE APAAR Verify Platform
          </h1>
          <p className="mt-3 text-sm text-slate-600 max-w-2xl mx-auto">
            Developed under the Smart India Hackathon 2026 to realize the vision of "One Nation, One Student ID" across India's technical and higher education institutions.
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-700" />
              1. The Problem Context
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Prior to APAAR (Automated Permanent Academic Account Registry), higher education institutions relied on disparate local roll numbers and fragmented registration spreadsheets. This lack of centralized interoperability resulted in recurring systemic challenges:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs text-slate-700">
                <span className="font-semibold text-red-700 block mb-1">Dual Concurrent Enrolment</span>
                Students simultaneously admitted into two full-time government-subsidized degree programmes across different states without institutional knowledge.
              </div>
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs text-slate-700">
                <span className="font-semibold text-amber-700 block mb-1">Intake Quota Violations</span>
                Admissions exceeding the legally sanctioned AICTE intake capacity by colleges, leading to unaccredited degree issuance and legal disputes.
              </div>
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs text-slate-700">
                <span className="font-semibold text-blue-700 block mb-1">Fraudulent Credentials</span>
                Forged or fabricated mark sheets and certificates lacking national verification back-references.
              </div>
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs text-slate-700">
                <span className="font-semibold text-emerald-700 block mb-1">Fragmented Portability</span>
                Credit transfer roadblocks under the National Credit Framework (NCrF) and Academic Bank of Credits (ABC).
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-700" />
              2. Objectives of the Platform
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              The APAAR Verify platform establishes a trusted, cryptographic digital verification layer:
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>National Uniqueness:</strong> Enforce exact 12-digit APAAR identity mapping across all registered colleges.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Regulatory Sanctioned Intake Enforcement:</strong> Continuous real-time auditing of current admissions against approved quota seats per branch and academic year.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Privacy by Design:</strong> Secure storage utilizing keyed HMAC fingerprints and masked identifiers in strict compliance with the Digital Personal Data Protection (DPDP) Act 2023.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Immutable Audit Trails:</strong> Every creation, modification, verification decision, and spreadsheet import is logged with timestamped actor metadata.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
