import React, { ReactNode } from "react";
import { Link } from "react-router-dom";

interface MetricCardProps {
  count: number;
  title: string;
  subtext: string;
  icon: ReactNode;
  to?: string;
}

// FIX: Estandarizamos a rounded-2xl (16px) para coincidir con todo el sistema
const cardClasses =
  "bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all hover:shadow-md h-full min-h-[130px] group";

const MetricCard: React.FC<MetricCardProps> = ({ count, title, subtext, icon, to }) => {
  const cardBody = (
    <>
      {/* Top Row: Icon & Arrow */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-9 h-9 bg-[#DCF9FF] text-[#447ECA] rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
          {icon}
        </div>
        <div className="text-gray-300 group-hover:text-gray-400 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>

      {/* Bottom Row: Info */}
      <div className="flex flex-col">
        <span className="text-3xl font-bold text-gray-900 leading-tight mb-1 tracking-tight">
          {count}
        </span>
        <span className="text-[13px] text-gray-500 font-semibold mb-0.5">
          {title}
        </span>
        <span className="text-xs text-[#447ECA] font-medium">
          {subtext}
        </span>
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${cardClasses} cursor-pointer`}>
        {cardBody}
      </Link>
    );
  }

  return <div className={cardClasses}>{cardBody}</div>;
};

export default MetricCard;