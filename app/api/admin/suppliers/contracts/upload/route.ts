import { put } from "@vercel/blob";
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

    if (!request.body) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_FILE",
            message: "Selecione um arquivo de contrato.",
          },
        },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const filename = sanitizeFilename(searchParams.get("filename") ?? "contrato.pdf");
    const contentType = request.headers.get("content-type") ?? "application/pdf";
    const contentLength = Number(request.headers.get("content-length") ?? 0);

    if (!filename.endsWith(".pdf") || !contentType.includes("application/pdf")) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_FILE_TYPE",
            message: "Envie um arquivo PDF.",
          },
        },
        { status: 400 },
      );
    }

    if (contentLength > MAX_CONTRACT_FILE_SIZE) {
      return NextResponse.json(
        {
          error: {
            code: "FILE_TOO_LARGE",
            message: "O contrato precisa ter ate 10 MB.",
          },
        },
        { status: 400 },
      );
    }

    const pathname = `supplier-contracts/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${filename}`;
    const blob = await put(pathname, request.body, {
      access: "private",
      contentType: "application/pdf",
    });

    return NextResponse.json({
      contractUrl: blob.pathname,
      pathname: blob.pathname,
    });
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
