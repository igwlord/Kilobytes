import React from 'react';
import './PlateLoader.css';

type Props = {
  label?: string;
  tight?: boolean;
};

const PlateLoader: React.FC<Props> = ({ label = 'Cocinando…', tight = false }) => {
  return (
    <div className={`plate-loader ${tight ? 'tight' : 'centered'}`} role="status" aria-live="polite">
      <div className="plate">
        <div className="food food-1" />
        <div className="food food-2" />
        <div className="food food-3" />
      </div>
      {label ? <span className="plate-label">{label}</span> : null}
    </div>
  );
};

export default PlateLoader;
