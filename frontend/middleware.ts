import { verifySessionToken } from "./lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define protected paths and auth pages
  const isProtectedRoute = path.startsWith("/dashboard") || path.startsWith("/chat");
  const isAuthRoute = path.startsWith("/auth");

  const token = request.cookies.get("session_token")?.value;
  
  // Verify token
  let session = null;
  if (token) {
    session = await verifySessionToken(token);
  }

  // Redirect logic
  if (isProtectedRoute && !session) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    // Remember where the user was heading
    signInUrl.searchParams.set("from", path);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/auth/:path*",
  ],
};
