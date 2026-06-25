export interface TimelinePoint {
  ts: string;
  initiated: number;
  completed: number;
  revenueCents: number;
}

export interface DashboardStats {
  total: number;
  succeeded: number;
  failed: number;
  successRate: number;
  totalRevenueCents: number;
  byMethod: Record<string, number>;
  timeline: TimelinePoint[];
}

export interface PaymentLogEntry {
  id: string;
  internalRef: string | null;
  paymobOrderId: string | null;
  eventType: string;
  method: string | null;
  amountCents: number | null;
  currency: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface PagedLogs {
  content: PaymentLogEntry[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export type Period = 'day' | 'week' | 'month';
