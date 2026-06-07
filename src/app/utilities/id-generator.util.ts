export function generateId(prefix: string): string {
  const randomHex = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  return `${prefix}-${randomHex}`;
}
