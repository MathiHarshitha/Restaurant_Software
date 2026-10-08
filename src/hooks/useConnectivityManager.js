import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { selectIsOnline, setNetworkOnline, syncNow } from '../store/connectivitySlice';

const RETRY_MS = 30_000;

/**
 * Mount once (in the app layout). Watches the browser's network state, announces
 * offline/online transitions and pushes pending bills as soon as the connection returns.
 */
export function useConnectivityManager() {
  const dispatch = useDispatch();
  const isOnline = useSelector(selectIsOnline);
  const previous = useRef(isOnline);

  useEffect(() => {
    const on = () => dispatch(setNetworkOnline(true));
    const off = () => dispatch(setNetworkOnline(false));
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    // Background safety net: retry anything still pending.
    const timer = setInterval(() => dispatch(syncNow()), RETRY_MS);
    dispatch(syncNow());
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      clearInterval(timer);
    };
  }, [dispatch]);

  useEffect(() => {
    if (previous.current === isOnline) return;
    previous.current = isOnline;

    if (!isOnline) {
      toast.warning('Offline Mode', {
        description: 'Billing is still available. Bills will sync automatically when the connection is restored.',
        duration: 6000,
      });
      return;
    }

    const id = toast.loading('Internet connection restored.', { description: 'Synchronizing offline bills…' });
    dispatch(syncNow())
      .unwrap()
      .then(({ synced }) => {
        toast.success('Internet connection restored.', {
          id,
          description: synced
            ? `${synced} offline ${synced === 1 ? 'bill' : 'bills'} synchronized successfully.`
            : 'All bills are already up to date.',
          duration: 6000,
        });
      })
      .catch((err) => {
        if (err?.name === 'ConditionError') { toast.dismiss(id); return; }
        toast.error('Sync could not finish', { id, description: 'Bills are safe on this device. We will retry automatically.' });
      });
  }, [isOnline, dispatch]);
}
