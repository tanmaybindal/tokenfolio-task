import {
  DASHBOARD_DEFAULT_VIEW,
  DASHBOARD_VIEW,
  type DashboardView,
} from '@/app/(dashboard)/_constants/dashboard';
import { Service } from '@/types';

export const VIEW_KEY = 'dashboard-view';
const VIEW_VALUES = Object.values(DASHBOARD_VIEW) as readonly DashboardView[];

export function isView(
  value: string | null | undefined,
): value is DashboardView {
  return !!value && (VIEW_VALUES as readonly string[]).includes(value);
}

export function subscribeViewStore(cb: () => void) {
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
}

export function getViewSnapshot(): DashboardView {
  const storedView = localStorage.getItem(VIEW_KEY);
  return storedView && isView(storedView) ? storedView : DASHBOARD_DEFAULT_VIEW;
}

export function getViewServerSnapshot(): DashboardView {
  return DASHBOARD_DEFAULT_VIEW;
}

export function setView(value: DashboardView) {
  localStorage.setItem(VIEW_KEY, value);
  window.dispatchEvent(
    new StorageEvent('storage', { key: VIEW_KEY, newValue: value }),
  );
}

export async function fetchServices(): Promise<Service[]> {
  const res = await fetch('/api/services');
  if (!res.ok) throw new Error('Failed to fetch services');
  return res.json();
}
