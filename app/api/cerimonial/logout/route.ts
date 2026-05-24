import { NextResponse } from "next/server";

import { clearCerimonialSession } from "@/lib/cerimonial-auth";

export const runtime = "nodejs";

export async function POST() {
  await clearCerimonialSession();
  return NextResponse.json({ success: true });
}

