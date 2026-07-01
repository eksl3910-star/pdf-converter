"use client";

import { ConversionDefinition } from "@/lib/types";

type ConversionCardProps = {
  conversion: ConversionDefinition;
  selected: boolean;
  onSelect: (id: ConversionDefinition["id"]) => void;
};

export function ConversionCard({ conversion, selected, onSelect }: ConversionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(conversion.id)}
      className={`rounded-2xl p-5 text-left transition shadow-sm ring-1 ${
        selected
          ? "bg-blue-600 text-white ring-blue-600 shadow-md"
          : "bg-white text-slate-800 ring-slate-200 hover:ring-blue-300 hover:shadow-md"
      }`}
    >
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${
          selected ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-700"
        }`}
      >
        {conversion.icon}
      </div>
      <h3 className="font-semibold">{conversion.label}</h3>
      <p className={`mt-1 text-sm ${selected ? "text-blue-100" : "text-slate-500"}`}>
        {conversion.description}
      </p>
    </button>
  );
}
