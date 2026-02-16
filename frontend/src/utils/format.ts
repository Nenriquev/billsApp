export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function extractYear(date: string): number {
  return new Date(date).getUTCFullYear();
}

export function getYearRange(year: number): { from: string; to: string } {
  return {
    from: new Date(year, 0, 1).toISOString(),
    to: new Date(year, 11, 31).toISOString(),
  };
}
