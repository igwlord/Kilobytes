import React from 'react';

interface Props {
  goToSection: (section: string) => void;
  onDismiss: () => void;
  nombre?: string;
}

const OnboardingOverlay: React.FC<Props> = ({ goToSection, onDismiss, nombre }) => {
  const go = (section: string) => {
    // Mark as seen and navigate
    localStorage.setItem('kiloByteOnboardingSeen', '1');
    goToSection(section);
    onDismiss();
  };

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-label="Guía de inicio">
      <div className="onboarding-modal">
        <h2>¡Bienvenido{nombre ? `, ${nombre}` : ''} a KiloByte!</h2>
  <p>Dejá la app lista en 1 paso: completá tus datos y objetivos dentro de Plan y Metas.</p>

        <div className="overlay-steps">
          <div className="overlay-step">
            <div className="num">1</div>
            <div className="info">
              <div className="title">Completá tu Perfil y tus Metas</div>
              <div className="desc">Todo desde la sección Plan: datos personales + calorías y macros recomendadas</div>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => go('plan')}>Ir a Plan y Metas</button>
          </div>
        </div>

        <div className="overlay-actions">
          <button className="btn btn-primary" onClick={() => go('registro')}>Comenzar a registrar</button>
          <button className="btn btn-secondary" onClick={() => { localStorage.setItem('kiloByteOnboardingSeen', '1'); onDismiss(); }}>Completar luego</button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingOverlay;
