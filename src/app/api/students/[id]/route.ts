import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { getStudentById, updateStudent, archiveStudent, restoreStudent } from "@/lib/db-store";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const student = getStudentById(id);
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Enforce data isolation
    if (session.role !== "SUPER_ADMIN" && student.institutionId !== session.institutionId) {
      return NextResponse.json({ error: "Forbidden: Access restricted to authorized institution" }, { status: 403 });
    }

    return NextResponse.json({ student });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "COLLEGE_ADMIN")) {
      return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
    }

    const current = getStudentById(id);
    if (!current) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Isolation check
    if (session.role !== "SUPER_ADMIN" && current.institutionId !== session.institutionId) {
      return NextResponse.json({ error: "Forbidden: Cannot edit other institutions' students" }, { status: 403 });
    }

    const body = await req.json();
    const updated = updateStudent(id, body, {
      email: session.email,
      role: session.role,
      name: session.name,
    });

    return NextResponse.json({ success: true, student: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "COLLEGE_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const current = getStudentById(id);
    if (!current) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    if (session.role !== "SUPER_ADMIN" && current.institutionId !== session.institutionId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    archiveStudent(id, {
      email: session.email,
      role: session.role,
      name: session.name,
    });

    return NextResponse.json({ success: true, message: "Student record archived" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "COLLEGE_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    restoreStudent(id, {
      email: session.email,
      role: session.role,
      name: session.name,
    });

    return NextResponse.json({ success: true, message: "Student record restored" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
