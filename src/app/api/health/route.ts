import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function check(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  const gotenbergUrl = process.env.GOTENBERG_URL?.trim();
  const pdf2docxUrl = process.env.PDF2DOCX_URL?.trim();

  const gotenberg = gotenbergUrl ? await check(`${gotenbergUrl}/health`) : false;
  const pdf2docx = pdf2docxUrl ? await check(`${pdf2docxUrl}/health`) : false;

  return NextResponse.json({
    status: "ok",
    services: {
      gotenberg,
      pdf2docx,
    },
  });
}
