import React from "react";

const PillInput = ({ label, id, placeholder, pills, tempValue, error, hasAttemptedSubmit, onAddPill, onRemovePill, onChangeTemp, }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold">{label}</label>
      <div
        className={`flex flex-wrap gap-2 p-3 bg-[#F8F9FA] border rounded-xl min-h-[60px] focus-within:border-[#447ECA] transition-all ${
          hasAttemptedSubmit && error ? "border-red-500" : "border-[#D4D4DA]"
        }`}
      >
        {pills.map((pill, i) => (
          <span
            key={i}
            className="bg-[#96FFC1] text-black text-[10px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-2 uppercase"
          >
            {pill}
            <button
              type="button"
              onClick={() => onRemovePill(id, i)}
              className="hover:text-red-600 font-bold ml-1"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          placeholder={pills.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent outline-none text-sm min-w-[140px] placeholder:text-gray-400 font-medium"
          value={tempValue}
          onChange={(e) => onChangeTemp(id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddPill(id, e.target.value);
            }
          }}
          onBlur={(e) => onAddPill(id, e.target.value)}
        />
      </div>
      {hasAttemptedSubmit && error && (
        <span className="text-red-500 text-xs font-bold italic">{error}</span>
      )}
    </div>
  );
};

export default PillInput;