import { getPrisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error("Get current user API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
