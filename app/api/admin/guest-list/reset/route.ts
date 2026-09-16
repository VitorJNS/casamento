import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { PRESENCE_TAG } from "@/lib/presence-dashboard";
import { getPrisma, withPrismaRetry } from "@/lib/prisma";
import {
  failRequestMetric,
  finishRequestMetric,
  startRequestMetric,
} from "@/lib/request-metrics";
import {
  ensureGuestListTable,
  ensureRsvpTable,
  GUEST_LIST_TAG,
  RSVP_TAG,
} from "@/lib/rsvp-store";

export const runtime = "nodejs";
export const preferredRegion = "gru1";

async function requireAdminApiAuth() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Nao autorizado.",
        },
      },
      { status: 401 },
    );
  }

  return null;
}

export async function POST(request: Request) {
  const metric = startRequestMetric("/api/admin/guest-list/reset", "POST", request);
  const authError = await requireAdminApiAuth();
  if (authError) {
    finishRequestMetric(metric, 401);
    return authError;
  }

  try {
    await ensureRsvpTable();
    await ensureGuestListTable();

    const prisma = getPrisma();

    await withPrismaRetry(async () => {
      await prisma.$executeRawUnsafe("DELETE FROM rsvp_confirmations;");
      await prisma.$executeRawUnsafe("DELETE FROM guest_list_entries;");
    });

    revalidateTag(GUEST_LIST_TAG, { expire: 0 });
    revalidateTag(RSVP_TAG, { expire: 0 });
    revalidateTag(PRESENCE_TAG, { expire: 0 });
    revalidatePath("/admin/convidados");
    revalidatePath("/admin/dashboard");
    revalidatePath("/cerimonial/dashboard");

    finishRequestMetric(metric, 200);
    return NextResponse.json({ success: true });
  } catch (error) {
    failRequestMetric(metric, error);
    console.error("Nao foi possivel limpar convidados e confirmacoes.", error);
    return NextResponse.json(
      {
        error: {
          code: "RESET_GUESTS_FAILED",
          message:
            "Nao foi possivel limpar os convidados agora. Tente novamente em alguns instantes.",
        },
      },
      { status: 500 },
    );
  }
}
