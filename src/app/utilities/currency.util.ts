export function formatINR(amount: number): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function parseAmount(str: string): number {
  if (!str) return 0;
  const cleanStr = str.replace(/[₹, \s]/g, '');
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
}
