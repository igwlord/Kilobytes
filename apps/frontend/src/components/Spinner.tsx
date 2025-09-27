import React from 'react';
import './Spinner.css';

const Spinner: React.FC<{ label?: string; tight?: boolean }>
  = ({ label = 'Cargando…', tight = false }) => {
  return (
    <div className={`spinner ${tight ? 'tight' : 'centered'}`} role="status" aria-live="polite">
      <div className="spinner-wheel" aria-hidden="true" />
      {label ? <span className="spinner-label">{label}</span> : null}
    </div>
  );
};

export default Spinner;
