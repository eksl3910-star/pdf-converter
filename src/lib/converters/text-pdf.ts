import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import sharp from "sharp";
import { InputFile } from "../types";

export async function convertImagesToPdf(files: InputFile[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const image = sharp(file.buffer);
    const metadata = await image.metadata();
    const format = metadata.format;

    let embedImage;
    if (format === "png") {
      embedImage = await pdfDoc.embedPng(file.buffer);
    } else {
      const jpegBuffer = await image.jpeg({ quality: 90 }).toBuffer();
      embedImage = await pdfDoc.embedJpg(jpegBuffer);
    }

    const { width, height } = embedImage.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embedImage, { x: 0, y: 0, width, height });
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

export async function convertTextToPdf(file: InputFile): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const text = file.buffer.toString("utf-8");

  const fontSize = 12;
  const margin = 50;
  const pageWidth = 595;
  const pageHeight = 842;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = fontSize * 1.4;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const wrapped = wrapText(line, font, fontSize, maxWidth);

    for (const wrappedLine of wrapped) {
      if (y < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      page.drawText(wrappedLine, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    }
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

function wrapText(
  text: string,
  font: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
  fontSize: number,
  maxWidth: number,
): string[] {
  if (!text) return [""];

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(test, fontSize);

    if (width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}
