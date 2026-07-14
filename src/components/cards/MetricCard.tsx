import React, { ReactNode } from "react";
import { Link } from "react-router-dom";

interface MetricCardProps {
  count: number;
  title: string;
  subtext: string;
  icon: ReactNode;
  to?: string;
}

const cardClasses =
  "bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 flex flex-col justify-between transition-all hover:shadow-md h-full min-h-[130px] group";

const cardBody = (count: number, title: string, subtext: string, icon: ReactNode) => (
  <>
    {/* Top Row: Icon & Arrow */}
    <div className="flex justify-between items-start mb-4">
      <div className="w-9 h-9 bg-[#DCF9FF] text-[#447ECA] rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div className="text-gray-300 group-hover:text-gray-400 transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>
    </div>

    {/* Bottom Row: Info */}
    <div className="flex flex-col">
      <span className="text-3xl font-medium text-gray-900 leading-tight mb-1">
        {count}
      </span>
      <span className="text-[13px] text-gray-500 font-medium mb-1">
        {title}
      </span>
      <span className="text-[12px] text-[#447ECA] font-medium">
        {subtext}
      </span>
    </div>
  </>
);

const MetricCard: React.FC<MetricCardProps> = ({ count, title, subtext, icon, to }) => {
  if (to) {
    return (
      <Link to={to} className={`${cardClasses} cursor-pointer`}>
        {cardBody(count, title, subtext, icon)}
      </Link>
    );
  }

  return <div className={cardClasses}>{cardBody(count, title, subtext, icon)}</div>;
};

export default MetricCard;
