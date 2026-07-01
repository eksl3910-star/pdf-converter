import { mkdir, rm, writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const TEMP_DIR = process.env.TEMP_DIR || join(process.cwd(), "tmp", "conversions");

export async function createTempDir(): Promise<string> {
  await mkdir(TEMP_DIR, { recursive: true });
  const dir = join(TEMP_DIR, randomUUID());
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function writeTempFile(
  dir: string,
  filename: string,
  buffer: Buffer,
): Promise<string> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = join(dir, safeName);
  await writeFile(filePath, buffer);
  return filePath;
}

export async function cleanupTempDir(dir: string): Promise<void> {
  try {
    await rm(dir, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors
  }
}

export function getMaxFileSize(): number | null {
  const raw = process.env.MAX_FILE_SIZE?.trim();
  if (!raw || raw === "0" || raw.toLowerCase() === "unlimited") {
    return null;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
