import React from "react";

const MovementCard = ({ title, value }) => {
  return (
    <div className="bg-white p-7 rounded-[20px] shadow-sm border border-white text-center">
      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest italic">
        {title}
      </p>
      <p className="text-[#447ECA] font-bold mt-2 text-sm">
        {value}
      </p>
    </div>
  );
};

export default MovementCard;