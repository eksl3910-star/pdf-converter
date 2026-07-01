import { execFile } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { readFile } from "fs/promises";
import { access } from "fs/promises";
import { InputFile } from "../types";
import { createTempDir, cleanupTempDir, writeTempFile } from "../temp-files";

const execFileAsync = promisify(execFile);

const LIBREOFFICE_PATHS = [
  process.env.LIBREOFFICE_PATH,
  "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
  "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
  "soffice",
].filter(Boolean) as string[];

async function findLibreOffice(): Promise<string | null> {
  for (const candidate of LIBREOFFICE_PATHS) {
    try {
      if (candidate.includes("\\") || candidate.includes("/")) {
        await access(candidate);
        return candidate;
      }
      await execFileAsync(candidate, ["--version"]);
      return candidate;
    } catch {
      // try next
    }
  }
  return null;
}

export async function convertWithLibreOffice(file: InputFile): Promise<Buffer> {
  const soffice = await findLibreOffice();
  if (!soffice) {
    throw new Error(
      "LibreOffice 또는 Docker(Gotenberg)가 필요합니다. LibreOffice 설치: https://www.libreoffice.org/download/download/",
    );
  }

  const dir = await createTempDir();

  try {
    const inputPath = await writeTempFile(dir, file.filename, file.buffer);
    const outDir = join(dir, "out");
    await import("fs/promises").then((fs) => fs.mkdir(outDir, { recursive: true }));

    await execFileAsync(soffice, [
      "--headless",
      "--norestore",
      "--convert-to",
      "pdf",
      "--outdir",
      outDir,
      inputPath,
    ]);

    const baseName = file.filename.replace(/\.[^.]+$/, "");
    const pdfPath = join(outDir, `${baseName}.pdf`);
    return await readFile(pdfPath);
  } finally {
    await cleanupTempDir(dir);
  }
}

export async function isLibreOfficeAvailable(): Promise<boolean> {
  return (await findLibreOffice()) !== null;
}
