import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  sublabel?: string;
  colorClass?: string;
  heightClass?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  sublabel,
  colorClass = 'bg-gradient-to-r from-indigo-500 to-purple-600',
  heightClass = 'h-2',
  showPercentage = false,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      {(label || sublabel || showPercentage) && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          <span className="text-slate-300">{label}</span>
          <span className="text-slate-400">
            {sublabel || (showPercentage ? `${Math.round(percentage)}%` : '')}
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/40 ${heightClass}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
