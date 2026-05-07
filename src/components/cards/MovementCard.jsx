import React from "react";

const MovementCard = ({ title, value }) => {
  let safeValue = value;

  // If an object { title: "" } arrives, an attempt is made to extract the text
  if (typeof value === "object" && value !== null) {
    safeValue = value.title || value.fullName || value.name || "";
  }

  // If value is false, null, undefined, or an empty string "", text comes out
  if (!safeValue || String(safeValue).trim() === "") {
    safeValue = "Documento sin identificar";
  }

  return (
    <div className="bg-white p-7 rounded-[20px] shadow-sm border border-white text-center">
      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest italic">
        {title}
      </p>
      {/* conversion to String for safety */}
      <p className="text-[#447ECA] font-bold mt-2 text-sm truncate px-2" title={String(safeValue)}>
        {String(safeValue)}
      </p>
    </div>
  );
};

export default MovementCard;