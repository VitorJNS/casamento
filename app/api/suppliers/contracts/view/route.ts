import { get } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isCerimonialAuthenticated } from "@/lib/cerimonial-auth";

export const runtime = "nodejs";
export const preferredRegion = "gru1";

function getDownloadFilename(pathname: string) {
  const lastSegment = pathname.split("/").pop() || "contrato.pdf";
  return lastSegment.replace(/^[0-9a-f-]+-/i, "") || "contrato.pdf";
}

export async function GET(request: NextRequest) {
  const authenticated =
    (await isAdminAuthenticated().catch(() => false)) ||
    (await isCerimonialAuthenticated().catch(() => false));

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

  const pathname = request.nextUrl.searchParams.get("pathname");

  if (!pathname) {
    return NextResponse.json(
      {
        error: {
          code: "MISSING_PATHNAME",
          message: "Contrato nao informado.",
        },
      },
      { status: 400 },
    );
  }

  const result = await get(pathname, { access: "private" });

  if (result?.statusCode !== 200) {
    return new NextResponse("Contrato nao encontrado.", { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Disposition": `inline; filename="${getDownloadFilename(pathname)}"`,
      "Content-Type": result.blob.contentType || "application/pdf",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
