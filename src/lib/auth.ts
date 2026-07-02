import { NextRequest, NextResponse } from "next/server";

export function checkBasicAuth(request: NextRequest): NextResponse | null {
  const password = process.env.SITE_PASSWORD;

  if (!password) {
    return null;
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    const encoded = authHeader.slice(6);
    const decoded = atob(encoded);
    const [, pass] = decoded.split(":");

    if (pass === password) {
      return null;
    }
  }

  return new NextResponse("인증이 필요합니다.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="PDF Converter"',
    },
  });
}
