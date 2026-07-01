import { InputFile } from "../types";

const PDF2DOCX_URL = process.env.PDF2DOCX_URL || "http://localhost:8000";

export async function convertPdfToWord(file: InputFile): Promise<Buffer> {
  const form = new FormData();
  const blob = new Blob([new Uint8Array(file.buffer)], { type: "application/pdf" });
  form.append("file", blob, file.filename);

  const response = await fetch(`${PDF2DOCX_URL}/convert`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PDF → Word 변환 실패: ${text || response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
