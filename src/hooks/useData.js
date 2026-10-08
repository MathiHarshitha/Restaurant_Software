import { useLiveQuery } from 'dexie-react-hooks';
import { menuService } from '../services/menuService';
import { settingsService } from '../services/settingsService';
import { syncService } from '../services/syncService';
import { reportService } from '../services/reportService';

// Live hooks: each re-runs automatically when the underlying IndexedDB data changes,
// so a bill created on the Billing screen instantly updates the dashboard and reports.

export const useMenuItems = () => useLiveQuery(() => menuService.getMenuItems(), []);

export const useRestaurant = () => useLiveQuery(() => settingsService.getRestaurant(), []);

export const usePendingBillCount = () => useLiveQuery(() => syncService.countPending(), [], 0);

export const useSyncMeta = () => useLiveQuery(() => syncService.getMeta(), []);

export const useSyncLogs = (limit = 6) => useLiveQuery(() => syncService.getRecentLogs(limit), [limit]);

export const useDashboard = () => useLiveQuery(() => reportService.getDashboard(), []);

export const useSalesTrend = (rangeKey) => useLiveQuery(() => reportService.getSalesTrend(rangeKey), [rangeKey]);

export const useReport = (type, anchor) => useLiveQuery(() => reportService.getReport(type, anchor), [type, anchor]);
