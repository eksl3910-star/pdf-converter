import { execFile } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { readFile } from "fs/promises";
import JSZip from "jszip";
import { InputFile } from "../types";
import { createTempDir, cleanupTempDir, writeTempFile } from "../temp-files";

const execFileAsync = promisify(execFile);

export async function compressPdf(file: InputFile): Promise<Buffer> {
  const dir = await createTempDir();

  try {
    const inputPath = await writeTempFile(dir, file.filename, file.buffer);
    const outputPath = join(dir, "compressed.pdf");

    await execFileAsync("gs", [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      "-dPDFSETTINGS=/ebook",
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      `-sOutputFile=${outputPath}`,
      inputPath,
    ]);

    return await readFile(outputPath);
  } finally {
    await cleanupTempDir(dir);
  }
}

export function getImageOutputFilename(
  originalFilename: string,
  format: "png" | "jpeg",
  isZip: boolean,
): string {
  const base = originalFilename.replace(/\.pdf$/i, "");
  if (isZip) return `${base}_images.zip`;
  return `${base}.${format === "jpeg" ? "jpg" : "png"}`;
}

export async function pdfToImagesWithMeta(
  file: InputFile,
  format: "png" | "jpeg" = "png",
): Promise<{ buffer: Buffer; isZip: boolean }> {
  const dir = await createTempDir();

  try {
    const inputPath = await writeTempFile(dir, file.filename, file.buffer);
    const outputPrefix = join(dir, "page");
    const ext = format === "jpeg" ? "jpg" : "png";

    const args =
      format === "jpeg"
        ? ["-jpeg", "-r", "150", inputPath, outputPrefix]
        : ["-png", "-r", "150", inputPath, outputPrefix];

    await execFileAsync("pdftoppm", args);

    const { readdir } = await import("fs/promises");
    const files = (await readdir(dir))
      .filter((name) => name.startsWith("page-") && name.endsWith(`.${ext}`))
      .sort();

    if (files.length === 0) {
      throw new Error("PDF에서 이미지를 추출하지 못했습니다.");
    }

    if (files.length === 1) {
      return {
        buffer: await readFile(join(dir, files[0])),
        isZip: false,
      };
    }

    const zip = new JSZip();

    for (const name of files) {
      const content = await readFile(join(dir, name));
      zip.file(name, content);
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    return { buffer: Buffer.from(zipBuffer), isZip: true };
  } finally {
    await cleanupTempDir(dir);
  }
}
