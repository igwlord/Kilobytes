import React from 'react';

interface Props {
  goToSection: (section: string) => void;
  nombre?: string;
  needsProfile: boolean;
  needsGoals: boolean;
}

const OnboardingGuide: React.FC<Props> = ({ goToSection, nombre, needsProfile, needsGoals }) => {
  return (
    <div className="onboarding-card" role="region" aria-label="Guía de inicio">
      <h2>¡Bienvenido{nombre ? `, ${nombre}` : ''} a KiloByte!</h2>
      <p>Arrancá en 2 pasos. Completá tus datos y objetivos para que las porciones y metas se adapten a vos.</p>

      <ol className="onboarding-steps">
        <li className={needsProfile ? '' : 'done'}>
          <span className="step-title">Completá tu perfil</span>
          <span className="step-desc">Nombre, peso, altura, edad y nivel de actividad</span>
          <button className="step-cta" onClick={() => goToSection('perfil')}>Ir a Perfil</button>
        </li>
        <li className={needsGoals ? '' : 'done'}>
          <span className="step-title">Definí tus metas</span>
          <span className="step-desc">Calorías diarias y macros recomendadas</span>
          <button className="step-cta" onClick={() => goToSection('plan')}>Ir a Metas</button>
        </li>
      </ol>

      <div className="onboarding-actions">
        <button className="primary" onClick={() => goToSection('registro')}>Comenzar a registrar</button>
        <button className="secondary" onClick={() => goToSection('progreso')}>Ver mi progreso</button>
      </div>
    </div>
  );
};

export default OnboardingGuide;
