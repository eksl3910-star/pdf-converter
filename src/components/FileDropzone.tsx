"use client";

import { useCallback, useState } from "react";

type FileDropzoneProps = {
  accept: string;
  multiple: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
};

export function FileDropzone({
  accept,
  multiple,
  files,
  onFilesChange,
  disabled,
}: FileDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      if (multiple) {
        onFilesChange([...files, ...list]);
      } else {
        onFilesChange(list.slice(0, 1));
      }
    },
    [files, multiple, onFilesChange],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
      if (disabled || !event.dataTransfer.files.length) return;
      addFiles(event.dataTransfer.files);
    },
    [addFiles, disabled],
  );

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="text-4xl">📁</div>
        <p className="mt-3 text-lg font-medium text-slate-800">
          파일을 드래그하거나 클릭하여 선택
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {multiple ? "여러 파일 선택 가능" : "단일 파일"}
        </p>
      </label>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-800">{file.name}</p>
                <p className="text-sm text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={disabled}
                className="ml-4 rounded-lg px-3 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                제거
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
