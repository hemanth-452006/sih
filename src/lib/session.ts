import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Role } from "./types";
import { DemoUser } from "./demo-data";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  institutionId?: string;
  institutionName?: string;
  departmentName?: string;
  studentId?: string;
}

export const SESSION_COOKIE_NAME = "apaar_auth_session";

const SESSION_COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
};

function toSessionPayload(user: DemoUser | UserSession): UserSession {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    institutionId: user.institutionId,
    institutionName: user.institutionName,
    departmentName: user.departmentName,
    studentId: "studentId" in user ? user.studentId : undefined,
  };
}

function encodeSession(user: DemoUser | UserSession): string {
  return Buffer.from(JSON.stringify(toSessionPayload(user))).toString("base64");
}

export async function getCurrentSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(sessionCookie.value, "base64").toString("utf-8")) as UserSession;
  } catch {
    return null;
  }
}

export async function requireAuth(allowedRoles?: Role[]): Promise<UserSession> {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: Authentication required");
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    throw new Error(`FORBIDDEN: Access restricted. Required role: ${allowedRoles.join(" or ")}`);
  }

  return session;
}

export function attachSessionCookie(response: NextResponse, user: DemoUser | UserSession) {
  response.cookies.set(SESSION_COOKIE_NAME, encodeSession(user), SESSION_COOKIE_OPTIONS);
  return response;
}

export function clearSessionFromResponse(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return response;
}

export async function setSessionCookie(user: DemoUser | UserSession) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, encodeSession(user), SESSION_COOKIE_OPTIONS);
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
