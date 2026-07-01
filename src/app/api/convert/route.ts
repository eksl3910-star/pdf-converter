import { NextRequest, NextResponse } from "next/server";
import { convert } from "@/lib/converters";
import { getMaxFileSize } from "@/lib/temp-files";
import { ConversionOption, ConversionType, InputFile } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 600;

const VALID_TYPES: ConversionType[] = [
  "word-to-pdf",
  "excel-to-pdf",
  "ppt-to-pdf",
  "pdf-to-word",
  "image-to-pdf",
  "pdf-to-image",
  "text-to-pdf",
  "html-to-pdf",
  "pdf-merge",
  "pdf-split",
  "pdf-compress",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = formData.get("type") as ConversionType;
    const optionsRaw = formData.get("options");

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "유효하지 않은 변환 유형입니다." }, { status: 400 });
    }

    const fileEntries = formData.getAll("files");
    if (fileEntries.length === 0) {
      return NextResponse.json({ error: "파일을 업로드해 주세요." }, { status: 400 });
    }

    const maxSize = getMaxFileSize();
    const files: InputFile[] = [];

    for (const entry of fileEntries) {
      if (!(entry instanceof File)) continue;

      if (maxSize !== null && entry.size > maxSize) {
        return NextResponse.json(
          { error: `파일 크기는 ${Math.floor(maxSize / 1024 / 1024)}MB 이하여야 합니다.` },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await entry.arrayBuffer());
      files.push({
        buffer,
        filename: entry.name,
        mimeType: entry.type || "application/octet-stream",
      });
    }

    let options: ConversionOption | undefined;
    if (typeof optionsRaw === "string" && optionsRaw) {
      try {
        options = JSON.parse(optionsRaw) as ConversionOption;
      } catch {
        return NextResponse.json({ error: "옵션 형식이 올바르지 않습니다." }, { status: 400 });
      }
    }

    const result = await convert(type, files, options);

    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(result.filename)}"`,
        "Content-Length": String(result.buffer.length),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "변환 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
