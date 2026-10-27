"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  FileCheck,
  RefreshCw,
  AlertCircle,
  FileText,
  Table as TableIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RowValidationResult } from "@/lib/types";

export default function BulkUploadPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState({
    internalId: "RollNumber",
    apaarId: "APAAR_ID",
    firstName: "FirstName",
    lastName: "LastName",
    dateOfBirth: "DOB",
    gender: "Gender",
    email: "Email",
    phone: "Phone",
    course: "Course",
  });
  const [validationResults, setValidationResults] = useState<RowValidationResult[]>([]);
  const [validationSummary, setValidationSummary] = useState<any>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<any>(null);

  // Sample CSV Data Generator for instant testing
  const sampleCsvContent = `RollNumber,APAAR_ID,FirstName,LastName,DOB,Gender,Email,Phone,Course
DIT-2024-CS50,9000-0000-5001,Amit,Verma,2005-02-14,Male,amit.v@student.dit.edu.in,+91 91234 56789,B.Tech in Computer Science and Engineering
DIT-2024-CS51,9000-0000-5002,Divya,Rao,2005-05-20,Female,divya.r@student.dit.edu.in,+91 92345 67890,B.Tech in Computer Science and Engineering
DIT-2024-CS01,9000-0000-1001,Rahul,Sharma,2005-04-12,Male,rahul.dup@dit.edu.in,+91 98765 43210,B.Tech in Computer Science and Engineering
DIT-2024-ERR1,,MissingName,,2005-99-99,Male,invalid-email,+91 90000 00000,B.Tech in Computer Science and Engineering`;

  const downloadSampleTemplate = () => {
    const blob = new Blob([sampleCsvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "APAAR_Student_Import_Sample_Template.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Simple CSV Text Parser
  const parseCsvText = (text: string) => {
    const lines = text.trim().split(/\r\n|\n/);
    if (lines.length < 2) return;

    const rawHeaders = lines[0].split(",").map((h) => h.trim());
    setHeaders(rawHeaders);

    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(",").map((v) => v.trim());
      const rowObj: any = {};
      rawHeaders.forEach((h, idx) => {
        rowObj[h] = values[idx] || "";
      });
      rows.push(rowObj);
    }

    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setFileName(uploadedFile.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      parseCsvText(text);
      setCurrentStep(2); // Move to Step 2: Preview
    };
    reader.readAsText(uploadedFile);
  };

  const loadSampleIntoWizard = () => {
    setFileName("Sample_AICTE_Batch.csv");
    parseCsvText(sampleCsvContent);
    setCurrentStep(2);
  };

  // Step 4 & 5: Run server validation
  const runValidation = async () => {
    setValidating(true);
    try {
      const res = await fetch("/api/imports/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: parsedRows,
          columnMapping,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Validation failed");

      setValidationResults(data.results || []);
      setValidationSummary(data.summary || null);
      setCurrentStep(6); // Move to Step 6: Error Report & Pre-import summary
    } catch (err: any) {
      alert(err.message || "Validation error");
    } finally {
      setValidating(false);
    }
  };

  // Step 7: Download Error Report CSV
  const downloadErrorReport = () => {
    const errorRows = validationResults.filter((r) => !r.isValid);
    if (errorRows.length === 0) return;

    const csvLines = [
      "RowNumber,RollNumber,StudentName,ErrorField,ErrorMessage,DuplicateConflictReason",
      ...errorRows.map((r) => {
        const errorMsg = r.errors.map((e) => `${e.field}: ${e.message}`).join("; ");
        const dupMsg = r.duplicateDetails || r.conflictDetails || "None";
        return `${r.rowNumber},"${r.data.internalId || ""}","${r.data.firstName || ""} ${r.data.lastName || ""}","${r.errors.map((e) => e.field).join("|")}","${errorMsg}","${dupMsg}"`;
      }),
    ];

    const blob = new Blob([csvLines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Import_Errors_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Step 8: Confirm Import Transaction
  const executeImport = async () => {
    const validRows = validationResults.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setImporting(true);
    try {
      const res = await fetch("/api/imports/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          validRows,
          fileName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setImportSummary(data);
      setCurrentStep(9); // Move to Step 9: Final Import Summary
    } catch (err: any) {
      alert(err.message || "Import execution failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              9-Step Bulk Spreadsheet Ingestion Wizard
            </h1>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
              CSV / Excel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingest student cohorts safely with column mapping, syntax checks, duplicate scanning, and error reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadSampleTemplate} className="text-xs">
            <Download className="h-3.5 w-3.5 mr-1" />
            Download Sample CSV Template
          </Button>
        </div>
      </div>

      {/* 9-Step Progress Tracker */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-1 text-center text-[10px] font-semibold">
          {[
            { step: 1, title: "1. Upload" },
            { step: 2, title: "2. Preview" },
            { step: 3, title: "3. Mapping" },
            { step: 4, title: "4. Validate" },
            { step: 5, title: "5. Duplicates" },
            { step: 6, title: "6. Errors" },
            { step: 7, title: "7. Export Err" },
            { step: 8, title: "8. Confirm" },
            { step: 9, title: "9. Summary" },
          ].map((item) => (
            <div
              key={item.step}
              className={`py-1.5 px-1 rounded transition-colors ${
                currentStep === item.step
                  ? "bg-blue-600 text-white font-bold"
                  : currentStep > item.step
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-slate-50 text-slate-400"
              }`}
            >
              {item.title}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Upload File */}
      {currentStep === 1 && (
        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900">
              Step 1: Upload Student Admission Spreadsheet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block">
                  Select CSV or Excel Spreadsheet
                </span>
                <span className="text-xs text-slate-500">
                  Supported formats: .csv, .xlsx, .xls (Maximum size: 15MB)
                </span>
              </div>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white text-xs cursor-pointer">
                  Browse Local Files
                </Button>
              </label>
            </div>

            {/* Quick Test Demo Button */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-900">
              <div>
                <span className="font-bold">Instant Hackathon Demo:</span> Don't have a CSV handy? Click to load a pre-configured test dataset containing valid records, duplicates, and format errors:
              </div>
              <Button
                size="sm"
                onClick={loadSampleIntoWizard}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs shrink-0"
              >
                Load Sample Test Batch
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Sheet Preview */}
      {currentStep === 2 && (
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Step 2: Sheet Preview ({parsedRows.length} rows detected)
              </CardTitle>
              <span className="text-xs text-slate-500">File: {fileName}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)} className="text-xs">
                Back
              </Button>
              <Button size="sm" onClick={() => setCurrentStep(3)} className="bg-blue-700 text-white text-xs">
                Next: Column Mapping <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border rounded-lg border-slate-200 max-h-80">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    {headers.map((h, i) => (
                      <TableHead key={i} className="text-xs font-bold text-slate-700">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedRows.slice(0, 5).map((row, rIdx) => (
                    <TableRow key={rIdx}>
                      {headers.map((h, cIdx) => (
                        <TableCell key={cIdx} className="text-xs text-slate-600">
                          {row[h] || "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Showing first 5 rows preview. All {parsedRows.length} rows will be processed in subsequent validation steps.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Column Mapping */}
      {currentStep === 3 && (
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900">
              Step 3: Map Spreadsheet Columns to Database Schema
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)} className="text-xs">
                Back
              </Button>
              <Button
                size="sm"
                onClick={runValidation}
                disabled={validating}
                className="bg-blue-700 text-white text-xs"
              >
                {validating ? "Running Validation Engine..." : "Run Step 4 & 5 Validation →"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-600">
              Confirm or map your spreadsheet header columns to the canonical student record fields:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {Object.keys(columnMapping).map((key) => (
                <div key={key} className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="font-bold text-slate-900 capitalize block">
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  <select
                    className="w-full h-8 text-xs rounded border border-slate-300 bg-white px-2 focus:ring-2 focus:ring-blue-500"
                    value={(columnMapping as any)[key]}
                    onChange={(e) =>
                      setColumnMapping({ ...columnMapping, [key]: e.target.value })
                    }
                  >
                    <option value="">-- Ignore Field --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 6, 7 & 8: Row-by-Row Error Report & Confirmation */}
      {currentStep >= 6 && currentStep <= 8 && (
        <Card className="border-slate-200 shadow-xs space-y-4">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Step 6 &amp; 7: Validation Error &amp; Duplicate Audit Report
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed scan results across all {validationSummary?.totalRows} uploaded rows.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {validationSummary?.errorCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadErrorReport}
                  className="text-xs border-red-300 text-red-800 hover:bg-red-50"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Download Error CSV (Step 7)
                </Button>
              )}

              {validationSummary?.validCount > 0 && (
                <Button
                  size="sm"
                  disabled={importing}
                  onClick={executeImport}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  {importing
                    ? "Importing Valid Records..."
                    : `Confirm & Import ${validationSummary.validCount} Valid Records (Step 8) →`}
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Summary KPI Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Total Scanned Rows</span>
                <span className="text-lg font-bold text-slate-900">{validationSummary?.totalRows}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <span className="text-emerald-700 block">Valid Ready to Import</span>
                <span className="text-lg font-bold text-emerald-800">{validationSummary?.validCount}</span>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <span className="text-red-700 block">Syntax / Format Errors</span>
                <span className="text-lg font-bold text-red-800">{validationSummary?.errorCount}</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <span className="text-amber-700 block">Duplicate Flags</span>
                <span className="text-lg font-bold text-amber-800">{validationSummary?.duplicateCount}</span>
              </div>
            </div>

            {/* Row-by-Row Table */}
            <div className="overflow-x-auto border rounded-lg border-slate-200 max-h-96">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-16">Row #</TableHead>
                    <TableHead>Roll ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>APAAR ID</TableHead>
                    <TableHead>Validation Result</TableHead>
                    <TableHead>Audit / Rejection Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationResults.map((r) => (
                    <TableRow key={r.rowNumber} className={!r.isValid ? "bg-red-50/30" : ""}>
                      <TableCell className="font-mono text-xs">{r.rowNumber}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-slate-900">
                        {r.data.internalId || "<Missing>"}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-800">
                        {r.data.firstName || "<Missing>"} {r.data.lastName || ""}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {r.data.apaarId || "None"}
                      </TableCell>
                      <TableCell>
                        {r.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                            <CheckCircle2 className="h-3 w-3" /> Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                            <AlertTriangle className="h-3 w-3" /> Rejected
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        {r.errors.length > 0 && (
                          <div className="text-red-700">
                            {r.errors.map((e) => `${e.field}: ${e.message}`).join(", ")}
                          </div>
                        )}
                        {r.duplicateDetails && (
                          <div className="text-amber-700 font-medium">{r.duplicateDetails}</div>
                        )}
                        {r.conflictDetails && (
                          <div className="text-red-800 font-bold">{r.conflictDetails}</div>
                        )}
                        {r.isValid && (
                          <span className="text-slate-500">Ready for database commit.</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 9: Final Import Summary */}
      {currentStep === 9 && importSummary && (
        <Card className="border-emerald-200 bg-emerald-50/20 shadow-xs">
          <CardHeader className="text-center py-6">
            <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Step 9: Bulk Batch Import Successfully Completed!
            </CardTitle>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
              {importSummary.message} All imported students are now active and indexed with HMAC fingerprints.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center gap-3">
              <Link href="/dashboard/students">
                <Button className="bg-blue-700 hover:bg-blue-800 text-white text-xs">
                  View Student Directory →
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentStep(1);
                  setFile(null);
                  setParsedRows([]);
                  setValidationResults([]);
                  setImportSummary(null);
                }}
                className="text-xs"
              >
                Upload Another Spreadsheet Batch
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
