import { getPrisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error("Sign-up API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during sign-up." },
      { status: 500 }
    );
  }
}
