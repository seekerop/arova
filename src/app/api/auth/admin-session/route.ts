import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/security/admin-auth";

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (session && session.role === "admin") {
    return NextResponse.json({
      isAdmin: true,
      email: session.email,
    });
  }

  return NextResponse.json({
    isAdmin: false,
    email: null,
  });
}
