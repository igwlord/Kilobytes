// React import not needed explicitly with JSX transform; keep types implicit
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Welcome from './components/Welcome';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  // Initialize theme on first load based on saved profile or default to dark
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kiloByteData');
      const theme = saved ? (JSON.parse(saved)?.perfil?.theme as string | undefined) : undefined;
      const isDark = (theme ?? 'dark') === 'dark';
      document.body.classList.toggle('dark', isDark);
      document.body.classList.toggle('light', !isDark);
    } catch {
      document.body.classList.add('dark');
    }
  }, []);

  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
