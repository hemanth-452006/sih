"use client";

import { useState } from "react";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, CheckCircle, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function RegisterInstitutionPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    state: "Delhi",
    district: "",
    email: "",
    phone: "",
    website: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit application");

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />

      <main className="flex-1 py-12 mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 mb-3">
            <Building2 className="h-3.5 w-3.5" />
            Institutional Onboarding
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Institutional Registration &amp; Access Request
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Apply for institutional portal access to manage APAAR ID verification, student records, and approved intake compliance.
          </p>
        </div>

        {/* Demo Disclaimer */}
        <div className="mb-6 rounded-xl bg-slate-100 border border-slate-200 p-3.5 text-xs text-slate-600 flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 text-slate-500 shrink-0" />
          <span>
            <strong>Demo Notice:</strong> Applications submitted here immediately appear in the AICTE Super Administrator review queue for approval testing.
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Application Submitted to AICTE</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Your institution application for <strong>{form.name}</strong> ({form.code}) has been forwarded to the AICTE Central Bureau of Approval. Status: <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">PENDING REVIEW</span>.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <Link href="/login">
                  <Button className="bg-blue-700 hover:bg-blue-800 text-xs">
                    Login to Existing Account
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => setSuccess(false)} className="text-xs">
                  Register Another College
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="name">Full Legal Name of Institution *</Label>
                  <Input
                    id="name"
                    required
                    placeholder="e.g. National Institute of Technology Delhi"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="code">AICTE Permanent Institute ID / Code *</Label>
                  <Input
                    id="code"
                    required
                    placeholder="e.g. 1-12345678 or AICTE-DL-099"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="state">State / Union Territory *</Label>
                  <select
                    id="state"
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  >
                    <option>Delhi</option>
                    <option>Karnataka</option>
                    <option>Maharashtra</option>
                    <option>Tamil Nadu</option>
                    <option>Uttar Pradesh</option>
                    <option>Gujarat</option>
                    <option>Telangana</option>
                    <option>West Bengal</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    placeholder="e.g. New Delhi"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Official Nodal Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="e.g. registrar@nitdelhi.ac.in"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone / Landline Number</Label>
                  <Input
                    id="phone"
                    placeholder="e.g. +91 11 2345 6789"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="website">Official College Website</Label>
                  <Input
                    id="website"
                    placeholder="e.g. https://nitdelhi.ac.in"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address">Campus Physical Address</Label>
                  <Input
                    id="address"
                    placeholder="Campus building, street, postal pincode"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold"
                >
                  {loading ? "Submitting Application..." : "Submit Institutional Application"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
