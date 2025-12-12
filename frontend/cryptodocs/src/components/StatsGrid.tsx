import React from 'react';
import type { Stat } from '../types';

interface StatsGridProps {
  stats: Stat[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a2436] border border-[#e5e7eb] dark:border-[#324467] shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <p className="text-[#637588] dark:text-[#92a4c9] text-sm font-medium">{stat.label}</p>
            <span className="material-symbols-outlined text-secondary bg-secondary/10 p-1 rounded-md">
              {stat.icon}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-text-main dark:text-white text-2xl font-bold">{stat.value}</p>
            <p className="text-success text-sm font-medium mb-1">{stat.change}</p>
          </div>
        </div>
      ))}
    </div>
  );
};