// React import not needed explicitly with JSX transform; keep types implicit
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Welcome from './components/Welcome';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  // Initialize theme on first load based on saved profile or default to dark
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kiloByteData');
      const raw = saved ? (JSON.parse(saved)?.perfil?.theme as string | undefined) : undefined;
      // Map legacy and ensure a valid theme class is applied
      const mapLegacy = (t?: string): 'banana' | 'sandia' | 'uva' => {
        if (t === 'light') return 'banana';
        if (t === 'dark') return 'uva';
        if (t === 'banana' || t === 'sandia' || t === 'uva') return t;
        return 'uva';
      };
      const theme: 'banana' | 'sandia' | 'uva' = mapLegacy(raw);
      document.body.classList.remove('dark', 'light', 'theme-banana', 'theme-sandia', 'theme-uva');
      const classMap: Record<'banana' | 'sandia' | 'uva', string> = { banana: 'theme-banana', sandia: 'theme-sandia', uva: 'theme-uva' };
      document.body.classList.add(classMap[theme]);
      if (theme === 'uva') {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
      } else {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
      }
    } catch {
      document.body.classList.add('theme-uva');
      document.body.classList.add('dark');
    }
  }, []);

  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
