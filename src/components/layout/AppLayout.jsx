import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'sonner';
import Sidebar from './Sidebar';
import { useConnectivityManager } from '../../hooks/useConnectivityManager';

export default function AppLayout() {
  const user = useSelector((s) => s.auth.user);
  useConnectivityManager();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 px-8 py-7">
          <Outlet />
        </div>
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{ className: 'text-sm' }}
        richColors
        closeButton
      />
    </div>
  );
}
