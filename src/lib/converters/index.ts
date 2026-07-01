import {
  convertWordToPdf,
  convertExcelToPdf,
  convertPptToPdf,
  convertHtmlToPdf,
} from "./gotenberg";
import { convertPdfToWord } from "./pdf2docx";
import { convertImagesToPdf, convertTextToPdf } from "./text-pdf";
import { mergePdfs, splitPdf } from "./pdf-merge";
import {
  compressPdf,
  pdfToImagesWithMeta,
  getImageOutputFilename,
} from "./pdf-compress";
import {
  ConversionType,
  ConversionOption,
  ConvertResult,
  InputFile,
} from "../types";

function outputName(input: InputFile, ext: string): string {
  const base = input.filename.replace(/\.[^.]+$/, "");
  return `${base}.${ext}`;
}

export async function convert(
  type: ConversionType,
  files: InputFile[],
  options?: ConversionOption,
): Promise<ConvertResult> {
  if (files.length === 0) {
    throw new Error("파일을 업로드해 주세요.");
  }

  switch (type) {
    case "word-to-pdf": {
      const buffer = await convertWordToPdf(files[0]);
      return {
        buffer,
        filename: outputName(files[0], "pdf"),
        contentType: "application/pdf",
      };
    }
    case "excel-to-pdf": {
      const buffer = await convertExcelToPdf(files[0]);
      return {
        buffer,
        filename: outputName(files[0], "pdf"),
        contentType: "application/pdf",
      };
    }
    case "ppt-to-pdf": {
      const buffer = await convertPptToPdf(files[0]);
      return {
        buffer,
        filename: outputName(files[0], "pdf"),
        contentType: "application/pdf",
      };
    }
    case "pdf-to-word": {
      const buffer = await convertPdfToWord(files[0]);
      return {
        buffer,
        filename: outputName(files[0], "docx"),
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };
    }
    case "image-to-pdf": {
      const buffer = await convertImagesToPdf(files);
      const base = files[0].filename.replace(/\.[^.]+$/, "");
      return {
        buffer,
        filename: files.length > 1 ? `${base}_merged.pdf` : `${base}.pdf`,
        contentType: "application/pdf",
      };
    }
    case "pdf-to-image": {
      const format = options?.imageFormat || "png";
      const { buffer, isZip } = await pdfToImagesWithMeta(files[0], format);
      return {
        buffer,
        filename: getImageOutputFilename(files[0].filename, format, isZip),
        contentType: isZip ? "application/zip" : format === "jpeg" ? "image/jpeg" : "image/png",
      };
    }
    case "text-to-pdf": {
      const buffer = await convertTextToPdf(files[0]);
      return {
        buffer,
        filename: outputName(files[0], "pdf"),
        contentType: "application/pdf",
      };
    }
    case "html-to-pdf": {
      const buffer = await convertHtmlToPdf(files[0]);
      return {
        buffer,
        filename: outputName(files[0], "pdf"),
        contentType: "application/pdf",
      };
    }
    case "pdf-merge": {
      if (files.length < 2) {
        throw new Error("PDF 병합은 2개 이상의 파일이 필요합니다.");
      }
      const buffer = await mergePdfs(files);
      return {
        buffer,
        filename: "merged.pdf",
        contentType: "application/pdf",
      };
    }
    case "pdf-split": {
      const buffer = await splitPdf(files[0], options);
      return {
        buffer,
        filename: outputName(files[0], "pdf").replace(/\.pdf$/, "_split.pdf"),
        contentType: "application/pdf",
      };
    }
    case "pdf-compress": {
      const buffer = await compressPdf(files[0]);
      return {
        buffer,
        filename: outputName(files[0], "pdf").replace(/\.pdf$/, "_compressed.pdf"),
        contentType: "application/pdf",
      };
    }
    default:
      throw new Error("지원하지 않는 변환 유형입니다.");
  }
}
