import { getPrisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/crypto";
import { createSessionToken } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Generate session token
    const token = await createSessionToken(user.id, user.email);

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: "Signed in successfully.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Sign-in API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during sign-in." },
      { status: 500 }
    );
  }
}
