// Import específico para reducir el bundle size
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Fecha desconocida';
  }
}

