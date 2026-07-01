export type ConversionType =
  | "word-to-pdf"
  | "excel-to-pdf"
  | "ppt-to-pdf"
  | "pdf-to-word"
  | "image-to-pdf"
  | "pdf-to-image"
  | "text-to-pdf"
  | "html-to-pdf"
  | "pdf-merge"
  | "pdf-split"
  | "pdf-compress";

export type ConversionOption = {
  pageRange?: string;
  imageFormat?: "png" | "jpeg";
  splitPages?: string;
};

export type ConversionDefinition = {
  id: ConversionType;
  label: string;
  description: string;
  accept: string;
  multiple: boolean;
  icon: string;
  outputExt: string;
};

export const CONVERSIONS: ConversionDefinition[] = [
  {
    id: "word-to-pdf",
    label: "Word → PDF",
    description: "DOCX, DOC 파일을 PDF로 변환",
    accept: ".docx,.doc,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    multiple: false,
    icon: "W",
    outputExt: "pdf",
  },
  {
    id: "excel-to-pdf",
    label: "Excel → PDF",
    description: "XLSX, XLS 파일을 PDF로 변환",
    accept: ".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    multiple: false,
    icon: "X",
    outputExt: "pdf",
  },
  {
    id: "ppt-to-pdf",
    label: "PowerPoint → PDF",
    description: "PPTX, PPT 파일을 PDF로 변환",
    accept: ".pptx,.ppt,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
    multiple: false,
    icon: "P",
    outputExt: "pdf",
  },
  {
    id: "pdf-to-word",
    label: "PDF → Word",
    description: "PDF 파일을 DOCX로 변환",
    accept: ".pdf,application/pdf",
    multiple: false,
    icon: "D",
    outputExt: "docx",
  },
  {
    id: "image-to-pdf",
    label: "이미지 → PDF",
    description: "JPG, PNG, WEBP를 PDF로 변환",
    accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp",
    multiple: true,
    icon: "I",
    outputExt: "pdf",
  },
  {
    id: "pdf-to-image",
    label: "PDF → 이미지",
    description: "PDF 각 페이지를 PNG/JPEG로 변환 (ZIP)",
    accept: ".pdf,application/pdf",
    multiple: false,
    icon: "G",
    outputExt: "zip",
  },
  {
    id: "text-to-pdf",
    label: "텍스트 → PDF",
    description: "TXT 파일을 PDF로 변환",
    accept: ".txt,text/plain",
    multiple: false,
    icon: "T",
    outputExt: "pdf",
  },
  {
    id: "html-to-pdf",
    label: "HTML → PDF",
    description: "HTML 파일을 PDF로 변환",
    accept: ".html,.htm,text/html",
    multiple: false,
    icon: "H",
    outputExt: "pdf",
  },
  {
    id: "pdf-merge",
    label: "PDF 병합",
    description: "여러 PDF를 하나로 합치기",
    accept: ".pdf,application/pdf",
    multiple: true,
    icon: "M",
    outputExt: "pdf",
  },
  {
    id: "pdf-split",
    label: "PDF 분할",
    description: "PDF에서 특정 페이지 추출 (예: 1-3,5)",
    accept: ".pdf,application/pdf",
    multiple: false,
    icon: "S",
    outputExt: "pdf",
  },
  {
    id: "pdf-compress",
    label: "PDF 압축",
    description: "PDF 파일 크기 줄이기",
    accept: ".pdf,application/pdf",
    multiple: false,
    icon: "C",
    outputExt: "pdf",
  },
];

export type ConvertResult = {
  buffer: Buffer;
  filename: string;
  contentType: string;
};

export type InputFile = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
};
