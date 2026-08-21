import { NextResponse } from "next/server";

export function apiError(
  error: string,
  details = "",
  status = 500
) {
  return NextResponse.json(
    {
      success: false,
      error,
      details,
    },
    { status }
  );
}

export function persistenceError(error: unknown) {
  console.error(error);

  return apiError(
    "Persistence is unavailable.",
    "Configure DATABASE_URL, POSTGRES_PRISMA_URL, or POSTGRES_URL and run the Prisma migrations.",
    503
  );
}
