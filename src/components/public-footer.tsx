import Link from "next/link";
import { Shield, ExternalLink, CheckCircle2 } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 mt-auto">
      {/* Disclaimer Banner */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
            <span className="font-semibold text-slate-200">Regulatory & Academic Notice:</span>
            <span>
              This application is built for the Smart India Hackathon 2026. All student and institutional records displayed in demo mode use synthetic identities.
            </span>
          </div>
          <span className="text-[11px] text-slate-500">SIH-2026 Problem Statement Solution</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Shield className="h-5 w-5 text-amber-400" />
              <span>APAAR Verify</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AICTE-Approved Intelligent Academic Record Management, Duplicate Student Identifier Detection, and Sanctioned Intake Monitoring System.
            </p>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Indian DPDP Act 2023 Compliant Architecture
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/dashboard/aicte" className="hover:text-white transition-colors">
                  AICTE Central Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/college" className="hover:text-white transition-colors">
                  College Administration
                </Link>
              </li>
              <li>
                <Link href="/dashboard/verification" className="hover:text-white transition-colors">
                  Verification Workspace
                </Link>
              </li>
              <li>
                <Link href="/dashboard/duplicates" className="hover:text-white transition-colors">
                  Duplicate Detection Engine
                </Link>
              </li>
              <li>
                <Link href="/dashboard/imports" className="hover:text-white transition-colors">
                  9-Step Excel/CSV Wizard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Compliance & Safety
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/security" className="hover:text-white transition-colors">
                  HMAC APAAR Fingerprinting
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-white transition-colors">
                  Role-Based Isolation (RBAC)
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  Cross-Institution Duplicate Alerts
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Intake Capacity Monitoring
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Nodal Officer Helpdesk
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Portals */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Government Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://www.aicte-india.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  AICTE Official Portal <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://apaar.education.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  Ministry of Education APAAR <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.sih.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  Smart India Hackathon 2026 <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.digilocker.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  National Academic Depository (NAD) <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 AICTE APAAR Verify Platform. Smart India Hackathon Edition.</p>
          <div className="flex gap-4">
            <Link href="/security" className="hover:text-slate-400">
              Privacy & Consent Policy
            </Link>
            <Link href="/about" className="hover:text-slate-400">
              Terms of Use
            </Link>
            <Link href="/contact" className="hover:text-slate-400">
              Security Vulnerability Disclosure
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
