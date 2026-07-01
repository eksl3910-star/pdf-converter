import { PDFDocument } from "pdf-lib";
import { InputFile, ConversionOption } from "../types";

export async function mergePdfs(files: InputFile[]): Promise<Buffer> {
  const merged = await PDFDocument.create();

  for (const file of files) {
    const source = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  const bytes = await merged.save();
  return Buffer.from(bytes);
}

function parsePageRange(range: string, totalPages: number): number[] {
  const indices = new Set<number>();

  for (const part of range.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = Number.parseInt(startStr, 10);
      const end = endStr ? Number.parseInt(endStr, 10) : start;

      for (let i = start; i <= end; i++) {
        if (i >= 1 && i <= totalPages) indices.add(i - 1);
      }
    } else {
      const page = Number.parseInt(trimmed, 10);
      if (page >= 1 && page <= totalPages) indices.add(page - 1);
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}

export async function splitPdf(
  file: InputFile,
  options?: ConversionOption,
): Promise<Buffer> {
  const source = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
  const totalPages = source.getPageCount();
  const range = options?.splitPages || options?.pageRange || `1-${totalPages}`;
  const pageIndices = parsePageRange(range, totalPages);

  if (pageIndices.length === 0) {
    throw new Error("유효한 페이지 범위를 입력해 주세요. (예: 1-3,5)");
  }

  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, pageIndices);
  pages.forEach((page) => output.addPage(page));

  const bytes = await output.save();
  return Buffer.from(bytes);
}
