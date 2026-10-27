import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APAAR Verify — AICTE Student Data Management & Verification Platform",
  description:
    "Intelligent Student Academic Record Verification, Duplicate Detection, and Intake Compliance Monitoring for AICTE-Approved Institutions under the Smart India Hackathon 2026 Initiative.",
  keywords: [
    "AICTE",
    "APAAR ID",
    "One Nation One Student ID",
    "Student Verification",
    "Academic Record Management",
    "Duplicate Detection",
    "Intake Compliance",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        {/* Subtle National Tricolor Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-slate-100 to-emerald-600 shadow-sm" />
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
