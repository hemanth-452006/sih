"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Building2,
  FileCheck,
  User,
  ArrowRight,
  AlertCircle,
  Lock,
  CheckCircle2,
} from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role");
  const nextPath = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  // Auto-switch if role URL param provided
  useEffect(() => {
    if (requestedRole) {
      handleQuickLogin(requestedRole);
    }
  }, [requestedRole]);

  const handleQuickLogin = async (role: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleSwitch: role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (nextPath && nextPath.startsWith("/dashboard")) {
        router.push(nextPath);
      } else if (role === "SUPER_ADMIN") router.push("/dashboard/aicte");
      else if (role === "COLLEGE_ADMIN") router.push("/dashboard/college");
      else if (role === "FACULTY") router.push("/dashboard/verification");
      else if (role === "STUDENT") router.push("/dashboard/student-portal");
      else router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to switch role");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid login credentials");

      const role = data.user?.role;
      if (nextPath && nextPath.startsWith("/dashboard")) router.push(nextPath);
      else if (role === "SUPER_ADMIN") router.push("/dashboard/aicte");
      else if (role === "COLLEGE_ADMIN") router.push("/dashboard/college");
      else if (role === "FACULTY") router.push("/dashboard/verification");
      else if (role === "STUDENT") router.push("/dashboard/student-portal");
      else router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />

      <main className="flex-1 py-12 mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 mb-3">
            <Lock className="h-3.5 w-3.5" />
            Authorized Portal Access
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Sign In to APAAR Verify</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Sign in with institutional credentials or choose an evaluator demo persona below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Quick Demo Switcher Cards (Left 6 cols) */}
          <div className="md:col-span-6 space-y-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-blue-700" />
                1-Click Evaluator Personas
              </span>
              <p className="text-xs text-blue-800 mt-1">
                Click any role to test its specific server-enforced permissions immediately without typing:
              </p>

              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin("SUPER_ADMIN")}
                  className="w-full text-left p-3 rounded-lg bg-white border border-blue-200 hover:border-blue-400 hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-blue-100 text-blue-800">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                        AICTE Super Administrator
                      </div>
                      <div className="text-[11px] text-slate-500">Dr. K. Chandrasekhar (Central Bureau)</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-700" />
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin("COLLEGE_ADMIN")}
                  className="w-full text-left p-3 rounded-lg bg-white border border-emerald-200 hover:border-emerald-400 hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-emerald-100 text-emerald-800">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                        College Administrator
                      </div>
                      <div className="text-[11px] text-slate-500">Prof. S. R. Vardhan (Delhi Inst of Tech)</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-700" />
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin("FACULTY")}
                  className="w-full text-left p-3 rounded-lg bg-white border border-amber-200 hover:border-amber-400 hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-amber-100 text-amber-800">
                      <FileCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700">
                        Verification Officer
                      </div>
                      <div className="text-[11px] text-slate-500">Dr. Meenakshi S. (Verification Cell)</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-700" />
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin("STUDENT")}
                  className="w-full text-left p-3 rounded-lg bg-white border border-purple-200 hover:border-purple-400 hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-purple-100 text-purple-800">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
                        Student Account
                      </div>
                      <div className="text-[11px] text-slate-500">Rahul Sharma (CSE Student Portal)</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-700" />
                </button>
              </div>
            </div>
          </div>

          {/* Standard Form (Right 6 cols) */}
          <div className="md:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Credentials Login</h3>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Registered Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="aicte.admin@aicte-india.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setRecoveryOpen(true)}
                    className="text-[11px] text-blue-700 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold"
              >
                {loading ? "Verifying Session..." : "Sign In to Portal"}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Not registered yet?{" "}
              <Link href="/register-institution" className="text-blue-700 font-semibold hover:underline">
                Register Your College
              </Link>
            </div>
          </div>
        </div>

        {/* Account Recovery Dialog */}
        {recoveryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-900">Account Password Recovery</h3>
              {recoverySent ? (
                <div className="text-center py-4 space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <p className="text-xs text-slate-600">
                    A password reset link has been dispatched to your registered institutional nodal email address.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRecoveryOpen(false);
                      setRecoverySent(false);
                    }}
                    className="mt-2 text-xs"
                  >
                    Return to Login
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">
                    Enter your official institutional email. An OTP verification link will be issued to your nodal authority.
                  </p>
                  <Input placeholder="e.g. admin@dit.edu.in" />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRecoveryOpen(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setRecoverySent(true)}
                      className="bg-blue-700 text-xs text-white"
                    >
                      Send Recovery Link
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
