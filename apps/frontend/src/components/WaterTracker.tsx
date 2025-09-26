import React from 'react';
import './WaterTracker.css';

export interface WaterTrackerProps {
  targetMl: number;           // Objetivo diario en ml
  consumedMl: number;         // Consumido hoy en ml
  onChange: (ml: number) => void;
  glassSizeMl?: number;       // Tamaño del vaso (default 250ml)
  maxOverfillRatio?: number;  // Permite excedente visual (default 1.5 => 150%)
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const WaterTracker: React.FC<WaterTrackerProps> = ({
  targetMl,
  consumedMl,
  onChange,
  glassSizeMl = 250,
  maxOverfillRatio = 1.5,
}) => {
  const totalCups = Math.max(1, Math.ceil(targetMl / glassSizeMl));
  const cupsConsumed = Math.floor(consumedMl / glassSizeMl);
  const remainder = consumedMl % glassSizeMl; // para vaso parcial

  const setByCupIndex = (idx: number) => {
    // idx es 0-based; queremos fijar a (idx+1) vasos, con toggle si ya está lleno y es el último
    if (idx + 1 === cupsConsumed && remainder === 0) {
      // si clic en el último vaso lleno exacto, reducimos a idx vasos
      const newMl = clamp(idx * glassSizeMl, 0, Math.round(targetMl * maxOverfillRatio));
      onChange(newMl);
      return;
    }
    const newMl = clamp((idx + 1) * glassSizeMl, 0, Math.round(targetMl * maxOverfillRatio));
    onChange(newMl);
  };

  const inc = () => onChange(clamp(consumedMl + glassSizeMl, 0, Math.round(targetMl * maxOverfillRatio)));
  const dec = () => onChange(clamp(consumedMl - glassSizeMl, 0, Math.round(targetMl * maxOverfillRatio)));

  const progress = targetMl > 0 ? Math.min(1, consumedMl / targetMl) : 0;

  return (
    <div className="water-tracker">
      <div className="water-cups" role="group" aria-label="Hidratación diaria">
        {Array.from({ length: totalCups }).map((_, i) => {
          let fillRatio = 0;
          if (i < cupsConsumed) fillRatio = 1;
          if (i === cupsConsumed && remainder > 0) fillRatio = remainder / glassSizeMl;
          return (
            <button
              key={i}
              className={`glass ${fillRatio >= 1 ? 'filled' : fillRatio > 0 ? 'partial' : 'empty'}`}
              aria-pressed={fillRatio > 0}
              aria-label={`Vaso ${i + 1} de ${totalCups} (${fillRatio >= 1 ? 'lleno' : fillRatio > 0 ? 'parcial' : 'vacío'})`}
              onClick={() => setByCupIndex(i)}
            >
              <span className="glass-fill" style={{ height: `${Math.max(0, Math.min(1, fillRatio)) * 100}%` }} />
            </button>
          );
        })}
      </div>

      <div className="water-actions">
        <button className="wb-btn" onClick={dec} title="-1 vaso">−</button>
        <button className="wb-btn" onClick={inc} title="+1 vaso">+1</button>
      </div>

      <div className="water-info">
        <div className="bar"><div className="bar-fill" style={{ width: `${progress * 100}%` }} /></div>
        <div className="text">
          {(consumedMl / 1000).toFixed(2)} / {(targetMl / 1000).toFixed(2)} L · {Math.floor(consumedMl / glassSizeMl)} de {totalCups} vasos
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;
