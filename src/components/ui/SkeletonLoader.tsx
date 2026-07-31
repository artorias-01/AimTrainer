import React from 'react';

export const ScenarioCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-5 space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-3 bg-[#262626] rounded w-24" />
        <div className="h-3 bg-[#262626] rounded w-16" />
      </div>
      <div className="h-6 bg-[#262626] rounded w-3/4" />
      <div className="h-4 bg-[#262626] rounded w-full" />
      <div className="h-4 bg-[#262626] rounded w-2/3" />
      <div className="pt-2 flex justify-between items-center">
        <div className="h-3 bg-[#262626] rounded w-20" />
        <div className="h-8 bg-[#262626] rounded-xl w-28" />
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-[#141414] border border-[#262626] rounded-[12px] p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-[#262626] rounded w-36" />
        <div className="h-4 bg-[#262626] rounded w-20" />
      </div>
      <div className="h-48 bg-[#0d0d0d] rounded-lg w-full" />
    </div>
  );
};
