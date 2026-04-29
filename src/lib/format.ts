export function krw(n: number): string {
  return `₩${n.toLocaleString('ko-KR')}`;
}

export function discountRate(original: number, sale: number): number {
  if (original <= 0 || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
}
