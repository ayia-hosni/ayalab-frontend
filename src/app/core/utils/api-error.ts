export function parseApiError(err: any): string {
  const status: number = err?.status ?? 0;
  const body = err?.error;

  if (status >= 500) {
    return 'Payment service is temporarily unavailable. Please try again in a moment.';
  }

  // Spring Boot error body: { error, message, ... }
  const detail: string = body?.message ?? body?.error ?? '';

  if (status === 400 && detail) return detail;
  if (status === 422 && detail) return detail;

  return detail || 'Something went wrong. Please try again.';
}
