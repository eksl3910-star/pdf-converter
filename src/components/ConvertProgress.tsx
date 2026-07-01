"use client";

type ConvertProgressProps = {
  status: "idle" | "converting" | "done" | "error";
  message?: string;
  downloadUrl?: string;
  downloadFilename?: string;
};

export function ConvertProgress({
  status,
  message,
  downloadUrl,
  downloadFilename,
}: ConvertProgressProps) {
  if (status === "idle") return null;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      {status === "converting" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="font-medium text-slate-800">변환 중...</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-500" />
          </div>
        </div>
      )}

      {status === "done" && downloadUrl && (
        <div className="space-y-3">
          <p className="font-medium text-green-700">변환이 완료되었습니다!</p>
          <a
            href={downloadUrl}
            download={downloadFilename}
            className="inline-flex items-center rounded-xl bg-green-600 px-5 py-3 font-medium text-white hover:bg-green-700"
          >
            다운로드
          </a>
        </div>
      )}

      {status === "error" && (
        <p className="font-medium text-red-600">{message || "변환에 실패했습니다."}</p>
      )}
    </div>
  );
}
