import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import {
  getAllCorrectionRequests,
  createCorrectionRequest,
  reviewCorrectionRequest,
  getStudentById,
} from "@/lib/db-store";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId") || undefined;
    const status = searchParams.get("status") || undefined;

    const list = getAllCorrectionRequests({ studentId, status });
    return NextResponse.json({ total: list.length, requests: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { studentId, field, currentValue, requestedValue, reason } = body;

    if (!studentId || !field || !requestedValue || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const student = getStudentById(studentId);
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const reqItem = createCorrectionRequest({
      studentId,
      studentName: student.fullName,
      field,
      currentValue: currentValue || "",
      requestedValue,
      reason,
      requestedBy: session.email,
    });

    return NextResponse.json({ success: true, request: reqItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "COLLEGE_ADMIN" && session.role !== "FACULTY")) {
      return NextResponse.json({ error: "Forbidden: Only verifiers or admins may approve corrections" }, { status: 403 });
    }

    const body = await req.json();
    const { requestId, status, reviewNotes } = body;

    if (!requestId || !status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const ok = reviewCorrectionRequest(requestId, status, reviewNotes || "", {
      email: session.email,
      role: session.role,
      name: session.name,
    });

    if (!ok) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: `Correction request marked as ${status}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
