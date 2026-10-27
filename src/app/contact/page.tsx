"use client";

import { useState } from "react";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, CheckCircle, HelpCircle } from "lucide-react";

export default function ContactPage() {
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    institution: "",
    category: "Technical Integration / API Help",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not submit your request.");
      setTicketId(result.ticket.id);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit your request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />

      <main className="flex-1 py-12 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 mb-3">
            <Mail className="h-3.5 w-3.5" />
            Support Helpdesk
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Institutional Support &amp; Grievance Redressal
          </h1>
          <p className="mt-3 text-sm text-slate-600 max-w-2xl mx-auto">
            Contact the AICTE APAAR Implementation Cell for institution onboarding assistance, verification queries, or technical integration help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Details */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Central Directorate</h3>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-blue-700 mt-0.5 shrink-0" />
                  <span>
                    Nelson Mandela Marg, Vasant Kunj, New Delhi, Delhi 110070
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-blue-700 shrink-0" />
                  <span>011-29581000 / 011-29581050</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-blue-700 shrink-0" />
                  <span>apaar.verify@aicte-india.org</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/70 rounded-xl border border-blue-200 p-5 text-xs text-blue-900 space-y-2">
              <h4 className="font-bold flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-blue-700" />
                Working Hours
              </h4>
              <p className="text-blue-800">
                Monday to Friday: 09:30 AM to 06:00 PM IST (Excluding Central Gazetted Holidays)
              </p>
            </div>
          </div>

          {/* Helpdesk Inquiry Form */}
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            {ticketId ? (
              <div className="text-center py-10 space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Support Ticket Logged</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your inquiry has been saved to the support queue. Reference ID: <strong className="font-mono text-slate-800">{ticketId}</strong>.
                </p>
                <Button variant="outline" size="sm" onClick={() => setTicketId(null)} className="mt-4">
                  Submit Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  Submit Institutional Support Request
                </h3>

                {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Officer / Staff Name</Label>
                    <Input
                      id="name"
                      required
                      placeholder="e.g. Dr. Rajesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Official Institutional Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="e.g. registrar@college.edu.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="institution">Institution Name &amp; AICTE Code</Label>
                    <Input
                      id="institution"
                      required
                      placeholder="e.g. ABC Institute of Tech (AICTE-DL-001)"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Inquiry Classification</Label>
                    <select
                      id="category"
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option>Technical Integration / API Help</option>
                      <option>Duplicate Enrolment Dispute</option>
                      <option>Approved Intake Discrepancy</option>
                      <option>Institution Onboarding Status</option>
                      <option>Grievance Redressal</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message">Detailed Description</Label>
                  <Textarea
                    id="message"
                    required
                    rows={4}
                    placeholder="Provide details regarding the student record, duplicate alert ID, or intake query..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold">
                  {submitting ? "Submitting…" : "Submit Support Ticket"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
