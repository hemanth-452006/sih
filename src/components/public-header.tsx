"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, CheckCircle, Building2, UserCheck, Lock, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Features", href: "/features" },
    { label: "Security & DPDP", href: "/security" },
    { label: "Support", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Top Govt Tech Banner */}
      <div className="bg-slate-900 px-4 py-1.5 text-xs text-slate-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-200">
              Smart India Hackathon 2026
            </span>
            <span className="hidden sm:inline text-slate-400">
              | AICTE Institutional APAAR Verification Cell
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="hidden md:inline bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono">
              DEMO MODE ACTIVE
            </span>
            <span>English</span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white shadow-md ring-2 ring-blue-100">
            <Shield className="h-6 w-6 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                APAAR <span className="text-blue-700">Verify</span>
              </span>
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800">
                AICTE
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Intelligent Student Data Management & Verification Platform
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Header Action Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <Link href="/register-institution">
            <Button variant="outline" size="sm" className="text-xs font-semibold">
              <Building2 className="h-3.5 w-3.5 mr-1" />
              Register College
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-xs font-semibold shadow-sm">
              <UserCheck className="h-3.5 w-3.5 mr-1" />
              Portal Login
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                pathname === item.href
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/register-institution" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center text-xs">
                Register Institution
              </Button>
            </Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center bg-blue-700 text-xs">
                Portal Login (Demo Switcher)
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
