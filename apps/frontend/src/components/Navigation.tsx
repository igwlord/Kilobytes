import React from 'react';
import './Navigation.css';

interface NavigationProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeSection, onNavigate }) => {
  const menuItems = [
    { 
      key: 'inicio', 
      label: 'Inicio',
      icon: <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    },
    { 
      key: 'metas', 
      label: 'Metas',
      icon: <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    },
    { 
      key: 'registro', 
      label: 'Registro',
      icon: <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
    },
    { 
      key: 'calendario', 
      label: 'Calendario',
      icon: <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    },
    { 
      key: 'progreso', 
      label: 'Progreso',
      icon: <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    },
    { 
      key: 'settings', 
      label: 'Config',
      icon: <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14,12.94a7.43,7.43,0,0,0,.05-.94,7.43,7.43,0,0,0-.05-.94l2-1.56a.5.5,0,0,0,.12-.64l-1.9-3.29a.5.5,0,0,0-.6-.22l-2.35,1a7.34,7.34,0,0,0-1.63-.94l-.36-2.49A.5.5,0,0,0,12,2H8a.5.5,0,0,0-.49.41l-.36,2.49a7.34,7.34,0,0,0-1.63.94l-2.35-1a.5.5,0,0,0-.6.22L.67,8.35a.5.5,0,0,0,.12.64l2,1.56a7.43,7.43,0,0,0-.05.94,7.43,7.43,0,0,0,.05.94l-2,1.56a.5.5,0,0,0-.12.64l1.9,3.29a.5.5,0,0,0,.6.22l2.35-1a7.34,7.34,0,0,0,1.63.94l.36,2.49A.5.5,0,0,0,8,22h4a.5.5,0,0,0,.49-.41l.36-2.49a7.34,7.34,0,0,0,1.63-.94l2.35,1a.5.5,0,0,0,.6-.22l1.9-3.29a.5.5,0,0,0-.12-.64ZM10,14a4,4,0,1,1,4-4A4,4,0,0,1,10,14Z"/></svg>
    }
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="desktop-header">
        <div className="header-logo">
          <div className="logo-icon">K</div>
          <span className="logo-text">KiloByte</span>
        </div>
        
        <nav className="desktop-nav">
          {menuItems.map(item => (
            <button 
              key={item.key}
              className={`nav-link ${activeSection === item.key ? 'active' : ''}`}
              onClick={() => onNavigate(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Mobile Tab Bar */}
      <div className="mobile-tab-bar">
        {menuItems.slice(0, 5).concat(menuItems.filter(i => i.key==='settings')).map(item => (
          <button 
            key={item.key}
            className={`tab-item ${activeSection === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default Navigation;