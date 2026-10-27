import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Shield, Check, Users, Building, FileSpreadsheet, Lock, Search, FileText } from "lucide-react";

export default function FeaturesPage() {
  const featureGroups = [
    {
      title: "1. AICTE Central Bureau of Approval Features",
      icon: Shield,
      color: "text-blue-700 bg-blue-100",
      features: [
        "Nationwide aggregation across all approved institutions and engineering colleges",
        "Real-time monitoring of institutions exceeding sanctioned intake quotas",
        "Inter-institutional duplicate and dual-enrolment conflict resolution console",
        "Institution onboarding application review, approval, suspension, and reactivation",
        "Central compliance audit log inspection with exportable governance reports",
      ],
    },
    {
      title: "2. College Administrator Features",
      icon: Building,
      color: "text-emerald-700 bg-emerald-100",
      features: [
        "Institution-specific student record management with strict data isolation",
        "9-Step CSV & Excel Bulk Import Wizard with column mapping & error reporting",
        "Current admissions versus approved intake capacity meters by course and year",
        "Single student addition, edit, archive, and record restoration with audit history",
        "Downloadable student enrolment & verification status reports with formula injection protection",
      ],
    },
    {
      title: "3. Verification Officer Workspace",
      icon: FileText,
      color: "text-amber-700 bg-amber-100",
      features: [
        "Automated validation report generator checking syntax, duplicates, and intake compliance",
        "Original mark sheet and APAAR electronic card inspection viewer",
        "Official review decision recording: Verified, Rejected, or Needs Correction",
        "Mandatory officer audit notes permanently attached to student record history",
        "Student record-correction request approval and reject workflows",
      ],
    },
    {
      title: "4. Student Self-Service Portal",
      icon: Users,
      color: "text-purple-700 bg-purple-100",
      features: [
        "Personal academic identity card with masked APAAR ID display",
        "Transparent real-time tracking of institutional verification status",
        "Formal record-correction submission workflow with document evidence notes",
        "Data-sharing consent review under Indian DPDP Act guidelines",
        "Downloadable personal academic verification confirmation slip",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />

      <main className="flex-1 py-12 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 mb-3">
            <Check className="h-3.5 w-3.5" />
            Complete Feature Matrix
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Comprehensive Platform Capabilities
          </h1>
          <p className="mt-3 text-sm text-slate-600 max-w-2xl mx-auto">
            Engineered to fulfill all operational, security, and auditing mandates of the Smart India Hackathon 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureGroups.map((group, idx) => {
            const Icon = group.icon;
            return (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${group.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{group.title}</h2>
                </div>
                <ul className="space-y-2.5 pt-2">
                  {group.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                      <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
