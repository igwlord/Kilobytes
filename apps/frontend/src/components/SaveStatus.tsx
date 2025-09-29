// Simple save status indicator
import React, { useState, useEffect } from 'react';

interface SaveStatusProps {
  show: boolean;
  variant?: 'success' | 'error' | 'saving';
}

const SaveStatus: React.FC<SaveStatusProps> = ({ show, variant = 'success' }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  const getIcon = () => {
    switch (variant) {
      case 'saving': return '💾';
      case 'error': return '⚠️';
      default: return '✅';
    }
  };

  const getMessage = () => {
    switch (variant) {
      case 'saving': return 'Guardando...';
      case 'error': return 'Error al guardar';
      default: return 'Guardado en la nube';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: variant === 'error' ? '#ff4444' : '#4caf50',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '14px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s ease'
    }}>
      <span>{getIcon()}</span>
      <span>{getMessage()}</span>
    </div>
  );
};

export default SaveStatus;