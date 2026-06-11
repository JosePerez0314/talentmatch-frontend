import React from "react";
import { X } from "lucide-react";

interface PillInputProps {
  label: string;
  id: string;
  placeholder: string;
  pills: string[];
  tempValue: string;
  error?: string;
  hasAttemptedSubmit?: boolean;
  theme?: "green" | "blue";
  onAddPill: (id: string, value: string) => void;
  onRemovePill: (id: string, index: number) => void;
  onChangeTemp: (id: string, value: string) => void;
}

const PillInput: React.FC<PillInputProps> = ({
  label, id, placeholder, pills, tempValue, error, hasAttemptedSubmit,
  theme = "green", onAddPill, onRemovePill, onChangeTemp
}) => {
  
  // Clases dinámicas según el tema
  const pillColor = theme === "green" 
    ? "bg-[#96FFC1] text-gray-900" 
    : "bg-[#DCF9FF] text-gray-900";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-gray-700">{label}</label>
      <div
        className={`flex flex-wrap gap-2 p-3 bg-white border rounded-xl min-h-[60px] focus-within:border-[#447ECA] focus-within:ring-4 focus-within:ring-[#447ECA]/10 transition-all ${
          hasAttemptedSubmit && error ? "border-red-400 bg-red-50/50" : "border-gray-200"
        }`}
      >
        {pills.map((pill, i) => (
          <span
            key={i}
            className={`${pillColor} text-[13px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm`}
          >
            {pill}
            <button
              type="button"
              onClick={() => onRemovePill(id, i)}
              className="hover:text-red-500 transition-colors opacity-60 hover:opacity-100"
            >
              <X size={14} strokeWidth={3} />
            </button>
          </span>
        ))}
        <input
          type="text"
          placeholder={pills.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent outline-none text-[13px] min-w-[140px] placeholder:text-gray-400 font-medium text-[#334155]"
          value={tempValue}
          onChange={(e) => onChangeTemp(id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (tempValue.trim()) onAddPill(id, tempValue);
            }
          }}
          onBlur={() => {
            if (tempValue && tempValue.trim()) onAddPill(id, tempValue);
          }}
        />
      </div>
      {hasAttemptedSubmit && error && (
        <span className="text-red-500 text-xs font-bold -mt-1">{error}</span>
      )}
    </div>
  );
};

export default PillInput;