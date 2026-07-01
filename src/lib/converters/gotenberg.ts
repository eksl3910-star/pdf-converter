import { InputFile } from "../types";
import { convertWithLibreOffice } from "./libreoffice";

const GOTENBERG_URL = process.env.GOTENBERG_URL || "http://localhost:3001";

async function gotenbergConvert(
  endpoint: string,
  file: InputFile,
  extraFields?: Record<string, string>,
): Promise<Buffer> {
  const form = new FormData();
  const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimeType });
  form.append("files", blob, file.filename);

  if (extraFields) {
    for (const [key, value] of Object.entries(extraFields)) {
      form.append(key, value);
    }
  }

  const response = await fetch(`${GOTENBERG_URL}${endpoint}`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gotenberg 변환 실패: ${text || response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function gotenbergAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${GOTENBERG_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function convertOfficeToPdf(file: InputFile): Promise<Buffer> {
  if (await gotenbergAvailable()) {
    return gotenbergConvert("/forms/libreoffice/convert", file);
  }
  return convertWithLibreOffice(file);
}

export async function convertHtmlToPdf(file: InputFile): Promise<Buffer> {
  if (await gotenbergAvailable()) {
    return gotenbergConvert("/forms/chromium/convert/html", file);
  }
  throw new Error(
    "HTML→PDF는 Gotenberg(Docker)가 필요합니다. docker compose up -d gotenberg 실행 후 다시 시도하세요.",
  );
}

export async function convertWordToPdf(file: InputFile): Promise<Buffer> {
  return convertOfficeToPdf(file);
}

export async function convertExcelToPdf(file: InputFile): Promise<Buffer> {
  return convertOfficeToPdf(file);
}

export async function convertPptToPdf(file: InputFile): Promise<Buffer> {
  return convertOfficeToPdf(file);
}
