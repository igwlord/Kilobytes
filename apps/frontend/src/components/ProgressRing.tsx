import React from 'react';

interface ProgressRingProps {
  value: number;
  maxValue: number;
  color: string;
  size?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ 
  value, 
  maxValue,
  color, 
  size = 80 
}) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const strokeDasharray = `${Math.min(100, percentage)}, 100`;

  return (
    <div className="progress-ring-container" style={{ width: size, height: size }}>
      <svg 
        className="progress-ring" 
        viewBox="0 0 36 36"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="var(--border-color)"
          strokeWidth="2"
        />
        {/* Progress circle */}
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={strokeDasharray}
        />
      </svg>
      <div className="progress-percentage">
        {Math.round(percentage)}%
      </div>
    </div>
  );
};

export default ProgressRing;