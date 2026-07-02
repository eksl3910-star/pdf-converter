import { NextRequest, NextResponse } from "next/server";
import { checkBasicAuth } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const denied = checkBasicAuth(request);
  if (denied) return denied;
  return NextResponse.next();
}

export const config = {
  // /api 는 대용량 업로드 — middleware 경유 시 body 잘림 방지
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
