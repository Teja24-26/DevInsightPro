import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Signed out successfully.",
    });

    // Clear session cookie
    response.cookies.set("session_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Sign-out API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during sign-out." },
      { status: 500 }
    );
  }
}
