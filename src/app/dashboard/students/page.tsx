"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Download,
  Filter,
  Eye,
  EyeOff,
  MoreHorizontal,
  Archive,
  RotateCcw,
  Edit2,
  FileCheck,
  Building2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { maskApaarId, formatApaarId } from "@/lib/apaar-security";
import { StudentRecord } from "@/lib/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [showUnmasked, setShowUnmasked] = useState(false);

  // Dialogs
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    internalId: "",
    apaarId: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "Male",
    email: "",
    phone: "",
    departmentName: "Computer Science & Engineering",
    courseName: "B.Tech in Computer Science and Engineering",
    academicYear: "2024-2025",
    admissionYear: 2024,
    semester: 1,
    enrollmentStatus: "ACTIVE",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (verificationFilter) params.set("verificationStatus", verificationFilter);
      if (includeArchived) params.set("includeArchived", "true");

      const res = await fetch(`/api/students?${params.toString()}`);
      const data = await res.json();
      setStudents(data.students || []);
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, statusFilter, verificationFilter, includeArchived]);

  // Handle Add Student
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          institutionId: "inst-dit-001",
          institutionName: "Delhi Institute of Technology (Autonomous)",
          institutionCode: "AICTE-ND-001",
          departmentId: "dept-cse",
          courseId: "course-btech-cse",
          verificationStatus: "PENDING_VERIFICATION",
          hasDocument: true,
          documentType: "Institutional Admission Record",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create student");

      setAddModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      setFormError(err.message || "Error submitting student");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Edit Student
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setFormSubmitting(true);

    try {
      const res = await fetch(`/api/students/${editingStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update student");

      setEditModalOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Archive / Restore
  const handleArchiveToggle = async (student: StudentRecord) => {
    try {
      if (student.isArchived) {
        await fetch(`/api/students/${student.id}`, { method: "POST" });
      } else {
        await fetch(`/api/students/${student.id}`, { method: "DELETE" });
      }
      fetchStudents();
    } catch (err) {
      console.error("Archive toggle failed", err);
    }
  };

  // Handle Export CSV
  const handleExportCsv = async () => {
    try {
      const res = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType: "STUDENT_ENROLMENT" }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Student_Directory_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const openEdit = (s: StudentRecord) => {
    setEditingStudent(s);
    setFormData({
      internalId: s.internalId,
      apaarId: s.apaarId || "",
      firstName: s.firstName,
      lastName: s.lastName,
      dateOfBirth: s.dateOfBirth?.split("T")[0] || "",
      gender: s.gender,
      email: s.email,
      phone: s.phone,
      departmentName: s.departmentName,
      courseName: s.courseName,
      academicYear: s.academicYear,
      admissionYear: s.admissionYear,
      semester: s.semester,
      enrollmentStatus: s.enrollmentStatus,
    });
    setFormError(null);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Student Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage academic records, masked APAAR identifiers, duplicate flags, and verification status.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUnmasked(!showUnmasked)}
            className="text-xs"
            title="Toggle APAAR ID Masking for Authorized Inspection"
          >
            {showUnmasked ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
            {showUnmasked ? "Mask APAAR IDs" : "Reveal APAAR IDs"}
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportCsv} className="text-xs">
            <Download className="h-3.5 w-3.5 mr-1" />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setFormData({
                internalId: `DIT-2024-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
                apaarId: `9000-0000-${Math.floor(1000 + Math.random() * 9000)}`,
                firstName: "",
                lastName: "",
                dateOfBirth: "2005-01-01",
                gender: "Male",
                email: "",
                phone: "+91 ",
                departmentName: "Computer Science & Engineering",
                courseName: "B.Tech in Computer Science and Engineering",
                academicYear: "2024-2025",
                admissionYear: 2024,
                semester: 1,
                enrollmentStatus: "ACTIVE",
              });
              setFormError(null);
              setAddModalOpen(true);
            }}
            className="bg-blue-700 hover:bg-blue-800 text-white text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by student name, roll number, or APAAR ID..."
            className="pl-9 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
          <select
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
          >
            <option value="">All Verification Status</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="NEEDS_CORRECTION">Needs Correction</option>
            <option value="CONFLICT_DETECTED">Conflict Detected</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Enrollment</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="GRADUATED">Graduated</option>
          </select>

          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none shrink-0 pl-1">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Show Archived</span>
          </label>
        </div>
      </div>

      {/* Main Student Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[120px]">Roll / Internal ID</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>APAAR ID</TableHead>
              <TableHead>Programme / Branch</TableHead>
              <TableHead>Batch / Year</TableHead>
              <TableHead>Enrolment</TableHead>
              <TableHead>Verification Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-xs text-slate-500">
                  Loading student records from database...
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-xs text-slate-500">
                  No student records match the search or filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id} className={student.isArchived ? "opacity-60 bg-slate-50/50" : ""}>
                  <TableCell className="font-mono text-xs font-bold text-slate-900">
                    <Link
                      href={`/dashboard/students/${student.id}`}
                      className="text-blue-700 hover:underline flex items-center gap-1"
                    >
                      {student.internalId}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900 text-xs">{student.fullName}</div>
                    <div className="text-[10px] text-slate-500">{student.email}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {showUnmasked ? (
                      <span className="text-slate-900 font-bold bg-slate-100 px-1 py-0.5 rounded">
                        {student.apaarId ? formatApaarId(student.apaarId) : "NOT ISSUED"}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium">
                        {maskApaarId(student.apaarId)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-medium text-slate-800">{student.courseName}</div>
                    <div className="text-[10px] text-slate-500">{student.departmentName}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {student.academicYear} (Sem {student.semester})
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={student.enrollmentStatus} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={student.verificationStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/students/${student.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-700" title="Inspect Record">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(student)}
                        className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900"
                        title="Edit Record"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchiveToggle(student)}
                        className={`h-7 w-7 p-0 ${student.isArchived ? "text-emerald-700 hover:bg-emerald-50" : "text-red-600 hover:bg-red-50"}`}
                        title={student.isArchived ? "Restore Record" : "Archive Record"}
                      >
                        {student.isArchived ? <RotateCcw className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {students.length} student records</span>
          <span>Security Notice: Masked view complies with DPDP Act 2023</span>
        </div>
      </div>

      {/* Add Student Modal Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Student Academic Record</DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              {formError}
            </div>
          )}

          <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="internalId">Internal Roll / Registration ID *</Label>
                <Input
                  id="internalId"
                  required
                  placeholder="e.g. DIT-2024-CS15"
                  value={formData.internalId}
                  onChange={(e) => setFormData({ ...formData, internalId: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="apaarId">12-Digit APAAR ID (Masked on Save)</Label>
                <Input
                  id="apaarId"
                  placeholder="e.g. 9000-0000-1234"
                  value={formData.apaarId}
                  onChange={(e) => setFormData({ ...formData, apaarId: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dob">Date of Birth (YYYY-MM-DD) *</Label>
                <Input
                  id="dob"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Student Institutional Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@dit.edu.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Contact Mobile</Label>
                <Input
                  id="phone"
                  placeholder="+91 98765 00000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="courseName">Enrolled Academic Course</Label>
                <select
                  id="courseName"
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                >
                  <option>B.Tech in Computer Science and Engineering</option>
                  <option>B.Tech in Electronics & Communication</option>
                  <option>M.Tech in Artificial Intelligence & Data Science</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={formSubmitting}
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                {formSubmitting ? "Validating & Adding..." : "Confirm & Save Student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Modal Dialog */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student Academic Record</DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              {formError}
            </div>
          )}

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editEmail">Email Address</Label>
                <Input
                  id="editEmail"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="editStatus">Enrollment Status</Label>
                <select
                  id="editStatus"
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.enrollmentStatus}
                  onChange={(e) => setFormData({ ...formData, enrollmentStatus: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="GRADUATED">GRADUATED</option>
                  <option value="DROPPED">DROPPED</option>
                  <option value="TRANSFERRED">TRANSFERRED</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={formSubmitting}
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                {formSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
