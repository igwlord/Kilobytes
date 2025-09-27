import React from 'react';

const Spinner: React.FC<{ label?: string; tight?: boolean }>
  = ({ label = 'Cargando…', tight = false }) => {
  return (
    <div className={`spinner ${tight ? 'tight' : ''}`} role="status" aria-live="polite">
      <div className="spinner-dot" aria-hidden="true" />
      <div className="spinner-dot" aria-hidden="true" />
      <div className="spinner-dot" aria-hidden="true" />
      <span className="spinner-label">{label}</span>
    </div>
  );
};

export default Spinner;
