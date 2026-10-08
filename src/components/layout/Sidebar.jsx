import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart2, FileText, LayoutDashboard, LogOut, Menu, Receipt, Settings, UtensilsCrossed, Wifi, WifiOff,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { logout } from '../../store/authSlice';
import { selectIsOnline, setSimulatedOffline } from '../../store/connectivitySlice';
import { usePendingBillCount, useRestaurant } from '../../hooks/useData';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/billing', icon: Receipt, label: 'Billing' },
  { to: '/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/bills', icon: FileText, label: 'Bills' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOnline = useSelector(selectIsOnline);
  const simOffline = useSelector((s) => s.connectivity.simulatedOffline);
  const pending = usePendingBillCount();
  const restaurant = useRestaurant();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-ink-900/[0.06] bg-brand-900">
      {/* Logo */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
            <UtensilsCrossed size={16} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50">Restaurant</p>
            <p className="text-[13px] font-bold leading-none text-white">Billing</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2.5 py-2">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/8 hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="flex-1">{label}</span>
                {label === 'Bills' && pending > 0 && (
                  <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-amber-900">
                    {pending > 99 ? '99+' : pending}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/10 px-2.5 py-3 space-y-1">
        {/* Restaurant profile */}
        <div className="px-3 py-2">
          <p className="text-[12px] font-semibold text-white truncate">{restaurant?.name || 'Connect Dhaba'}</p>
          <p className="text-[11px] text-white/50 truncate">{restaurant?.address?.split(',')[0]}</p>
        </div>

        {/* Online/offline status — double-click to simulate offline for demo */}
        <button
          type="button"
          title="Double-click to simulate offline mode"
          onDoubleClick={() => dispatch(setSimulatedOffline(!simOffline))}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/8"
        >
          {isOnline ? (
            <Wifi size={15} className="text-emerald-400" />
          ) : (
            <WifiOff size={15} className="text-amber-400" />
          )}
          <span className={cn('text-[12px] font-medium', isOnline ? 'text-emerald-400' : 'text-amber-400')}>
            {isOnline ? 'Online' : simOffline ? 'Offline (Demo)' : 'Offline'}
          </span>
          {pending > 0 && (
            <span className="ml-auto text-[11px] text-white/40">{pending} pending</span>
          )}
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/8 hover:text-white"
        >
          <LogOut size={15} />
          <span className="text-[13px]">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
