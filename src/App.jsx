import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ensureSeeded } from './database/seed';
import SeedingScreen from './components/layout/SeedingScreen';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Bills from './pages/Bills';
import Menu from './pages/Menu';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function Root() {
  const [seeded, setSeeded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Starting up…');

  const seed = useCallback(async () => {
    await ensureSeeded((p, msg) => {
      setProgress(p);
      if (msg) setMessage(msg);
    });
    setSeeded(true);
  }, []);

  useEffect(() => { seed(); }, [seed]);

  if (!seeded) return <SeedingScreen progress={progress} message={message} />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </Provider>
  );
}
