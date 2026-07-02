"use client";

import { useMemo, useState } from "react";
import { ConversionCard } from "@/components/ConversionCard";
import { ConvertProgress } from "@/components/ConvertProgress";
import { FileDropzone } from "@/components/FileDropzone";
import {
  CONVERSIONS,
  ConversionOption,
  ConversionType,
} from "@/lib/types";

export default function HomePage() {
  const [selectedType, setSelectedType] = useState<ConversionType>("word-to-pdf");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "converting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const [downloadFilename, setDownloadFilename] = useState("");
  const [splitPages, setSplitPages] = useState("1");
  const [imageFormat, setImageFormat] = useState<"png" | "jpeg">("png");

  const selected = useMemo(
    () => CONVERSIONS.find((c) => c.id === selectedType)!,
    [selectedType],
  );

  const handleSelectType = (type: ConversionType) => {
    setSelectedType(type);
    setFiles([]);
    setStatus("idle");
    setErrorMessage("");
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(undefined);
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      setStatus("error");
      setErrorMessage("파일을 선택해 주세요.");
      return;
    }

    if (selectedType === "pdf-merge" && files.length < 2) {
      setStatus("error");
      setErrorMessage("PDF 병합은 2개 이상의 파일이 필요합니다.");
      return;
    }

    setStatus("converting");
    setErrorMessage("");
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(undefined);

    const formData = new FormData();
    formData.append("type", selectedType);
    files.forEach((file) => formData.append("files", file));

    const options: ConversionOption = {};
    if (selectedType === "pdf-split") options.splitPages = splitPages;
    if (selectedType === "pdf-to-image") options.imageFormat = imageFormat;
    formData.append("options", JSON.stringify(options));

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "변환에 실패했습니다.");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] || `converted.${selected.outputExt}`;

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadFilename(filename);
      setStatus("done");
    } catch (error) {
      setStatus("error");
      const totalSize = files.reduce((sum, f) => sum + f.size, 0);
      const sizeMb = totalSize / 1024 / 1024;
      if (error instanceof TypeError || (error instanceof Error && /failed|network|fetch/i.test(error.message))) {
        setErrorMessage(
          sizeMb > 50
            ? `큰 파일(${sizeMb.toFixed(0)}MB)은 공개 URL에서 실패할 수 있습니다. http://localhost:13000 에서 시도하세요.`
            : "네트워크 오류입니다. START.bat 창이 켜져 있는지 확인하거나 http://localhost:13000 에서 시도하세요.",
        );
      } else {
        setErrorMessage(error instanceof Error ? error.message : "변환에 실패했습니다.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">파일 변환</h1>
          <p className="mt-2 text-slate-600">
            Word, Excel, PDF, 이미지 등 다양한 형식을 빠르게 변환하세요
          </p>
          <p className="mt-1 text-sm text-slate-500">
            큰 파일(50MB+)은 공개 URL보다 http://localhost:13000 권장
          </p>
        </header>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">변환 유형 선택</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CONVERSIONS.map((conversion) => (
              <ConversionCard
                key={conversion.id}
                conversion={conversion}
                selected={selectedType === conversion.id}
                onSelect={handleSelectType}
              />
            ))}
          </div>
        </section>

        <section className="mb-6 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-slate-200 backdrop-blur">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            {selected.label} — 파일 업로드
          </h2>

          {selectedType === "pdf-split" && (
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                페이지 범위 (예: 1-3,5)
              </label>
              <input
                type="text"
                value={splitPages}
                onChange={(e) => setSplitPages(e.target.value)}
                className="w-full max-w-xs rounded-xl border border-slate-300 px-4 py-2"
                placeholder="1-3,5"
              />
            </div>
          )}

          {selectedType === "pdf-to-image" && (
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                이미지 형식
              </label>
              <select
                value={imageFormat}
                onChange={(e) => setImageFormat(e.target.value as "png" | "jpeg")}
                className="rounded-xl border border-slate-300 px-4 py-2"
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
              </select>
            </div>
          )}

          <FileDropzone
            accept={selected.accept}
            multiple={selected.multiple}
            files={files}
            onFilesChange={setFiles}
            disabled={status === "converting"}
          />

          <button
            type="button"
            onClick={handleConvert}
            disabled={status === "converting" || files.length === 0}
            className="mt-6 w-full rounded-2xl bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-12"
          >
            {status === "converting" ? "변환 중..." : "변환하기"}
          </button>
        </section>

        <ConvertProgress
          status={status}
          message={errorMessage}
          downloadUrl={downloadUrl}
          downloadFilename={downloadFilename}
        />
      </div>
    </main>
  );
}
