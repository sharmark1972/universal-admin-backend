export function countTableColumns(tableHtml: string): number {
  const firstRowMatch = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/i);
  if (!firstRowMatch) return 0;

  const firstRowHtml = firstRowMatch[1];
  const cellCount = (firstRowHtml.match(/<th[^>]*>/gi) || []).length +
    (firstRowHtml.match(/<td[^>]*>/gi) || []).length;

  return cellCount > 0 ? cellCount : 0;
}

export function isWideTable(tableHtml: string): boolean {
  const columns = countTableColumns(tableHtml);
  return columns >= 4;
}
