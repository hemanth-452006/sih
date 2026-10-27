import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();
  return NextResponse.json({ session });
}

export async function POST() {
  return NextResponse.json({ success: true });
}
