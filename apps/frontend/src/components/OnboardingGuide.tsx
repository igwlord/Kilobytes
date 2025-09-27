import React from 'react';

interface Props {
  goToSection: (section: string) => void;
  nombre?: string;
  needsProfile: boolean;
  needsGoals: boolean;
}

// Nueva guía: un solo paso claro para completar Perfil y Metas dentro de "Plan"
const OnboardingGuide: React.FC<Props> = ({ goToSection, nombre, needsProfile, needsGoals }) => {
  const needsSetup = needsProfile || needsGoals;
  return (
    <div className="onboarding-card" role="region" aria-label="Guía de inicio">
      <h2>¡Bienvenido{nombre ? `, ${nombre}` : ''} a KiloByte!</h2>
      <p>
        Dejá la app lista en 1 paso: en <strong>Plan y Metas</strong> vas a completar tu perfil
        (nombre, peso, altura, edad y actividad) y definir tus objetivos. Con eso calculamos
        calorías y macros para ajustar automáticamente las porciones.
      </p>

      {needsSetup && (
        <div className="onboarding-cta">
          <button className="step-cta" onClick={() => goToSection('plan')}>Ir a Plan y Metas</button>
          <div className="cta-hint">Tarda menos de 1 minuto</div>
        </div>
      )}

      <div className="onboarding-actions">
        <button className="primary" onClick={() => goToSection('registro')}>Comenzar a registrar</button>
        <button className="secondary" onClick={() => goToSection('progreso')}>Ver mi progreso</button>
      </div>
    </div>
  );
};

export default OnboardingGuide;
