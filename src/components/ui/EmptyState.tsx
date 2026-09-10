import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  subMessage?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, message, subMessage, className = '', style }) => {
  return (
    <div 
      className={`flex flex-col items-center justify-center p-8 text-center bg-white border border-[#E6E2DB] rounded-[20px] ${className}`}
      style={{ minHeight: '160px', ...style }}
    >
      <div className="mb-4 text-slate-400">
        {icon}
      </div>
      <p className="text-[17px] font-extrabold text-[#2D2422]">{message}</p>
      {subMessage && (
        <p className="text-[15px] font-semibold text-[#6D5E5B] mt-2 max-w-sm">
          {subMessage}
        </p>
      )}
    </div>
  );
};
