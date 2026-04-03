import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.locale('es');

export function formatDuration(seconds: number): string {
  const d = dayjs.duration(seconds, 'seconds');
  if (d.hours() > 0) {
    return `${d.hours()}h ${d.minutes()}m`;
  }
  return `${d.minutes()}m ${d.seconds().toString().padStart(2, '0')}s`;
}

export function formatDurationShort(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatWeight(kg: number, unit: 'metric' | 'imperial'): string {
  if (unit === 'imperial') {
    return `${(kg * 2.20462).toFixed(1)} lb`;
  }
  return `${kg} kg`;
}

export function kgToDisplay(kg: number, unit: 'metric' | 'imperial'): number {
  if (unit === 'imperial') return parseFloat((kg * 2.20462).toFixed(1));
  return kg;
}

export function displayToKg(value: number, unit: 'metric' | 'imperial'): number {
  if (unit === 'imperial') return parseFloat((value / 2.20462).toFixed(2));
  return value;
}

export function formatVolume(kg: number, unit: 'metric' | 'imperial'): string {
  const value = unit === 'imperial' ? kg * 2.20462 : kg;
  const suffix = unit === 'imperial' ? 'lb' : 'kg';
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k ${suffix}`;
  return `${value.toFixed(0)} ${suffix}`;
}

export function formatDate(date: string | Date): string {
  return dayjs(date).format('D [de] MMM');
}

export function formatDateFull(date: string | Date): string {
  return dayjs(date).format('dddd, D [de] MMMM');
}

export function formatRelative(date: string | Date): string {
  return dayjs(date).fromNow();
}

export function formatTime(date: string | Date): string {
  return dayjs(date).format('HH:mm');
}

export function isToday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

export function isThisWeek(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs(), 'week');
}
