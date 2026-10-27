import crypto from "crypto";

const HMAC_SECRET = process.env.APAAR_HMAC_SECRET || "aicte-apaar-verify-secure-hmac-salt-key-2026";

/**
 * Validates APAAR ID format:
 * Standard APAAR ID is a 12-digit unique national student identifier (e.g., 9876-5432-1098 or 987654321098).
 */
export function validateApaarFormat(apaarId: string): { isValid: boolean; normalized: string; error?: string } {
  if (!apaarId) {
    return { isValid: false, normalized: "", error: "APAAR ID is required" };
  }

  // Remove hyphens, spaces
  const clean = apaarId.replace(/[\s-]/g, "");

  if (!/^\d{12}$/.test(clean)) {
    return {
      isValid: false,
      normalized: clean,
      error: "APAAR ID must contain exactly 12 numerical digits (Format: XXXX-XXXX-XXXX)",
    };
  }

  // Check against degenerate repeating sequences like 000000000000 or 111111111111
  if (/^(\d)\1{11}$/.test(clean)) {
    return {
      isValid: false,
      normalized: clean,
      error: "Invalid APAAR ID: Repeating sequence not allowed",
    };
  }

  return { isValid: true, normalized: clean };
}

/**
 * Generates a keyed HMAC-SHA256 fingerprint for database exact-match lookup.
 * This guarantees the raw identifier is never exposed in queries or plain indexes.
 */
export function generateApaarFingerprint(rawApaarId: string): string {
  const { normalized } = validateApaarFormat(rawApaarId);
  return crypto.createHmac("sha256", HMAC_SECRET).update(normalized).digest("hex");
}

/**
 * Formats 12-digit string to canonical hyphenated display (XXXX-XXXX-XXXX)
 */
export function formatApaarId(cleanDigits: string): string {
  const digits = cleanDigits.replace(/[\s-]/g, "");
  if (digits.length !== 12) return cleanDigits;
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
}

/**
 * Mask APAAR ID for privacy: Only display the last 4 digits (****-****-1098)
 */
export function maskApaarId(rawApaarId: string | null | undefined): string {
  if (!rawApaarId) return "NOT ISSUED";
  const clean = rawApaarId.replace(/[\s-]/g, "");
  if (clean.length < 4) return "••••";
  return `••••-••••-${clean.slice(-4)}`;
}

/**
 * Generates valid-looking synthetic APAAR IDs for demo mode
 */
export function generateSyntheticApaar(seedNumber: number): string {
  // Use 9xxx series reserved for synthetic test environments
  const base = 900000000000 + (seedNumber % 999999999);
  const str = base.toString().padStart(12, "0");
  return formatApaarId(str);
}

/**
 * Sanitizes values for CSV export to prevent Formula Injection (CSV Injection / CWE-1236).
 * Any cell starting with =, +, -, @, TAB, or CR is prefixed with a single quote.
 */
export function sanitizeForCsvExport(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}
