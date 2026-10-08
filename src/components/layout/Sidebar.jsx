import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart2, FileText, LayoutDashboard, LogOut, Menu, Receipt, Settings, UtensilsCrossed, Wifi, WifiOff,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { logout } from '../../store/authSlice';
import { selectIsOnline, setSimulatedOffline } from '../../store/connectivitySlice';
import { usePendingBillCount, useRestaurant } from '../../hooks/useData';
import logoSrc from '/logo.jpeg';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/billing',   icon: Receipt,         label: 'Billing' },
  { to: '/menu',      icon: UtensilsCrossed, label: 'Menu' },
  { to: '/bills',     icon: FileText,        label: 'Bills' },
  { to: '/reports',   icon: BarChart2,       label: 'Reports' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
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
    <aside className="flex h-full w-[228px] shrink-0 flex-col" style={{ background: '#282623' }}>
      {/* Logo */}
      <div className="flex flex-col items-center px-4 py-5 border-b border-white/10">
        <img
          src={logoSrc}
          alt="Connect Family Restaurant & Dhaba"
          className="h-[72px] w-auto object-contain"
          draggable={false}
        />
        <div className="mt-2 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest leading-none" style={{ color: '#D4AF6B' }}>
            Billing & Management
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2.5 py-3">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'text-white'
                  : 'text-white/55 hover:text-white/90',
              )
            }
            style={({ isActive }) => isActive ? { background: '#7A1E23', boxShadow: '0 1px 4px #7A1E2360' } : {}}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={17}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  style={isActive ? { color: '#D4AF6B' } : {}}
                />
                <span className="flex-1">{label}</span>
                {label === 'Bills' && pending > 0 && (
                  <span
                    className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold"
                    style={{ background: '#D4AF6B', color: '#282623' }}
                  >
                    {pending > 99 ? '99+' : pending}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Gold divider */}
      <div className="mx-4 h-px" style={{ background: 'linear-gradient(90deg,transparent,#D4AF6B50,transparent)' }} />

      {/* Bottom section */}
      <div className="px-2.5 py-3 space-y-1">
        {/* Restaurant info */}
        <div className="px-3 py-2">
          <p className="text-[12px] font-semibold text-white truncate">
            {restaurant?.name || 'Connect Family Restaurant & Dhaba'}
          </p>
          {restaurant?.address && (
            <p className="text-[11px] truncate" style={{ color: '#D4AF6B80' }}>
              {restaurant.address.split(',')[0]}
            </p>
          )}
        </div>

        {/* Online/offline — double-click to simulate offline for demo */}
        <button
          type="button"
          title="Double-click to simulate offline mode"
          onDoubleClick={() => dispatch(setSimulatedOffline(!simOffline))}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/6"
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
            <span className="ml-auto text-[11px]" style={{ color: '#D4AF6B80' }}>{pending} pending</span>
          )}
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/40 transition-colors hover:bg-white/6 hover:text-white/80"
        >
          <LogOut size={15} />
          <span className="text-[13px]">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
