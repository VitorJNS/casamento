import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const preferredRegion = "gru1";

const MAX_CONTRACT_FILE_SIZE = 10 * 1024 * 1024;

function sanitizeFilename(filename: string) {
  const fallback = "contrato.pdf";
  const normalized = filename
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return normalized || fallback;
}

export async function POST(request: Request) {
  try {
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

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error: {
            code: "BLOB_TOKEN_MISSING",
            message: "Token da Vercel Blob nao configurado.",
          },
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        const normalizedPathname = pathname.trim();
        const filename = sanitizeFilename(normalizedPathname.split("/").pop() ?? "contrato.pdf");

        if (
          !normalizedPathname.startsWith("supplier-contracts/") ||
          !filename.endsWith(".pdf")
        ) {
          throw new Error("Envie um arquivo PDF de contrato.");
        }

        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: MAX_CONTRACT_FILE_SIZE,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Nao foi possivel anexar contrato no Blob.", error);

    return NextResponse.json(
      {
        error: {
          code: "CONTRACT_UPLOAD_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Nao foi possivel anexar o contrato.",
        },
      },
      { status: 500 },
    );
  }
}
