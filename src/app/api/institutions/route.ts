import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { getAllInstitutions, updateInstitutionStatus } from "@/lib/db-store";
import { recordAuditEvent } from "@/lib/audit";

export async function GET() {
  try {
    const institutions = getAllInstitutions();
    return NextResponse.json({ total: institutions.length, institutions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, code, state, district, email, phone, website, address } = body;

    if (!name || !code || !state || !email) {
      return NextResponse.json({ error: "Institution name, code, state, and email are required" }, { status: 400 });
    }

    const newInst = {
      id: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      code: code.toUpperCase(),
      state,
      district: district || "",
      address: address || "",
      website: website || "",
      email,
      phone: phone || "",
      status: "PENDING" as const,
      createdAt: new Date().toISOString(),
      departments: [],
    };

    const institutions = getAllInstitutions();
    institutions.unshift(newInst);

    recordAuditEvent({
      actorEmail: email,
      actorRole: "COLLEGE_ADMIN",
      actorName: name,
      action: "CREATE",
      resource: "INSTITUTION",
      resourceId: newInst.id,
      institutionId: newInst.id,
      institutionName: name,
      details: `New institutional registration request submitted for ${name} (${code}). Awaiting AICTE review.`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Institutional application submitted successfully. AICTE Nodal Cell will review credentials.",
        institution: newInst,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only AICTE Central Administrators can alter institutional status" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { institutionId, status, reason } = body;

    if (!institutionId || !status || !["APPROVED", "SUSPENDED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status parameters" }, { status: 400 });
    }

    const success = updateInstitutionStatus(institutionId, status, reason || "", {
      email: session.email,
      role: session.role,
      name: session.name,
    });

    if (!success) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Institution status updated to ${status}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
