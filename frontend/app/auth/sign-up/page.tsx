import { AuthCard } from "@/components/auth/auth-card";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#070B16] text-white">Loading...</div>}>
      <AuthCard mode="sign-up" />
    </Suspense>
  );
}
